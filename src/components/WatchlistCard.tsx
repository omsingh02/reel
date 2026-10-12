import { memo, useMemo } from 'react';
import { Check, Star, X } from 'lucide-react';
import { Poster } from '@/components/reel';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/badge';
import { RatingPopover } from '@/components/library/RatingPopover';
import { WatchedToggle } from '@/components/library/WatchedToggle';
import type { WatchlistItem } from '@/types/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { useShowSync } from '@/hooks/useShowSync';
import { yearOf } from '@/lib/dates';

interface WatchlistCardProps {
  item: WatchlistItem;
  onClick?: () => void;
}

/**
 * One entry in My List: poster, title and credits-style data on the left; the three things you do
 * to an entry on the right (mark watched, rate, remove). The title is a real button stretched over
 * the whole row, so the row opens the title while the actions stay separately clickable.
 */
export const WatchlistCard = memo(function WatchlistCard({ item, onClick }: WatchlistCardProps) {
  const { removeFromWatchlist, setWatched } = useWatchlist();
  const { forShow } = useEpisodeProgress();
  const { markAllAired } = useShowSync();
  const year = yearOf(item.releaseDate);
  const isWatched = item.status === 'watched';

  // For TV: how many episodes are ticked off. (A "next episode" guess from the
  // highest watched number would name episodes that don't exist.)
  const episodesWatched = useMemo(
    () => (item.mediaType === 'tv' ? forShow(item.id).length : 0),
    [forShow, item.id, item.mediaType]
  );

  const handleRemove = () => removeFromWatchlist(item.id, item.mediaType);

  const handleToggleWatched = () => {
    setWatched(item.id, item.mediaType, {
      status: isWatched ? 'watchlist' : 'watched',
      watchedAt: isWatched ? null : new Date().toISOString(),
    });
    // A show marked watched has seen every episode that has aired.
    if (!isWatched && item.mediaType === 'tv') void markAllAired(item.id);
  };

  const handleRate = (rating: number) => {
    setWatched(item.id, item.mediaType, {
      rating,
      ...(isWatched ? {} : { status: 'watched' as const, watchedAt: new Date().toISOString() }),
    });
    if (!isWatched && item.mediaType === 'tv') void markAllAired(item.id);
  };

  const handleClearRating = () => setWatched(item.id, item.mediaType, { rating: null });

  return (
    <li className="group relative flex items-center gap-3 rounded-lg border border-border bg-card p-3 pr-1.5 transition-colors duration-fast hover:border-border-strong sm:gap-4 sm:pr-2">
      <div className="w-14 shrink-0 sm:w-16">
        <Poster path={item.posterPath} title={item.title} year={year} size="w154" />
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug">
          <button type="button" onClick={onClick} className="stretched-link text-left">
            {item.title}
          </button>
        </h3>

        <p className="numeral flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>{year ?? 'TBA'}</span>
          <Tag>{item.mediaType === 'movie' ? 'Movie' : 'TV'}</Tag>
          {item.voteAverage > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-rating text-rating" aria-hidden />
              <span className="sr-only">TMDB score </span>
              {item.voteAverage.toFixed(1)}
            </span>
          )}
        </p>

        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {isWatched ? (
            <Tag variant="success"><Check strokeWidth={3} aria-hidden /> Watched</Tag>
          ) : (
            <Tag>To watch</Tag>
          )}
          {episodesWatched > 0 && (
            <span className="numeral font-mono text-xs text-muted-foreground">
              {episodesWatched} episode{episodesWatched === 1 ? '' : 's'} watched
            </span>
          )}
        </p>
      </div>

      <div className="relative z-10 flex shrink-0 items-center">
        <WatchedToggle watched={isWatched} onToggle={handleToggleWatched} />
        <RatingPopover rating={item.rating} watched={isWatched} onRate={handleRate} onClear={handleClearRating} />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-muted-foreground hover:bg-destructive-subtle hover:text-destructive-text sm:h-11 sm:w-11"
          onClick={handleRemove}
          aria-label="Remove from watchlist"
        >
          <X />
        </Button>
      </div>
    </li>
  );
});
