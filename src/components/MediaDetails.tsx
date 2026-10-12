import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, Play, X } from 'lucide-react';
import { StreamPlayer } from '@/components/StreamPlayer';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ShareButton } from '@/components/ShareButton';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { SeasonEpisodes } from '@/components/SeasonEpisodes';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/Seo';
import { Credits } from '@/components/title/Credits';
import { TitleActions } from '@/components/title/TitleActions';
import { TitleHero } from '@/components/title/TitleHero';
import { TitleSkeleton } from '@/components/title/TitleSkeleton';
import { WhereToWatch } from '@/components/title/WhereToWatch';
import { episodeCode, formatCurrency } from '@/components/title/format';
import { RatingScale, SectionHeader, Slate, type SlateRow } from '@/components/reel';
import { Button } from '@/components/ui/button';
import { DialogOverlay, DialogPortal } from '@/components/ui/dialog';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import type { MediaType, TMDBMovieDetails, TMDBTVShowDetails, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { getMovieDetails, getTVShowDetails, getImageUrl, cleanMediaList, computeRuntime, titlePath } from '@/lib/tmdb';
import { yearOf, formatCalendarDate, toDateInputValue, fromDateInputValue, todayInputValue } from '@/lib/dates';
import { airedEpisodeCounts, firstUnwatchedAired, isCaughtUp } from '@/lib/shows';
import { useShowSync } from '@/hooks/useShowSync';
import { toast } from 'sonner';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';

interface MediaDetailsProps {
  id: number;
  mediaType: MediaType;
  onClose: () => void;
  onNavigate?: (id: number, mediaType: MediaType) => void;
  /** true: a dialog over the page you came from. false: the standalone page. */
  overlay?: boolean;
}

/** Two-letter region from the browser locale (e.g. "en-IN" -> "IN"), if any. */
function localeRegion(): string | null {
  try {
    const tag = navigator.language;
    const region = tag ? new Intl.Locale(tag).region : undefined;
    return region ? region.toUpperCase() : null;
  } catch {
    return null;
  }
}

/** Clicking a toast (e.g. "Undo") while the dialog is open must not count as clicking outside it. */
function ignoreToastClicks(e: { target: EventTarget | null; preventDefault: () => void }) {
  if (e.target instanceof Element && e.target.closest('[data-sonner-toast]')) e.preventDefault();
}

interface FrameProps {
  overlay: boolean;
  onClose: () => void;
  /** A player layer is open: Escape belongs to it, not to the dialog. */
  layerOpen: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  /** Accessible name while the real heading isn't on screen yet (loading, error). */
  srTitle?: string;
  children: React.ReactNode;
  layers: React.ReactNode;
}

/**
 * Either a Radix dialog (focus trap, scroll lock, Escape, labelled by the title) or a plain block
 * for the standalone page. Defined once, outside MediaDetails, so state changes never remount it.
 * The players render INSIDE the dialog: Radix disables everything outside it.
 */
function Frame({ overlay, onClose, layerOpen, scrollRef, srTitle, children, layers }: FrameProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  if (!overlay) {
    return (
      <div className="flex flex-1 flex-col">
        {children}
        {layers}
      </div>
    );
  }

  return (
    <DialogPrimitive.Root open onOpenChange={open => { if (!open) onClose(); }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={contentRef}
          onOpenAutoFocus={e => { e.preventDefault(); contentRef.current?.focus(); }}
          onEscapeKeyDown={e => { if (layerOpen) e.preventDefault(); }}
          onPointerDownOutside={ignoreToastClicks}
          onInteractOutside={ignoreToastClicks}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background text-foreground outline-none focus-visible:outline-none data-[state=open]:animate-scale-in data-[state=closed]:animate-fade-out sm:inset-4 sm:rounded-xl sm:border sm:border-border sm:shadow-float lg:inset-x-[5vw] lg:inset-y-[3vh] xl:inset-x-[8vw]"
        >
          {srTitle && (
            <>
              <DialogPrimitive.Title className="sr-only">{srTitle}</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">{srTitle}</DialogPrimitive.Description>
            </>
          )}
          <DialogPrimitive.Close asChild>
            <Button
              variant="overlay"
              size="icon"
              aria-label="Close"
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-30 rounded-full sm:right-4 sm:top-4"
            >
              <X />
            </Button>
          </DialogPrimitive.Close>
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain-y">
            {children}
          </div>
          {layers}
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

export function MediaDetails({ id, mediaType, onClose, onNavigate, overlay = false }: MediaDetailsProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, setWatched, watchlist } = useWatchlist();
  const { isWatched } = useEpisodeProgress();
  const { markAllAired } = useShowSync();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [region, setRegion] = useState<string>(() => {
    try { return localStorage.getItem('tmdb-region') || localeRegion() || 'US'; } catch { return localeRegion() || 'US'; }
  });
  useEffect(() => {
    try { localStorage.setItem('tmdb-region', region); } catch { /* ignore */ }
  }, [region]);

  const { data, isLoading, error, refetch, isFetching } = useQuery<TMDBMovieDetails | TMDBTVShowDetails>({
    queryKey: ['media-details', mediaType, id],
    queryFn: async () => {
      if (mediaType === 'movie') return getMovieDetails(id);
      return getTVShowDetails(id);
    },
    retry: 1,
  });

  const inWatchlist = data ? isInWatchlist(id, mediaType) : false;

  // Moving to another title (from "More like this") starts at the top with the players closed.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    if (!overlay) window.scrollTo({ top: 0 });
    setShowPlayer(false);
    setShowStream(false);
  }, [id, mediaType, overlay]);

  // Browser back is handled by the router: the modal lives at /movie/:id
  // and /show/:id, so history works without manual pushState hacks.

  const shell = overlay ? 'px-4 sm:px-8 lg:px-10' : 'mx-auto w-full max-w-content px-4 sm:px-6 lg:px-10';

  const toBasicMedia = (d: TMDBMovieDetails | TMDBTVShowDetails): TMDBMovie | TMDBTVShow => ({
    id: d.id,
    poster_path: d.poster_path,
    vote_average: d.vote_average,
    ...(mediaType === 'movie'
      ? { title: (d as TMDBMovieDetails).title, release_date: (d as TMDBMovieDetails).release_date }
      : { name: (d as TMDBTVShowDetails).name, first_air_date: (d as TMDBTVShowDetails).first_air_date }
    ),
  } as TMDBMovie | TMDBTVShow);

  const handleWatchlistClick = () => {
    if (!data) return;
    if (inWatchlist) removeFromWatchlist(id, mediaType);
    else addToWatchlist(toBasicMedia(data), mediaType);
  };

  /** Works whether or not the title is saved yet: logging a film you've already seen is one tap. */
  const handleToggleWatched = () => {
    if (!data) return;
    const current = watchlist.find(w => w.id === id && w.mediaType === mediaType);
    const totalRuntime = computeRuntime(data, mediaType);
    if (!current) {
      addToWatchlist(toBasicMedia(data), mediaType, {
        status: 'watched',
        watchedAt: new Date().toISOString(),
        runtime: totalRuntime,
      });
      if (mediaType === 'tv') void markAllAired(id, data as TMDBTVShowDetails);
      return;
    }
    const nowWatched = current.status !== 'watched';
    // A show marked watched has seen every episode that has aired.
    if (nowWatched && mediaType === 'tv') void markAllAired(id, data as TMDBTVShowDetails);
    setWatched(id, mediaType, {
      status: nowWatched ? 'watched' : 'watchlist',
      watchedAt: nowWatched ? new Date().toISOString() : null,
      runtime: totalRuntime,
    });
  };

  const layerOpen = showStream || showPlayer;

  if (isLoading) {
    return (
      <Frame overlay={overlay} onClose={onClose} layerOpen={false} scrollRef={scrollRef} srTitle="Loading title details" layers={null}>
        <TitleSkeleton shell={shell} />
      </Frame>
    );
  }

  if (error || !data) {
    return (
      <Frame overlay={overlay} onClose={onClose} layerOpen={false} scrollRef={scrollRef} srTitle="Title details" layers={null}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <EmptyState
            art="error"
            title="Couldn't load this title"
            description="Something went wrong fetching it. Check your connection and try again."
          >
            <Button onClick={() => refetch()} disabled={isFetching}>{isFetching ? 'Retrying…' : 'Try again'}</Button>
            <Button variant="outline" onClick={onClose}>{overlay ? 'Close' : 'Back'}</Button>
          </EmptyState>
        </div>
      </Frame>
    );
  }

  const isMovie = mediaType === 'movie';
  const movieData = isMovie ? (data as TMDBMovieDetails) : null;
  const tvData = !isMovie ? (data as TMDBTVShowDetails) : null;

  const title = movieData?.title ?? tvData?.name ?? '';
  const releaseDate = movieData?.release_date ?? tvData?.first_air_date ?? '';
  const runtime = computeRuntime(data, mediaType);
  const year = yearOf(releaseDate);
  const endYear = yearOf(tvData?.last_air_date);
  const yearLabel = !year
    ? null
    : tvData
      ? (endYear && endYear !== year ? `${year}–${endYear}` : `${year}${tvData.in_production ? '–Present' : ''}`)
      : year;

  const trailer = data.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = isMovie ? data.credits?.crew.find(c => c.job === 'Director') : null;
  const writers = isMovie ? data.credits?.crew.filter(c => c.department === 'Writing').slice(0, 3) : [];
  const cast = data.credits?.cast.slice(0, 12) || [];
  const recommendations = cleanMediaList((data.recommendations?.results || []) as (TMDBMovie | TMDBTVShow)[]).slice(0, 12);

  // Watch providers
  const watchProviders = data['watch/providers']?.results;
  const availableRegions = watchProviders ? Object.keys(watchProviders).sort() : [];
  const effectiveRegion = watchProviders && (watchProviders[region] ? region
    : (watchProviders['US'] ? 'US' : availableRegions[0])) || region;
  const regionProviders = watchProviders?.[effectiveRegion] || null;
  const streamingProviders = regionProviders?.flatrate || [];
  const rentProviders = regionProviders?.rent || [];
  const buyProviders = regionProviders?.buy || [];
  const watchProvidersLink = regionProviders?.link;

  const certification = isMovie
    ? movieData?.release_dates?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates?.find(rd => rd.certification)?.certification
    : tvData?.content_ratings?.results?.find(r => r.iso_3166_1 === 'US')?.rating;

  const backdrops = (data.images?.backdrops || []).slice(0, 6);

  const recIds = new Set(recommendations.map(r => r.id));
  const similarItems = cleanMediaList((data.similar?.results || []) as (TMDBMovie | TMDBTVShow)[])
    .filter(s => !recIds.has(s.id))
    .slice(0, 12);

  const imdbId = data.external_ids?.imdb_id || (isMovie ? movieData?.imdb_id : null);
  const externalLinks = [
    imdbId && { name: 'IMDb', url: `https://www.imdb.com/title/${imdbId}` },
    data.homepage && { name: 'Official site', url: data.homepage },
  ].filter(Boolean) as { name: string; url: string }[];

  const watchlistItem = watchlist.find(w => w.id === id && w.mediaType === mediaType);
  const watchedNow = watchlistItem?.status === 'watched';
  const currentRating = watchlistItem?.rating ?? null;

  // TV "Up Next": first unwatched episode that has actually aired.
  const upNext = tvData ? firstUnwatchedAired(tvData, (sn, ep) => isWatched(id, sn, ep)) : null;
  const airedCounts = tvData ? airedEpisodeCounts(tvData) : null;
  const tvSeasons = tvData?.seasons?.filter(s => s.season_number > 0 && s.episode_count > 0) || [];

  /** Ticking episodes can finish a show (or un-finish it); keep its status in step. */
  const handleProgress = (change: { kind: 'mark' | 'unmark'; season: number; episodes: number[] | 'all' }) => {
    if (!tvData || !watchlistItem) return;
    if (change.kind === 'unmark') {
      if (watchlistItem.status === 'watched') {
        setWatched(id, 'tv', { status: 'watchlist', watchedAt: null });
        toast('Moved back to your to-watch list');
      }
      return;
    }
    if (watchlistItem.status === 'watched') return;
    const touched = (sn: number, ep: number) =>
      sn === change.season && (change.episodes === 'all' || change.episodes.includes(ep));
    if (isCaughtUp(tvData, (sn, ep) => touched(sn, ep) || isWatched(id, sn, ep))) {
      setWatched(id, 'tv', { status: 'watched', watchedAt: new Date().toISOString() });
      toast.success("You're all caught up — marked as watched");
    }
  };

  const slateRows: SlateRow[] = [
    { label: 'Director', value: director?.name, wide: true },
    { label: 'Writers', value: writers && writers.length > 0 ? writers.map(w => w.name).join(', ') : null, wide: true },
    { label: 'Created by', value: tvData?.created_by && tvData.created_by.length > 0 ? tvData.created_by.map(c => c.name).join(', ') : null, wide: true },
    { label: 'Seasons', value: tvData ? tvData.number_of_seasons : null },
    { label: 'Episodes', value: tvData ? tvData.number_of_episodes : null },
    { label: 'Network', value: tvData?.networks && tvData.networks.length > 0 ? tvData.networks.slice(0, 2).map(n => n.name).join(', ') : null, wide: true },
    { label: 'Budget', value: movieData && movieData.budget > 0 ? formatCurrency(movieData.budget) : null },
    { label: 'Box office', value: movieData && movieData.revenue > 0 ? formatCurrency(movieData.revenue) : null },
    { label: 'Languages', value: data.spoken_languages && data.spoken_languages.length > 0 ? data.spoken_languages.map(l => l.english_name).join(', ') : null, wide: true },
    { label: 'Status', value: data.status },
    { label: 'Production', value: data.production_companies && data.production_companies.length > 0 ? data.production_companies.slice(0, 4).map(c => c.name).join(' · ') : null, wide: true },
  ];

  const players = (
    <>
      {showPlayer && trailer && (
        <VideoPlayer
          videoKey={trailer.key}
          title={`${title} - ${trailer.name}`}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {showStream && (() => {
        let startS: number | undefined;
        let startE: number | undefined;
        if (tvData && tvSeasons.length > 0) {
          if (upNext) { startS = upNext.season; startE = upNext.episode; }
          else { startS = tvSeasons[0].season_number; startE = 1; }
        }
        return (
          <StreamPlayer
            tmdbId={id}
            imdbId={imdbId}
            mediaType={mediaType}
            title={title}
            seasons={tvSeasons}
            season={startS}
            episode={startE}
            onClose={() => setShowStream(false)}
          />
        );
      })()}
    </>
  );

  return (
    <Frame overlay={overlay} onClose={onClose} layerOpen={layerOpen} scrollRef={scrollRef} layers={players}>
      <Seo
        title={`${title}${year ? ` (${year})` : ''} — Reel`}
        description={data.overview ? data.overview.slice(0, 160) : `Cast, ratings, trailers and episode tracking for ${title}.`}
        path={titlePath(id, mediaType)}
      />
      {overlay && (
        <DialogPrimitive.Description className="sr-only">
          {data.overview || `Details for ${title}`}
        </DialogPrimitive.Description>
      )}

      <TitleHero
        shell={shell}
        title={title}
        isMovie={isMovie}
        yearLabel={yearLabel}
        year={year}
        runtime={runtime}
        certification={certification}
        voteAverage={data.vote_average}
        voteCount={data.vote_count}
        genres={(data.genres ?? []).slice(0, 3).map(g => g.name)}
        backdropPath={data.backdrop_path}
        posterPath={data.poster_path}
        hasTrailer={!!trailer}
        onPlayTrailer={() => setShowPlayer(true)}
        topLeft={
          overlay ? null : (
            <Button variant="overlay" size="sm" onClick={onClose}>
              <ChevronLeft /> Back
            </Button>
          )
        }
        renderHeading={overlay ? (className, text) => (
          <DialogPrimitive.Title asChild><h1 className={className}>{text}</h1></DialogPrimitive.Title>
        ) : undefined}
      />

      {/* The action row lines up with the title, to the right of the overhanging poster. */}
      <div className={`${shell} pt-5 sm:pt-3 lg:pt-4`}>
        <div className="sm:pl-[9.5rem] lg:pl-[12.5rem]">
          <TitleActions
            inWatchlist={inWatchlist}
            watchedNow={watchedNow}
            hasTrailer={!!trailer}
            onWatchNow={() => setShowStream(true)}
            onToggleList={handleWatchlistClick}
            onTrailer={() => setShowPlayer(true)}
            onToggleWatched={handleToggleWatched}
            share={<ShareButton title={title} mediaType={mediaType} id={id} />}
            externalLinks={externalLinks}
          />
        </div>
      </div>

      <div className={`${shell} mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14`}>
        <div className="contents min-w-0 lg:col-span-8 lg:block lg:space-y-12">
          {data.tagline && (
            <p className="border-l-2 border-primary pl-4 font-display text-xl leading-snug text-foreground/90 text-balance">
              {data.tagline}
            </p>
          )}

          {data.overview && (
            <section>
              <SectionHeader title="The story" />
              <p className="max-w-prose text-base leading-relaxed text-pretty text-foreground/90">{data.overview}</p>
            </section>
          )}

          {tvData && upNext && (
            <section>
              <SectionHeader title="Up next" />
              <button
                type="button"
                onClick={() => setShowStream(true)}
                aria-label="Play next unwatched episode"
                className="group flex w-full items-center gap-4 rounded-lg border border-border bg-card p-3.5 text-left shadow-panel transition-colors duration-fast hover:border-border-strong"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors duration-fast group-hover:bg-primary-hover">
                  <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="numeral block font-mono text-xs text-muted-foreground">
                    {episodeCode(upNext.season, upNext.episode)} · {upNext.seasonName}
                  </span>
                  <span className="block font-semibold">Continue watching</span>
                </span>
              </button>
            </section>
          )}

          {tvData?.next_episode_to_air && (
            <section>
              <SectionHeader title="Next airing" />
              <div className="rounded-lg border border-primary/35 bg-primary-subtle p-4">
                <p className="numeral font-mono text-xs text-primary-text">
                  {episodeCode(tvData.next_episode_to_air.season_number, tvData.next_episode_to_air.episode_number)}
                </p>
                <p className="mt-0.5 font-semibold">{tvData.next_episode_to_air.name}</p>
                <p className="numeral mt-1 font-mono text-xs text-muted-foreground">
                  {formatCalendarDate(tvData.next_episode_to_air.air_date, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </section>
          )}

          {cast.length > 0 && (
            <section className="order-7 lg:order-none">
              <SectionHeader title="Cast" />
              <Credits cast={cast} />
            </section>
          )}

          {tvSeasons.length > 0 && (
            <section className="order-8 lg:order-none">
              <SectionHeader
                title="Episodes"
                subtitle={tvData ? `${tvData.number_of_seasons} season${tvData.number_of_seasons === 1 ? '' : 's'} · ${tvData.number_of_episodes} episodes` : undefined}
              />
              <div className="space-y-2.5">
                {tvSeasons.map(season => (
                  <SeasonEpisodes
                    key={season.id}
                    tvId={id}
                    season={season}
                    airedCount={airedCounts?.get(season.season_number)}
                    onProgress={handleProgress}
                  />
                ))}
              </div>
            </section>
          )}

          {backdrops.length > 0 && (
            <section className="order-9 lg:order-none">
              <SectionHeader title="Stills" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {backdrops.map(img => (
                  <div key={img.file_path} className="aspect-video overflow-hidden rounded-md bg-surface-2 ring-1 ring-inset ring-foreground/10">
                    <img src={getImageUrl(img.file_path, 'w500') || ''} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="contents min-w-0 lg:col-span-4 lg:block lg:space-y-6">
          {inWatchlist && watchedNow && (
            <section aria-label="Your rating" className="order-5 space-y-5 rounded-lg border border-border bg-card p-5 shadow-panel lg:order-none">
              <RatingScale
                value={currentRating}
                onChange={rating => setWatched(id, mediaType, { rating })}
              />
              <FormField id="watched-on" label="Watched on">
                {p => (
                  <Input
                    type="date"
                    max={todayInputValue()}
                    value={toDateInputValue(watchlistItem?.watchedAt)}
                    onChange={e => {
                      const iso = fromDateInputValue(e.target.value);
                      if (iso) setWatched(id, mediaType, { watchedAt: iso });
                    }}
                    {...p}
                  />
                )}
              </FormField>
            </section>
          )}

          {availableRegions.length > 0 && (
            <div className="order-6 lg:order-none">
              <WhereToWatch
                regions={availableRegions}
                region={effectiveRegion}
                onRegionChange={setRegion}
                stream={streamingProviders}
                rent={rentProviders}
                buy={buyProviders}
                link={watchProvidersLink}
              />
            </div>
          )}

          <section aria-labelledby="the-details" className="order-10 space-y-3 lg:order-none">
            <h2 id="the-details" className="font-display text-lg font-semibold tracking-tight">The details</h2>
            <Slate rows={slateRows} />
            <p className="numeral font-mono text-xs text-subtle">TMDB {data.id}</p>
          </section>
        </aside>
      </div>

      {(recommendations.length > 0 || similarItems.length > 0) && (
        <div className={`${shell} mt-16 space-y-12 pb-12 pb-safe`}>
          {recommendations.length > 0 && (
            <RecommendationCarousel
              items={recommendations}
              mediaType={mediaType}
              onSelect={(recId, recType) => onNavigate?.(recId, recType)}
            />
          )}
          {similarItems.length > 0 && (
            <RecommendationCarousel
              items={similarItems}
              mediaType={mediaType}
              title="Similar titles"
              onSelect={(recId, recType) => onNavigate?.(recId, recType)}
            />
          )}
        </div>
      )}
    </Frame>
  );
}
