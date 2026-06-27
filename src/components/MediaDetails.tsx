import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Star, Clock, Calendar, Plus, Check, DollarSign, Globe, Building2, Tv2, Play, Image, MonitorPlay, CheckCircle2 } from 'lucide-react';
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

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

// Hoisted out of MediaDetails so it isn't recreated on every render
// (which would remount the entire modal subtree and lose scroll/focus).
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`fixed inset-0 sm:inset-6 lg:inset-y-[4vh] lg:inset-x-[12vw] xl:inset-x-[18vw] rounded-none sm:rounded-3xl bg-background overflow-hidden shadow-2xl animate-scale-in ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function MediaDetails({ id, mediaType, onClose, onNavigate }: MediaDetailsProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, setWatched, watchlist } = useWatchlist();
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
        <div className="p-6 space-y-4">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-2xl" />
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

  const trailer = data.videos?.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = isMovie ? data.credits?.crew.find(c => c.job === 'Director') : null;
  const writers = isMovie ? data.credits?.crew.filter(c => c.department === 'Writing').slice(0, 3) : [];
  const cast = data.credits?.cast.slice(0, 8) || [];
  const recommendations = cleanMediaList((data.recommendations?.results || []) as (TMDBMovie | TMDBTVShow)[]).slice(0, 12);

  // Watch providers — user-selectable region with sensible fallback.
  const watchProviders = data['watch/providers']?.results;
  const availableRegions = watchProviders ? Object.keys(watchProviders).sort() : [];
  const effectiveRegion = watchProviders && (watchProviders[region] ? region
    : (watchProviders['US'] ? 'US' : availableRegions[0])) || region;
  const regionProviders = watchProviders?.[effectiveRegion] || null;
  const streamingProviders = regionProviders?.flatrate || [];
  const rentProviders = regionProviders?.rent || [];
  const buyProviders = regionProviders?.buy || [];
  const watchProvidersLink = regionProviders?.link;

  // Certification
  const certification = isMovie
    ? movieData?.release_dates?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates?.find(rd => rd.certification)?.certification
    : tvData?.content_ratings?.results?.find(r => r.iso_3166_1 === 'US')?.rating;

  // Images (top backdrops)
  const backdrops = (data.images?.backdrops || []).slice(0, 6);

  // Similar titles
  const recIds = new Set(recommendations.map(r => r.id));
  const similarItems = cleanMediaList((data.similar?.results || []) as (TMDBMovie | TMDBTVShow)[])
    .filter(s => !recIds.has(s.id))
    .slice(0, 12);

  const imdbId = data.external_ids?.imdb_id || (isMovie ? movieData?.imdb_id : null);
  const externalLinks = [
    imdbId && { name: 'IMDb', url: `https://www.imdb.com/title/${imdbId}` },
    data.homepage && { name: 'Official Site', url: data.homepage },
  ].filter(Boolean) as { name: string; url: string }[];

  const ProviderRow = ({ label, items }: { label: string; items: typeof streamingProviders }) =>
    items.length === 0 ? null : (
      <div className="mb-3 last:mb-0">
        <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
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

  return (
    <>
      <Shell onClose={onClose} className="flex flex-col">

          {/* Drag handle (mobile) */}
          <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain-y">
            {/* Hero */}
            <div className="relative h-44 sm:h-56 lg:h-72 bg-secondary overflow-hidden">
              {backdropUrl && (
                <img src={backdropUrl} alt="" className="h-full w-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/20" />

              {/* Centered trailer play button — scoped so it doesn't hijack
                  the entire hero on mobile (was a full-area button that
                  caused accidental taps when scrolling). */}
              {trailer && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <button
                    onClick={() => setShowPlayer(true)}
                    aria-label="Play trailer"
                    className="pointer-events-auto h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary active:scale-95 hover:scale-110 transition-all shadow-lg"
                  >
                    <Play className="h-7 w-7 text-primary-foreground ml-1" />
                  </button>
                </div>
              )}

              {/* Close button — larger tap target on mobile, respects iOS notch. */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 sm:right-4 top-safe sm:top-4 h-11 w-11 sm:h-10 sm:w-10 rounded-full bg-background/80 sm:bg-secondary/80 hover:bg-secondary active:scale-95 flex items-center justify-center transition-all backdrop-blur-sm z-10 shadow-lg"
              >
                <X className="h-5 w-5 text-foreground sm:text-secondary-foreground" />
              </button>
            </div>


            {/* Content */}
            <div className="relative px-4 sm:px-8 pb-24 sm:pb-8 -mt-16 sm:-mt-24 pb-safe">
              <div className="flex gap-4 sm:gap-5 mb-5">
                {/* Poster */}
                <div className="flex-shrink-0 w-24 sm:w-32 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-background bg-secondary shadow-xl">
                  {posterUrl ? (
                    <img src={posterUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No poster</div>
                  )}
                </div>

                {/* Title & meta */}
                <div className="flex-1 min-w-0 pt-16 sm:pt-24">
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <Chip>{isMovie ? 'Movie' : 'TV Series'}</Chip>
                    <Chip>{data.status}</Chip>
                    {certification && (
                      <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-bold text-foreground">
                        {certification}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 break-words text-foreground">{title}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {year && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {year}
                      </span>
                    )}
                    {runtime && runtime > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRuntime(runtime)}
                      </span>
                    )}
                    {data.vote_average > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-rating text-rating" />
                        {data.vote_average.toFixed(1)}
                        <span className="text-xs">({data.vote_count.toLocaleString()})</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* TV-specific info */}
              {tvData && (
                <div className="flex flex-wrap gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Tv2 className="h-4 w-4" />
                    <span>{tvData.number_of_seasons} season{tvData.number_of_seasons !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{tvData.number_of_episodes} episodes</span>
                  </div>
                  {tvData.networks && tvData.networks.length > 0 && (
                    <div className="flex items-center gap-2">
                      {tvData.networks.slice(0, 2).map(network => (
                        <Chip key={network.id}>{network.name}</Chip>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Genres */}
              {data.genres && data.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {data.genres.map(genre => (
                    <Chip key={genre.id}>{genre.name}</Chip>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  className="rounded-full px-6"
                  variant={inWatchlist ? "outline" : "default"}
                  onClick={handleWatchlistClick}
                >
                  {inWatchlist ? (
                    <><Check className="h-4 w-4 mr-2" />In Watchlist</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Add to Watchlist</>
                  )}
                </Button>
                {inWatchlist && (() => {
                  const item = watchlist.find(w => w.id === id && w.mediaType === mediaType);
                  const watchedNow = item?.status === 'watched';
                  return (
                    <Button
                      variant={watchedNow ? "default" : "outline"}
                      className="rounded-full px-6"
                      onClick={() =>
                        setWatched(id, mediaType, {
                          status: watchedNow ? 'watchlist' : 'watched',
                          watchedAt: watchedNow ? null : new Date().toISOString(),
                          runtime: runtime || null,
                        })
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {watchedNow ? 'Watched' : 'Mark watched'}
                    </Button>
                  );
                })()}
                {trailer && (
                  <Button variant="secondary" className="rounded-full px-6" onClick={() => setShowPlayer(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Trailer
                  </Button>
                )}
                <Button variant="outline" className="rounded-full px-6" onClick={() => setShowStream(true)}>
                  <MonitorPlay className="h-4 w-4 mr-2" />
                  Watch Now
                </Button>
                <ShareButton title={title} mediaType={mediaType} id={id} />
                {externalLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.name}
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-secondary hover:bg-secondary/80 transition-colors group"
                  >
                    <BrandIcon
                      name={link.name}
                      className="h-5 w-5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-200"
                    />
                  </a>
                ))}
              </div>

              {/* Your rating — visible only if watched */}
              {(() => {
                const item = watchlist.find(w => w.id === id && w.mediaType === mediaType);
                if (item?.status !== 'watched') return null;
                return (
                  <div className="flex items-center gap-2 mb-6 text-sm">
                    <Star className="h-4 w-4 text-rating fill-rating" />
                    <span className="text-muted-foreground">Your rating:</span>
                    <Select
                      value={item.rating ? String(item.rating) : 'none'}
                      onValueChange={(v) =>
                        setWatched(id, mediaType, {
                          status: 'watched',
                          rating: v === 'none' ? null : Number(v),
                        })
                      }
                    >
                      <SelectTrigger className="h-8 w-24 rounded-full"><SelectValue placeholder="Rate" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                          <SelectItem key={n} value={String(n)}>{n}/10</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })()}


              {/* Tagline */}
              {data.tagline && (
                <p className="text-sm italic text-muted-foreground mb-5 border-l-2 border-primary pl-3">
                  "{data.tagline}"
                </p>
              )}

              {/* Overview */}
              {data.overview && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Overview</h3>
                  <p className="text-sm leading-relaxed break-words">{data.overview}</p>
                </div>
              )}

              {/* Financial info (Movie) */}
              {movieData && (movieData.budget > 0 || movieData.revenue > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {movieData.budget > 0 && (
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <DollarSign className="h-3.5 w-3.5" />Budget
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(movieData.budget)}</p>
                    </div>
                  )}
                  {movieData.revenue > 0 && (
                    <div className="p-4 rounded-2xl bg-secondary/50 border border-border/30">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <DollarSign className="h-3.5 w-3.5" />Box Office
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(movieData.revenue)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Languages */}
              {data.spoken_languages && data.spoken_languages.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Globe className="h-3.5 w-3.5" />Languages
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {data.spoken_languages.map(lang => (
                      <Chip key={lang.iso_639_1}>{lang.english_name}</Chip>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Companies */}
              {data.production_companies && data.production_companies.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3.5 w-3.5" />Production
                  </div>
                  <p className="text-sm break-words">
                    {data.production_companies.map(c => c.name).join(' • ')}
                  </p>
                </div>
              )}

              {/* Next Episode (TV) */}
              {tvData?.next_episode_to_air && (
                <div className="mb-6 p-4 rounded-2xl border border-primary/20 bg-primary/5">
                  <h3 className="text-sm font-medium mb-2">Next Episode</h3>
                  <p className="text-sm font-medium">
                    S{tvData.next_episode_to_air.season_number}E{tvData.next_episode_to_air.episode_number}: {tvData.next_episode_to_air.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(tvData.next_episode_to_air.air_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              {/* Director/Writers (Movie) */}
              {isMovie && (director || (writers && writers.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {director && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Director</h3>
                      <p className="text-sm">{director.name}</p>
                    </div>
                  )}
                  {writers && writers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Writers</h3>
                      <p className="text-sm">{writers.map(w => w.name).join(', ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Creators (TV) */}
              {tvData?.created_by && tvData.created_by.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created by</h3>
                  <p className="text-sm">{tvData.created_by.map(c => c.name).join(', ')}</p>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Cast</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cast.map(person => (
                      <div key={person.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-secondary/50 border border-border/30">
                        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                          {person.profile_path ? (
                            <img src={getImageUrl(person.profile_path, 'w92') || ''} alt={person.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground font-medium">
                              {person.name[0]}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{person.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{person.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons (TV) */}
              {tvData?.seasons && tvData.seasons.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Seasons</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {tvData.seasons
                      .filter(s => s.season_number > 0)
                      .map(season => (
                        <div key={season.id} className="flex items-center gap-3 p-2.5 rounded-2xl bg-secondary/50 border border-border/30">
                          <div className="w-12 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
                            {season.poster_path ? (
                              <img src={getImageUrl(season.poster_path, 'w92') || ''} alt={season.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">S{season.season_number}</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{season.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {season.episode_count} episodes
                              {season.air_date && ` • ${new Date(season.air_date).getFullYear()}`}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Watch Providers */}
              {(streamingProviders.length > 0 || rentProviders.length > 0 || buyProviders.length > 0) && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MonitorPlay className="h-3.5 w-3.5" />Where to Watch
                  </div>
                  <ProviderRow label="Stream" items={streamingProviders} />
                  <ProviderRow label="Rent" items={rentProviders} />
                  <ProviderRow label="Buy" items={buyProviders} />
                </div>
              )}

              {/* Backdrops Gallery */}
              {backdrops.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Image className="h-3.5 w-3.5" />Images
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {backdrops.map((img, i) => (
                      <div key={i} className="aspect-video rounded-xl overflow-hidden bg-secondary border border-border/30">
                        <img src={getImageUrl(img.file_path, 'w500') || ''} alt="" className="h-full w-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <RecommendationCarousel
                  items={recommendations}
                  mediaType={mediaType}
                  onSelect={(recId, recType) => {
                    if (onNavigate) onNavigate(recId, recType);
                  }}
                />
              )}

              {/* Similar Titles */}
              {similarItems.length > 0 && (
                <RecommendationCarousel
                  items={similarItems}
                  mediaType={mediaType}
                  title="Similar Titles"
                  onSelect={(recId, recType) => {
                    if (onNavigate) onNavigate(recId, recType);
                  }}
                />
              )}
            </div>
          </div>
      </Shell>



      {/* Video Player */}
      {showPlayer && trailer && (
        <VideoPlayer
          videoKey={trailer.key}
          title={`${title} - ${trailer.name}`}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Stream Player */}
      {showStream && (
        <StreamPlayer
          tmdbId={id}
          mediaType={mediaType}
          title={title}
          onClose={() => setShowStream(false)}
        />
      )}
    </>
  );
}
