import { memo, useRef, useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';
import { PageContainer } from './PageHeader';
import { PosterSkeleton } from '@/components/browse/PosterSkeleton';
import { SectionHeader } from '@/components/reel';
import { Button } from '@/components/ui/button';
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

const cardWidth = 'w-[9.25rem] sm:w-[10.5rem] md:w-[11.5rem] lg:w-[12.5rem]';

/**
 * A horizontal shelf of posters. Native scrolling with snap points (swipe on touch), arrow buttons
 * only on devices with a pointer, and soft fades at the edges that show more is off-screen.
 */
export const MediaRail = memo(function MediaRail({
  title, subtitle, items, mediaType, onItemClick, loading, className,
}: MediaRailProps) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateArrows, items.length, loading]);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  }, []);

  if (!loading && items.length === 0) return null;

  const arrows = (canLeft || canRight) && (
    <div className="hidden items-center gap-1.5 [@media(hover:hover)_and_(pointer:fine)]:flex">
      <Button variant="outline" size="icon-sm" onClick={() => scrollBy(-1)} disabled={!canLeft} aria-label={`Scroll ${title} left`}>
        <ChevronLeft />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={() => scrollBy(1)} disabled={!canRight} aria-label={`Scroll ${title} right`}>
        <ChevronRight />
      </Button>
    </div>
  );

  return (
    <section aria-label={title} aria-busy={loading || undefined} className={className}>
      <PageContainer>
        <SectionHeader title={title} subtitle={subtitle} action={arrows || undefined} />

        {/* The scroller bleeds to the page gutters so cards slide under the edge fades. */}
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-10">
          <ul
            ref={scrollerRef}
            onScroll={updateArrows}
            className="no-scrollbar flex snap-x scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:scroll-px-6 sm:px-6 lg:scroll-px-10 lg:px-10"
          >
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <li key={i} className={cn('shrink-0 snap-start', cardWidth)}>
                    <PosterSkeleton />
                  </li>
                ))
              : items.map((item, i) => (
                  <li key={`${mediaType}-${item.id}`} className={cn('shrink-0 snap-start', cardWidth)}>
                    <MediaCard media={item} mediaType={mediaType} onClick={() => onItemClick?.(item.id, mediaType)} eager={i < 4} />
                  </li>
                ))}
          </ul>
          {canRight && (
            <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:w-14" />
          )}
          {canLeft && (
            <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent sm:w-14" />
          )}
        </div>
      </PageContainer>
    </section>
  );
});
