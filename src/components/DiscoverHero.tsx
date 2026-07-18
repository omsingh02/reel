import { memo, useCallback } from 'react';
import { Play, Plus, Check, Star, Info } from 'lucide-react';
import { Button } from './ui/button';
import { getImageUrl, getTitle, getReleaseDate } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface DiscoverHeroProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: MediaType;
  onOpen: (id: number, type: MediaType) => void;
}

/**
 * Editorial cinematic spotlight for the top trending item. Backdrop image
 * with layered gradients, title, meta, and primary actions.
 */
export const DiscoverHero = memo(function DiscoverHero({ media, mediaType, onOpen }: DiscoverHeroProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inList = isInWatchlist(media.id, mediaType);

  const title = getTitle(media);
  const date = getReleaseDate(media);
  const year = date ? new Date(date).getFullYear() : null;
  const backdrop = getImageUrl(media.backdrop_path, 'w780') || getImageUrl(media.poster_path, 'w780');

  const handleWatchlist = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) removeFromWatchlist(media.id, mediaType);
    else addToWatchlist(media, mediaType);
  }, [inList, media, mediaType, addToWatchlist, removeFromWatchlist]);

  return (
    <div className="relative overflow-hidden rounded-3xl mx-3 sm:mx-5 lg:mx-8 mt-4">
      <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] w-full bg-secondary">
        {backdrop && (
          <img
            src={backdrop}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        )}
        {/* Layered gradients for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 lg:p-10">
          <div className="max-w-xl space-y-3">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.14em] text-muted-foreground">
              <span className="text-primary font-semibold">Featured</span>
              <span aria-hidden>·</span>
              <span>{mediaType === 'movie' ? 'Movie' : 'TV Series'}</span>
              {year && <><span aria-hidden>·</span><span>{year}</span></>}
              {media.vote_average > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1 text-foreground/80">
                    <Star className="h-3 w-3 fill-rating text-rating" />
                    {media.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.05]">
              {title}
            </h1>
            {media.overview && (
              <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 sm:line-clamp-3 max-w-lg">
                {media.overview}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                size="lg"
                className="rounded-full h-11 px-5 gap-2"
                onClick={() => onOpen(media.id, mediaType)}
              >
                <Play className="h-4 w-4 fill-current" />
                Watch now
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="rounded-full h-11 px-4 gap-2 bg-secondary/80 backdrop-blur"
                onClick={handleWatchlist}
              >
                {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {inList ? 'In watchlist' : 'Watchlist'}
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="rounded-full h-11 px-4 gap-2 hidden sm:inline-flex"
                onClick={() => onOpen(media.id, mediaType)}
              >
                <Info className="h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
