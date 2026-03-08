import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';
import type { MediaType } from '@/types/tmdb';

interface RecommendationItem {
  id: number;
  poster_path: string | null;
  title?: string;
  name?: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

interface RecommendationCarouselProps {
  items: RecommendationItem[];
  mediaType: MediaType;
  onSelect: (id: number, mediaType: MediaType) => void;
}

export const RecommendationCarousel = React.forwardRef<HTMLDivElement, RecommendationCarouselProps>(function RecommendationCarousel({ items, mediaType, onSelect }, ref) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelectChange = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelectChange();
    emblaApi.on('select', onSelectChange);
    emblaApi.on('reInit', onSelectChange);
    return () => {
      emblaApi.off('select', onSelectChange);
      emblaApi.off('reInit', onSelectChange);
    };
  }, [emblaApi, onSelectChange]);

  if (items.length === 0) return null;

  return (
    <div className="relative group" ref={ref}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          You might also like
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
              !canScrollPrev && "invisible"
            )}
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
              !canScrollNext && "invisible"
            )}
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {items.map(item => {
            const title = item.title || item.name || '';
            const posterUrl = getImageUrl(item.poster_path, 'w185');
            const year = (item.release_date || item.first_air_date)?.slice(0, 4);

            return (
              <button
                key={item.id}
                className="flex-shrink-0 w-28 group/card cursor-pointer text-left"
                onClick={() => onSelect(item.id, mediaType)}
              >
                <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-secondary mb-2">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={title}
                      className="h-full w-full object-cover transition-transform group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center p-2 text-xs text-muted-foreground text-center">
                      {title}
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    {item.vote_average > 0 && (
                      <div className="flex items-center gap-1 text-xs text-white">
                        <Star className="h-3 w-3 fill-rating text-rating" />
                        {item.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs font-medium truncate group-hover/card:text-primary transition-colors">
                  {title}
                </p>
                {year && (
                  <p className="text-xs text-muted-foreground">{year}</p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
