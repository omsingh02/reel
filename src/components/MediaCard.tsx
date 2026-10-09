import { memo, forwardRef } from 'react';
import { Bookmark, Check, EyeOff, MoreVertical, Plus, Star } from 'lucide-react';
import { Poster } from '@/components/reel/Poster';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHidden } from '@/hooks/useHidden';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getReleaseDate, getTitle } from '@/lib/tmdb';
import { yearOf } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface MediaCardProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: MediaType;
  onClick?: () => void;
  /** Load the poster immediately (first items on a page). */
  eager?: boolean;
}

/**
 * A title in a rail or grid: poster first, then a plain title and a line of credits-style data.
 * The whole card opens the title (one real button via a stretched link); quick actions
 * (add/remove, hide) sit above it and appear on hover, on keyboard focus, and always on touch.
 */
export const MediaCard = memo(forwardRef<HTMLElement, MediaCardProps>(function MediaCard({ media, mediaType, onClick, eager }, ref) {
  const { addToWatchlist, removeFromWatchlist, watchlist } = useWatchlist();
  const { hide } = useHidden();

  const saved = watchlist.find(w => w.id === media.id && w.mediaType === mediaType);
  const inWatchlist = !!saved;
  const watched = saved?.status === 'watched';
  const title = getTitle(media);
  const year = yearOf(getReleaseDate(media));
  const score = media.vote_average > 0 ? media.vote_average.toFixed(1) : null;

  const toggle = () => (inWatchlist ? removeFromWatchlist(media.id, mediaType) : addToWatchlist(media, mediaType));

  return (
    <article ref={ref} className="group relative">
      <Poster
        path={media.poster_path}
        title={title}
        year={year}
        eager={eager}
        className="group-hover:shadow-poster group-hover:ring-foreground/30"
      >
        {inWatchlist && (
          <span
            title={watched ? 'Watched' : 'In your list'}
            className={cn(
              'absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-br-md shadow-sm',
              watched ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground',
            )}
          >
            {watched ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : <Bookmark className="h-3.5 w-3.5 fill-current" aria-hidden />}
            <span className="sr-only">{watched ? 'Watched' : 'In your list'}</span>
          </span>
        )}
      </Poster>

      <div className="mt-2.5 space-y-1">
        <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug">
          <button type="button" onClick={onClick} className="stretched-link text-left">
            {title}
          </button>
        </h3>
        <p className="numeral flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
          <span>{year ?? 'TBA'}</span>
          {score && (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3 w-3 fill-rating text-rating" aria-hidden />
              <span className="sr-only">Rated </span>
              {score}
            </span>
          )}
        </p>
      </div>

      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition-opacity duration-base focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <Button
          size="icon-sm"
          variant={inWatchlist ? 'default' : 'overlay'}
          onClick={toggle}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {inWatchlist ? <Check strokeWidth={3} /> : <Plus />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="overlay" aria-label="More actions">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => hide(media.id, mediaType)}>
              <EyeOff /> Not interested
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}));
