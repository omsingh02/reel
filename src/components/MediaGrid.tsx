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
      "grid gap-x-4 gap-y-10 sm:gap-x-5 sm:gap-y-12 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
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
