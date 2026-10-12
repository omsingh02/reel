import { memo, useMemo } from 'react';
import { X, Star, Film, Tv, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { WatchlistItem } from '@/types/tmdb';
import { getImageUrl } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { useShowSync } from '@/hooks/useShowSync';
import { yearOf } from '@/lib/dates';

const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface WatchlistCardProps {
  item: WatchlistItem;
  onClick?: () => void;
}

export const WatchlistCard = memo(function WatchlistCard({ item, onClick }: WatchlistCardProps) {
  const { removeFromWatchlist, setWatched } = useWatchlist();
  const { forShow } = useEpisodeProgress();
  const { markAllAired } = useShowSync();
  const posterUrl = getImageUrl(item.posterPath, 'w154');
  const year = yearOf(item.releaseDate);
  const isWatched = item.status === 'watched';

  // For TV: how many episodes are ticked off. (A "next episode" guess from the
  // highest watched number would name episodes that don't exist.)
  const episodesWatched = useMemo(
    () => (item.mediaType === 'tv' ? forShow(item.id).length : 0),
    [forShow, item.id, item.mediaType]
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromWatchlist(item.id, item.mediaType);
  };

  const handleToggleWatched = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWatched(item.id, item.mediaType, {
      status: isWatched ? 'watchlist' : 'watched',
      watchedAt: isWatched ? null : new Date().toISOString(),
    });
    // A show marked watched has seen every episode that has aired.
    if (!isWatched && item.mediaType === 'tv') void markAllAired(item.id);
  };

  const handleRate = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation();
    setWatched(item.id, item.mediaType, {
      rating,
      ...(isWatched ? {} : { status: 'watched' as const, watchedAt: new Date().toISOString() }),
    });
    if (!isWatched && item.mediaType === 'tv') void markAllAired(item.id);
  };

  const handleClearRating = (e: Event) => {
    e.preventDefault();
    setWatched(item.id, item.mediaType, { rating: null });
  };

  return (
    <div
      className="group flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex-shrink-0 w-12 aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
        {posterUrl ? (
          <img src={posterUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            {item.mediaType === 'movie' ? <Film className="h-4 w-4" /> : <Tv className="h-4 w-4" />}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-medium text-sm leading-tight truncate" title={item.title}>
            {item.title}
          </h3>
          <span className="flex-shrink-0 text-[10px] font-medium py-0.5 px-2 rounded-full bg-secondary text-secondary-foreground">
            {item.mediaType === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{year || 'TBA'}</span>
          {item.voteAverage > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-rating text-rating" />
              {item.voteAverage.toFixed(1)}
            </span>
          )}
          {isWatched && (
            <span className="inline-flex items-center gap-1 text-primary">
              <CheckCircle2 className="h-3 w-3" />
              Watched{typeof item.rating === 'number' ? ` · ${item.rating}/10` : ''}
            </span>
          )}
          {!isWatched && episodesWatched > 0 && (
            <span className="text-primary">{episodesWatched} episode{episodesWatched === 1 ? '' : 's'} watched</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-11 w-11 p-0 rounded-full",
            isWatched ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary"
          )}
          onClick={handleToggleWatched}
          aria-label={isWatched ? 'Mark as not watched' : 'Mark as watched'}
        >
          <CheckCircle2 className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-11 w-11 p-0 rounded-full",
                typeof item.rating === 'number' ? "text-rating hover:bg-rating/10" : "text-muted-foreground hover:bg-secondary"
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label="Rate this title"
            >
              <Star className={cn("h-5 w-5", typeof item.rating === 'number' && "fill-rating")} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <div className="grid grid-cols-5 gap-1 p-1">
              {RATINGS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={(e) => handleRate(e, n)}
                  className={cn(
                    "h-8 w-8 rounded-full text-xs font-medium transition-colors hover:bg-secondary",
                    item.rating === n && "bg-primary text-primary-foreground hover:bg-primary"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
            {typeof item.rating === 'number' && (
              <DropdownMenuItem onSelect={handleClearRating}>Clear rating</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="h-11 w-11 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={handleRemove}
          aria-label="Remove from watchlist"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
