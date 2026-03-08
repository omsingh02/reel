import { memo, useCallback, useState, forwardRef } from 'react';
import { Plus, Check, Star, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
      className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-card cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-secondary overflow-hidden">
        {!imageError && posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-200",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            {mediaType === 'movie' ? <Film className="h-12 w-12" /> : <Tv className="h-12 w-12" />}
          </div>
        )}
        
        {/* Media type badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-2 left-2 text-xs font-medium bg-background/90 backdrop-blur-sm"
        >
          {mediaType === 'movie' ? 'Movie' : 'TV'}
        </Badge>

        {/* Watchlist button */}
        <Button
          size="sm"
          variant={inWatchlist ? "default" : "secondary"}
          className={cn(
            "absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
            inWatchlist && "opacity-100 bg-primary"
          )}
          onClick={handleWatchlistClick}
        >
          {inWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 p-3">
        <h3 className="font-medium text-sm leading-tight line-clamp-2" title={title}>
          {title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{year || 'TBA'}</span>
          {media.vote_average > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-rating text-rating" />
              <span>{media.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
