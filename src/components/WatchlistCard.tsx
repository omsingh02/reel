import { memo } from 'react';
import { X, Star, Film, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WatchlistItem } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';

interface WatchlistCardProps {
  item: WatchlistItem;
  onClick?: () => void;
}

export const WatchlistCard = memo(function WatchlistCard({ item, onClick }: WatchlistCardProps) {
  const { removeFromWatchlist } = useWatchlist();
  const posterUrl = getImageUrl(item.posterPath, 'w154');
  const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(item.id, item.mediaType);
  };

  return (
    <div 
      className="group flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Poster */}
      <div className="flex-shrink-0 w-12 aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            {item.mediaType === 'movie' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-medium text-sm leading-tight truncate" title={item.title}>
            {item.title}
          </h3>
          <span className="flex-shrink-0 text-[10px] font-medium py-0.5 px-2 rounded-full bg-secondary text-secondary-foreground">
            {item.mediaType === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{year || 'TBA'}</span>
          {item.voteAverage > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-rating text-rating" />
              {item.voteAverage.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Remove button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});
