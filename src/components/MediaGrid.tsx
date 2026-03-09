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

export const MediaGrid = memo(forwardRef<HTMLDivElement, MediaGridProps>(function MediaGrid({ 
  items, 
  mediaType, 
  onItemClick,
  className 
}, ref) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className={cn(
      "grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
      className
    )}>
      {items.map((item) => (
        <MediaCard
          key={`${mediaType}-${item.id}`}
          media={item}
          mediaType={mediaType}
          onClick={() => onItemClick?.(item.id, mediaType)}
        />
      ))}
    </div>
  );
}));
