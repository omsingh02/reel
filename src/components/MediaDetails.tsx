import { useQuery } from '@tanstack/react-query';
import { X, Star, Clock, Calendar, Plus, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { MediaType, TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';
import { getMovieDetails, getTVShowDetails, getImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';

interface MediaDetailsProps {
  id: number;
  mediaType: MediaType;
  onClose: () => void;
}

export function MediaDetails({ id, mediaType, onClose }: MediaDetailsProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  const { data, isLoading, error } = useQuery<TMDBMovieDetails | TMDBTVShowDetails>({
    queryKey: ['media-details', mediaType, id],
    queryFn: async () => {
      if (mediaType === 'movie') {
        return getMovieDetails(id);
      }
      return getTVShowDetails(id);
    },
  });

  const inWatchlist = data ? isInWatchlist(id, mediaType) : false;

  const handleWatchlistClick = () => {
    if (!data) return;
    
    if (inWatchlist) {
      removeFromWatchlist(id, mediaType);
    } else {
      // Convert details to basic media format for storage
      const basicMedia = {
        id: data.id,
        poster_path: data.poster_path,
        vote_average: data.vote_average,
        ...(mediaType === 'movie' 
          ? { title: (data as TMDBMovieDetails).title, release_date: (data as TMDBMovieDetails).release_date }
          : { name: (data as TMDBTVShowDetails).name, first_air_date: (data as TMDBTVShowDetails).first_air_date }
        )
      } as any;
      addToWatchlist(basicMedia, mediaType);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-y-0 right-0 w-full max-w-xl border-l border-border bg-background p-6">
          <Skeleton className="h-64 w-full rounded-lg mb-4" />
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
        <div className="fixed inset-y-0 right-0 w-full max-w-xl border-l border-border bg-background p-6 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Failed to load details</p>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  const isMovie = mediaType === 'movie';
  const title = isMovie ? (data as TMDBMovieDetails).title : (data as TMDBTVShowDetails).name;
  const releaseDate = isMovie ? (data as TMDBMovieDetails).release_date : (data as TMDBTVShowDetails).first_air_date;
  const runtime = isMovie ? (data as TMDBMovieDetails).runtime : (data as TMDBTVShowDetails).episode_run_time?.[0];
  const backdropUrl = getImageUrl(data.backdrop_path, 'w780');
  const posterUrl = getImageUrl(data.poster_path, 'w342');
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

  const trailer = data.videos?.results.find(
    v => v.type === 'Trailer' && v.site === 'YouTube'
  );

  const director = isMovie 
    ? data.credits?.crew.find(c => c.job === 'Director')
    : (data as TMDBTVShowDetails).created_by?.[0];

  const cast = data.credits?.cast.slice(0, 6) || [];

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-xl border-l border-border bg-background shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Backdrop */}
            <div className="relative h-56 bg-secondary overflow-hidden">
              {backdropUrl && (
                <img 
                  src={backdropUrl} 
                  alt="" 
                  className="h-full w-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 h-8 w-8 p-0 bg-background/50 hover:bg-background/80"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="relative px-6 pb-6 -mt-20">
              <div className="flex gap-4 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-28 aspect-[2/3] rounded-md overflow-hidden border border-border bg-secondary shadow-lg">
                  {posterUrl ? (
                    <img src={posterUrl} alt={title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                      No poster
                    </div>
                  )}
                </div>

                {/* Title & Meta */}
                <div className="flex-1 pt-20">
                  <h2 className="text-xl font-semibold mb-2">{title}</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    {year && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {year}
                      </span>
                    )}
                    {runtime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {runtime} min
                      </span>
                    )}
                    {data.vote_average > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-rating text-rating" />
                        {data.vote_average.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {!isMovie && (
                    <p className="text-sm text-muted-foreground">
                      {(data as TMDBTVShowDetails).number_of_seasons} season{(data as TMDBTVShowDetails).number_of_seasons !== 1 ? 's' : ''} • {(data as TMDBTVShowDetails).number_of_episodes} episodes
                    </p>
                  )}
                </div>
              </div>

              {/* Genres */}
              {data.genres && data.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {data.genres.map(genre => (
                    <Badge key={genre.id} variant="secondary" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mb-6">
                <Button
                  className="flex-1"
                  variant={inWatchlist ? "outline" : "default"}
                  onClick={handleWatchlistClick}
                >
                  {inWatchlist ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
                {trailer && (
                  <Button
                    variant="outline"
                    asChild
                  >
                    <a 
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Trailer
                    </a>
                  </Button>
                )}
              </div>

              {/* Tagline */}
              {data.tagline && (
                <p className="text-sm italic text-muted-foreground mb-4">"{data.tagline}"</p>
              )}

              {/* Overview */}
              {data.overview && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Overview</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{data.overview}</p>
                </div>
              )}

              {/* Director/Creator */}
              {director && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-1">{isMovie ? 'Director' : 'Creator'}</h3>
                  <p className="text-sm text-muted-foreground">{director.name}</p>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Cast</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {cast.map(person => (
                      <div 
                        key={person.id}
                        className="flex items-center gap-2 p-2 rounded-md bg-secondary/50"
                      >
                        <div className="h-8 w-8 rounded-full bg-secondary overflow-hidden flex-shrink-0">
                          {person.profile_path ? (
                            <img 
                              src={getImageUrl(person.profile_path, 'w92') || ''} 
                              alt={person.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
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
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
