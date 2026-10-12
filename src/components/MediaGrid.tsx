import { memo, forwardRef } from 'react';
import { MediaCard } from './MediaCard';
import type { TMDBMovie, TMDBTVShow, MediaType } from '@/types/tmdb';
import { cn } from '@/lib/utils';

interface MediaGridProps {
  items: (TMDBMovie | TMDBTVShow)[];
  mediaType: MediaType;
  onItemClick?: (id: number, type: MediaType) => void;
  className?: string;
}

/** A wall of posters: 2 columns on phones up to 6 on wide screens. */
export const MediaGrid = memo(forwardRef<HTMLUListElement, MediaGridProps>(function MediaGrid({
  items,
  mediaType,
  onItemClick,
  className,
}, ref) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      ref={ref}
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={`${mediaType}-${item.id}`} className="min-w-0">
          <MediaCard media={item} mediaType={mediaType} onClick={() => onItemClick?.(item.id, mediaType)} eager={i < 6} />
        </li>
      ))}
    </ul>
  );
}));
