import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X, Star, Plus, Check, Play, MonitorPlay, CheckCircle2,
} from 'lucide-react';
import { BrandIcon } from '@/components/BrandIcon';
import { StreamPlayer } from '@/components/StreamPlayer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ShareButton } from '@/components/ShareButton';
import { RecommendationCarousel } from '@/components/RecommendationCarousel';
import { SeasonEpisodes } from '@/components/SeasonEpisodes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MediaType, TMDBMovieDetails, TMDBTVShowDetails, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { getMovieDetails, getTVShowDetails, getImageUrl, cleanMediaList } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface MediaDetailsProps {
  id: number;
  mediaType: MediaType;
  onClose: () => void;
  onNavigate?: (id: number, mediaType: MediaType) => void;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{children}</h3>
      {right}
    </div>
  );
}

// Hoisted so it isn't recreated per render (would remount subtree).
function Shell({
  children,
  className = '',
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`fixed inset-0 sm:inset-6 lg:inset-y-[4vh] lg:inset-x-[8vw] xl:inset-x-[10vw] rounded-none sm:rounded-3xl bg-background overflow-hidden shadow-2xl border border-border/40 animate-scale-in ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function MediaDetails({ id, mediaType, onClose, onNavigate }: MediaDetailsProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, setWatched, watchlist } = useWatchlist();
  const { isWatched } = useEpisodeProgress();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showStream, setShowStream] = useState(false);
  const [region, setRegion] = useState<string>(() => {
    try { return localStorage.getItem('tmdb-region') || 'US'; } catch { return 'US'; }
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

  useKeyboardShortcuts({
    onEscape: () => {
      if (showStream) setShowStream(false);
      else if (showPlayer) setShowPlayer(false);
      else onClose();
    },
    enabled: true,
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Browser back closes the modal.
  useEffect(() => {
    window.history.pushState({ __mediaModal: true }, '');
    let closedByPop = false;
    const onPop = () => { closedByPop = true; onClose(); };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!closedByPop) {
        try { window.history.back(); } catch { /* ignore */ }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWatchlistClick = () => {
    if (!data) return;
    if (inWatchlist) {
      removeFromWatchlist(id, mediaType);
    } else {
      const basicMedia = {
        id: data.id,
        poster_path: data.poster_path,
        vote_average: data.vote_average,
        ...(mediaType === 'movie'
          ? { title: (data as TMDBMovieDetails).title, release_date: (data as TMDBMovieDetails).release_date }
          : { name: (data as TMDBTVShowDetails).name, first_air_date: (data as TMDBTVShowDetails).first_air_date }
        )
      } as TMDBMovie | TMDBTVShow;
      addToWatchlist(basicMedia, mediaType);
    }
  };

  if (isLoading) {
    return (
      <Shell onClose={onClose}>
        <div className="h-full overflow-hidden">
          <Skeleton className="h-[45vh] w-full rounded-none" />
          <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (error || !data) {
    return (
      <Shell onClose={onClose}>
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
              <X className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1">Couldn't load details</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Something went wrong fetching this title. It might be a temporary network issue.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetch()} disabled={isFetching} className="rounded-full">
                {isFetching ? 'Retrying…' : 'Try again'}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  const isMovie = mediaType === 'movie';
  const movieData = isMovie ? (data as TMDBMovieDetails) : null;
  const tvData = !isMovie ? (data as TMDBTVShowDetails) : null;

  const title = movieData?.title ?? tvData?.name ?? '';
  const releaseDate = movieData?.release_date ?? tvData?.first_air_date ?? '';
  const runtime = movieData?.runtime ?? tvData?.episode_run_time?.[0];
  const backdropUrl = getImageUrl(data.backdrop_path, 'w780');
  const posterUrl = getImageUrl(data.poster_path, 'w342');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const endYear = tvData?.last_air_date ? new Date(tvData.last_air_date).getFullYear() : null;
  const yearLabel = tvData
    ? (endYear && endYear !== year ? `${year}–${endYear}` : `${year}${tvData.in_production ? '–Present' : ''}`)
    : year;

  const trailer = data.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = isMovie ? data.credits?.crew.find(c => c.job === 'Director') : null;
  const writers = isMovie ? data.credits?.crew.filter(c => c.department === 'Writing').slice(0, 3) : [];
  const cast = data.credits?.cast.slice(0, 10) || [];
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
    data.homepage && { name: 'Official Site', url: data.homepage },
  ].filter(Boolean) as { name: string; url: string }[];

  const watchlistItem = watchlist.find(w => w.id === id && w.mediaType === mediaType);
  const watchedNow = watchlistItem?.status === 'watched';
  const currentRating = watchlistItem?.rating ?? null;

  // TV "Up Next" — first unwatched episode. Cheap loop, no memo needed.
  const upNext = (() => {
    if (!tvData) return null;
    const seasons = tvData.seasons?.filter(s => s.season_number > 0 && s.episode_count > 0) || [];
    for (const s of seasons) {
      for (let e = 1; e <= s.episode_count; e++) {
        if (!isWatched(id, s.season_number, e)) return { season: s.season_number, episode: e, seasonName: s.name };
      }
    }
    return null;
  })();

  const ProviderRow = ({ label, items }: { label: string; items: typeof streamingProviders }) =>
    items.length === 0 ? null : (
      <div className="mb-3 last:mb-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
        <div className="flex flex-wrap gap-2">
          {items.map(p => (
            <a
              key={p.provider_id}
              href={watchProvidersLink}
              target="_blank"
              rel="noopener noreferrer"
              title={p.provider_name}
              className="h-10 w-10 rounded-xl overflow-hidden bg-secondary border border-border/30 hover:scale-110 transition-transform"
            >
              <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} className="h-full w-full object-cover" />
            </a>
          ))}
        </div>
      </div>
    );

  const heroHeight = 'h-[55vh] min-h-[380px] max-h-[560px]';

  return (
    <>
      <Shell onClose={onClose} className="flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain-y">
          {/* CINEMATIC HERO */}
          <div className={`relative w-full ${heroHeight}`}>
            {backdropUrl && (
              <img src={backdropUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 sm:top-6 h-11 w-11 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/10 flex items-center justify-center text-white transition-all z-20"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Centered trailer play */}
            {trailer && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <button
                  onClick={() => setShowPlayer(true)}
                  aria-label="Play trailer"
                  className="pointer-events-auto h-16 w-16 rounded-full bg-primary/95 flex items-center justify-center hover:bg-primary active:scale-95 hover:scale-105 transition-all shadow-2xl ring-4 ring-white/10"
                >
                  <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
                </button>
              </div>
            )}

            {/* Hero title block */}
            <div className="absolute bottom-6 sm:bottom-10 left-4 sm:left-8 lg:left-10 right-4 sm:right-8 lg:right-10 flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-8">
              {/* Poster */}
              <div className="hidden sm:block w-32 lg:w-44 shrink-0 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-secondary">
                {posterUrl ? (
                  <img src={posterUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No poster</div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                  {title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-zinc-300">
                  <span className="px-2 py-0.5 rounded border border-white/25 font-mono text-[11px] uppercase tracking-wider text-white">
                    {isMovie ? 'Movie' : 'TV Series'}
                  </span>
                  {yearLabel && <span>{yearLabel}</span>}
                  {runtime && runtime > 0 && <span>{formatRuntime(runtime)}</span>}
                  {data.vote_average > 0 && (
                    <span className="flex items-center gap-1.5 text-rating">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-white font-semibold">{data.vote_average.toFixed(1)}</span>
                      <span className="text-xs text-zinc-400">({data.vote_count.toLocaleString()})</span>
                    </span>
                  )}
                  {certification && (
                    <span className="px-2 py-0.5 rounded border border-white/25 text-[11px] font-bold text-white">
                      {certification}
                    </span>
                  )}
                  {data.genres?.slice(0, 3).map(g => g.name).join(' • ') && (
                    <span className="text-zinc-300">{data.genres.slice(0, 3).map(g => g.name).join(' • ')}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="px-4 sm:px-8 lg:px-10 pt-6 pb-2 border-b border-border/50">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button
                size="lg"
                className="rounded-xl h-12 px-6 sm:px-8 font-bold gap-2 shadow-lg"
                onClick={() => setShowStream(true)}
              >
                <Play className="h-5 w-5" fill="currentColor" />
                Watch Now
              </Button>
              <Button
                variant={inWatchlist ? "outline" : "secondary"}
                size="lg"
                className="rounded-xl h-12 px-5 gap-2"
                onClick={handleWatchlistClick}
              >
                {inWatchlist ? <><Check className="h-5 w-5" />In Watchlist</> : <><Plus className="h-5 w-5" />Watchlist</>}
              </Button>
              {trailer && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-xl h-12 px-5 gap-2"
                  onClick={() => setShowPlayer(true)}
                >
                  <MonitorPlay className="h-5 w-5" />
                  Trailer
                </Button>
              )}
              {inWatchlist && (
                <Button
                  variant={watchedNow ? "default" : "secondary"}
                  size="lg"
                  className={`rounded-xl h-12 px-5 gap-2 ${watchedNow ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : ''}`}
                  onClick={() =>
                    setWatched(id, mediaType, {
                      status: watchedNow ? 'watchlist' : 'watched',
                      watchedAt: watchedNow ? null : new Date().toISOString(),
                      runtime: runtime || null,
                    })
                  }
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {watchedNow ? 'Watched' : 'Mark watched'}
                </Button>
              )}
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <ShareButton title={title} mediaType={mediaType} id={id} />

                {externalLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors"
                  >
                    <BrandIcon name={link.name} className="h-5 w-5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT — editorial two-column */}
          <div className="px-4 sm:px-8 lg:px-10 py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-safe">
            {/* Story column */}
            <div className="lg:col-span-8 space-y-10 lg:space-y-12 min-w-0">
              {data.tagline && (
                <p className="text-lg italic text-muted-foreground border-l-2 border-primary pl-4">
                  "{data.tagline}"
                </p>
              )}

              {data.overview && (
                <section>
                  <SectionLabel>The Story</SectionLabel>
                  <p className="text-foreground/90 leading-relaxed text-lg font-light">
                    {data.overview}
                  </p>
                </section>
              )}

              {/* TV Up Next */}
              {tvData && upNext && (
                <section>
                  <SectionLabel right={<span className="text-xs text-muted-foreground font-mono">S{upNext.season} • E{upNext.episode}</span>}>
                    Up Next
                  </SectionLabel>
                  <button
                    onClick={() => setShowStream(true)}
                    className="group w-full text-left rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-border/40 p-4 flex items-center gap-4 transition-all"
                  >
                    <div className="h-14 w-14 rounded-xl bg-primary/90 group-hover:bg-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Play className="h-6 w-6 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-0.5">
                        {upNext.seasonName} · Episode {upNext.episode}
                      </p>
                      <p className="font-semibold text-foreground">Continue watching</p>
                    </div>
                  </button>
                </section>
              )}

              {/* Next Episode airing */}
              {tvData?.next_episode_to_air && (
                <section>
                  <SectionLabel>Next Airing</SectionLabel>
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <p className="font-semibold">
                      S{tvData.next_episode_to_air.season_number}E{tvData.next_episode_to_air.episode_number}: {tvData.next_episode_to_air.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(tvData.next_episode_to_air.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </section>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <section>
                  <SectionLabel>Cast</SectionLabel>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                    {cast.map(person => (
                      <div key={person.id} className="space-y-2">
                        <div className="aspect-square rounded-full overflow-hidden border-2 border-border bg-secondary">
                          {person.profile_path ? (
                            <img src={getImageUrl(person.profile_path, 'w185') || ''} alt={person.name} className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-lg text-muted-foreground font-medium">
                              {person.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-semibold truncate">{person.name}</p>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-tight truncate">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Seasons (TV) */}
              {tvData?.seasons && tvData.seasons.filter(s => s.season_number > 0).length > 0 && (
                <section>
                  <SectionLabel>Episodes</SectionLabel>
                  <div className="space-y-2">
                    {tvData.seasons
                      .filter(s => s.season_number > 0)
                      .map(season => (
                        <SeasonEpisodes key={season.id} tvId={id} season={season} />
                      ))}
                  </div>
                </section>
              )}

              {/* Gallery */}
              {backdrops.length > 0 && (
                <section>
                  <SectionLabel>Images</SectionLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {backdrops.map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border/30">
                        <img src={getImageUrl(img.file_path, 'w500') || ''} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-8 lg:space-y-10 min-w-0">
              {/* Rate */}
              {inWatchlist && watchedNow && (
                <section>
                  <SectionLabel>Your Rating</SectionLabel>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
                      const active = currentRating === n;
                      return (
                        <button
                          key={n}
                          onClick={() =>
                            setWatched(id, mediaType, {
                              rating: active ? null : n,
                            })
                          }
                          className={`h-10 rounded-lg font-mono text-sm font-semibold transition-all ${
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-foreground/70 hover:bg-secondary/70 border border-border/40'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  {currentRating && (
                    <p className="text-xs text-muted-foreground mt-2">You rated this {currentRating}/10</p>
                  )}
                </section>
              )}

              {/* Providers */}
              {availableRegions.length > 0 && (
                <section className="p-5 rounded-2xl bg-secondary/40 border border-border/40 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Available On</h3>
                    <Select value={effectiveRegion} onValueChange={setRegion}>
                      <SelectTrigger className="h-7 w-20 rounded-md text-xs font-mono"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableRegions.map(r => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {(streamingProviders.length + rentProviders.length + buyProviders.length) === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No providers listed for {effectiveRegion}. Try another region.
                    </p>
                  ) : (
                    <div>
                      <ProviderRow label="Stream" items={streamingProviders} />
                      <ProviderRow label="Rent" items={rentProviders} />
                      <ProviderRow label="Buy" items={buyProviders} />
                    </div>
                  )}
                </section>
              )}

              {/* Specifications */}
              <section>
                <SectionLabel>Specifications</SectionLabel>
                <dl className="grid grid-cols-2 gap-y-4 font-mono">
                  {isMovie && director && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Director</dt>
                      <dd className="text-sm">{director.name}</dd>
                    </div>
                  )}
                  {isMovie && writers && writers.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Writers</dt>
                      <dd className="text-sm">{writers.map(w => w.name).join(', ')}</dd>
                    </div>
                  )}
                  {tvData?.created_by && tvData.created_by.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Created By</dt>
                      <dd className="text-sm">{tvData.created_by.map(c => c.name).join(', ')}</dd>
                    </div>
                  )}
                  {tvData && (
                    <>
                      <div className="space-y-1">
                        <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Seasons</dt>
                        <dd className="text-sm">{tvData.number_of_seasons}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Episodes</dt>
                        <dd className="text-sm">{tvData.number_of_episodes}</dd>
                      </div>
                    </>
                  )}
                  {tvData?.networks && tvData.networks.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Network</dt>
                      <dd className="text-sm">{tvData.networks.slice(0, 2).map(n => n.name).join(', ')}</dd>
                    </div>
                  )}
                  {movieData && movieData.budget > 0 && (
                    <div className="space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</dt>
                      <dd className="text-sm">{formatCurrency(movieData.budget)}</dd>
                    </div>
                  )}
                  {movieData && movieData.revenue > 0 && (
                    <div className="space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Box Office</dt>
                      <dd className="text-sm">{formatCurrency(movieData.revenue)}</dd>
                    </div>
                  )}
                  {data.spoken_languages && data.spoken_languages.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Languages</dt>
                      <dd className="text-sm">{data.spoken_languages.map(l => l.english_name).join(', ')}</dd>
                    </div>
                  )}
                  <div className="space-y-1">
                    <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</dt>
                    <dd className="text-sm">{data.status}</dd>
                  </div>
                  {data.production_companies && data.production_companies.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <dt className="text-[10px] text-muted-foreground uppercase tracking-wider">Production</dt>
                      <dd className="text-sm break-words">{data.production_companies.slice(0, 4).map(c => c.name).join(' · ')}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* External footer */}
              {(externalLinks.length > 0 || data.id) && (
                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex gap-4">
                    {externalLinks.map(link => (
                      <a
                        key={link.name}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors tracking-widest uppercase"
                      >
                        {link.name === 'IMDb' ? 'IMDB' : link.name}
                      </a>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60">TMDB {data.id}</span>
                </div>
              )}
            </aside>
          </div>

          {/* Related rails — full width below columns */}
          <div className="px-4 sm:px-8 lg:px-10 pb-10 space-y-8">
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
                title="Similar Titles"
                onSelect={(recId, recType) => onNavigate?.(recId, recType)}
              />
            )}
          </div>
        </div>
      </Shell>

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
        const tvSeasons = tvData?.seasons?.filter(s => s.season_number > 0 && s.episode_count > 0) || [];
        if (tvData && tvSeasons.length > 0) {
          if (upNext) { startS = upNext.season; startE = upNext.episode; }
          else { startS = tvSeasons[0].season_number; startE = 1; }
        }
        return (
          <StreamPlayer
            tmdbId={id}
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
}
