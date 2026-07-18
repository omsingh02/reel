import { memo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface MediaRailProps {
  title: string;
  subtitle?: string;
  items: (TMDBMovie | TMDBTVShow)[];
  mediaType: MediaType;
  onItemClick?: (id: number, type: MediaType) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Horizontal rail of media cards. Uses CSS scroll-snap and native overflow
 * for buttery mobile scrolling; desktop gets arrow controls.
 */
export const MediaRail = memo(function MediaRail({
  title, subtitle, items, mediaType, onItemClick, loading, className,
}: MediaRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-end justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => scrollBy(-1)}
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-8 w-8 p-0 rounded-full"
            onClick={() => scrollBy(1)}
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-3 sm:px-5 lg:px-8 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px] aspect-[2/3] rounded-2xl bg-secondary/60 animate-pulse"
              />
            ))
          : items.map((item) => (
              <div
                key={`${mediaType}-${item.id}`}
                className="shrink-0 snap-start w-[140px] sm:w-[160px] md:w-[180px]"
              >
                <MediaCard
                  media={item}
                  mediaType={mediaType}
                  onClick={() => onItemClick?.(item.id, mediaType)}
                />
              </div>
            ))}
      </div>
    </section>
  );
});
