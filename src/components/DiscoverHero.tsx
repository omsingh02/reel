import { memo, useCallback } from 'react';
import { Plus, Check, Star, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Tag } from './ui/badge';
import { getImageUrl, getTitle, getReleaseDate } from '@/lib/tmdb';
import { useWatchlist } from '@/hooks/useWatchlist';
import { yearOf } from '@/lib/dates';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

interface DiscoverHeroProps {
  media: TMDBMovie | TMDBTVShow;
  mediaType: MediaType;
  onOpen: (id: number, type: MediaType) => void;
}

/**
 * The marquee: one featured title, shown like a still from the film. A cinemascope crop of the
 * backdrop (the portrait poster on phones), film grain, a dark scrim, and the title set in the
 * display serif. The `dark` class scopes the dark theme's tokens to this block, so its text and
 * buttons stay legible over artwork in both themes.
 */
export const DiscoverHero = memo(function DiscoverHero({ media, mediaType, onOpen }: DiscoverHeroProps) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inList = isInWatchlist(media.id, mediaType);

  const title = getTitle(media);
  const year = yearOf(getReleaseDate(media));
  const backdrop = getImageUrl(media.backdrop_path, 'w780') || getImageUrl(media.poster_path, 'w780');
  const backdropLarge = media.backdrop_path ? getImageUrl(media.backdrop_path, 'w1280') : null;
  const portrait = getImageUrl(media.poster_path, 'w780');

  const handleWatchlist = useCallback(() => {
    if (inList) removeFromWatchlist(media.id, mediaType);
    else addToWatchlist(media, mediaType);
  }, [inList, media, mediaType, addToWatchlist, removeFromWatchlist]);

  return (
    <section
      aria-label="Featured title"
      className="dark grain relative isolate overflow-hidden rounded-lg border border-border bg-background text-foreground"
    >
      <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[2.39/1]">
        {backdrop && (
          <picture>
            {portrait && <source media="(max-width: 639px)" srcSet={portrait} />}
            <img
              src={backdrop}
              srcSet={backdropLarge ? `${backdrop} 780w, ${backdropLarge} 1280w` : undefined}
              sizes="(min-width: 1408px) 1328px, 100vw"
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[50%_22%]"
              loading="eager"
              // @ts-expect-error - `fetchpriority` is valid HTML, but React 18's types only know the camelCase name it warns about
              fetchpriority="high"
            />
          </picture>
        )}
        <div aria-hidden className="scrim-b absolute inset-0" />
        <div aria-hidden className="scrim-r absolute inset-0 hidden opacity-90 md:block" />

        <div className="absolute inset-x-0 bottom-0 z-[2] p-5 sm:p-8 lg:p-12">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Tag variant="signal">Featured</Tag>
              <p className="numeral flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <span>{mediaType === 'movie' ? 'Movie' : 'TV series'}</span>
                {year && (
                  <>
                    <span aria-hidden>/</span>
                    <span>{year}</span>
                  </>
                )}
                {media.vote_average > 0 && (
                  <>
                    <span aria-hidden>/</span>
                    <span className="inline-flex items-center gap-1 text-foreground">
                      <Star className="h-3 w-3 fill-rating text-rating" aria-hidden />
                      <span className="sr-only">Rated </span>
                      {media.vote_average.toFixed(1)}
                    </span>
                  </>
                )}
              </p>
            </div>

            <h2 className="line-clamp-2 text-balance text-display-sm sm:text-display lg:text-display-lg">{title}</h2>

            {media.overview && (
              <p className="line-clamp-3 max-w-xl text-[0.9375rem] text-muted-foreground sm:text-base md:line-clamp-2 lg:line-clamp-3">
                {media.overview}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <Button size="lg" onClick={() => onOpen(media.id, mediaType)}>
                <Info />
                View details
              </Button>
              <Button size="lg" variant="overlay" className="border border-white/20" onClick={handleWatchlist}>
                {inList ? <Check /> : <Plus />}
                {inList ? 'In My List' : 'Add to List'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
