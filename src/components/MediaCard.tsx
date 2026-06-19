import { memo, useCallback, useState, forwardRef } from 'react';
import { Plus, Check, Film, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TMDBMovie, TMDBTVShow, MediaType } from '@/types/tmdb';
import { getImageUrl, getTitle, getReleaseDate } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: MediaType;
  onClick?: () => void;
}

export const MediaCard = memo(forwardRef<HTMLDivElement, MediaCardProps>(function MediaCard({ media, mediaType, onClick }, ref) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inWatchlist = isInWatchlist(media.id, mediaType);
  const title = getTitle(media);
  const releaseDate = getReleaseDate(media);
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = getImageUrl(media.poster_path, 'w342');
  const rating = media.vote_average > 0 ? media.vote_average.toFixed(1) : null;

  const handleWatchlistClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(media.id, mediaType);
    } else {
      addToWatchlist(media, mediaType);
    }
  }, [inWatchlist, media, mediaType, addToWatchlist, removeFromWatchlist]);

  return (
    <div
      ref={ref}
      className="group cursor-pointer select-none"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary border border-border/60 group-hover:border-primary/60 transition-colors duration-300">
        {!imageError && posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.04]",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-surface-container">
            {mediaType === 'movie' ? <Film className="h-10 w-10" /> : <Tv className="h-10 w-10" />}
          </div>
        )}

        {/* Rating chip — top right, mono */}
        {rating && (
          <div className="absolute top-0 right-0 px-2 py-1 bg-background/85 backdrop-blur-sm border-l border-b border-border/60 font-mono text-[10px] font-bold text-primary">
            {rating}
          </div>
        )}

        {/* Watchlist toggle — top left, opaque on touch, hover on desktop */}
        <button
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          onClick={handleWatchlistClick}
          className={cn(
            "absolute top-2 left-2 h-8 w-8 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
            "border border-border/60",
            inWatchlist
              ? "bg-primary text-primary-foreground opacity-100 border-primary"
              : "bg-background/80 text-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground hover:border-primary"
          )}
        >
          {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>

        {/* Hover scrim */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Meta */}
      <div className="mt-3 px-0.5 space-y-1">
        <h3
          className="font-semibold text-[13px] leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors"
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          <span>{year || 'TBA'}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{mediaType === 'movie' ? 'Film' : 'Series'}</span>
        </div>
      </div>
    </div>
  );
}));
