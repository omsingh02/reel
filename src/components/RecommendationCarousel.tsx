import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from '@/components/MediaCard';
import { SectionHeader } from '@/components/reel';
import { Button } from '@/components/ui/button';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface RecommendationCarouselProps {
  items: (TMDBMovie | TMDBTVShow)[];
  mediaType: MediaType;
  title?: string;
  onSelect: (id: number, mediaType: MediaType) => void;
}

/** A draggable row of posters ("More like this"). Same cards, quick actions and states as everywhere else. */
export const RecommendationCarousel = React.forwardRef<HTMLElement, RecommendationCarouselProps>(function RecommendationCarousel(
  { items, mediaType, title: sectionTitle, onSelect },
  ref,
) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', dragFree: true });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    sync();
    emblaApi.on('select', sync).on('reInit', sync).on('scroll', sync);
    return () => {
      emblaApi.off('select', sync).off('reInit', sync).off('scroll', sync);
    };
  }, [emblaApi, sync]);

  if (items.length === 0) return null;

  return (
    <section ref={ref} aria-label={sectionTitle || 'More like this'}>
      <SectionHeader
        title={sectionTitle || 'More like this'}
        action={
          <div className="hidden items-center gap-1.5 md:flex">
            <Button variant="outline" size="icon-sm" aria-label="Scroll left" disabled={!canPrev} onClick={() => emblaApi?.scrollPrev()}>
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Scroll right" disabled={!canNext} onClick={() => emblaApi?.scrollNext()}>
              <ChevronRight />
            </Button>
          </div>
        }
      />
      {/* The padding keeps hover lift and focus outlines from being clipped by the scroller. */}
      <div className="-mx-1 overflow-hidden px-1 pb-1 pt-1" ref={emblaRef}>
        <div className="flex gap-4">
          {items.map((item, i) => (
            <div key={item.id} className="w-[8.75rem] shrink-0 sm:w-40">
              <MediaCard media={item} mediaType={mediaType} onClick={() => onSelect(item.id, mediaType)} eager={i < 4} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
