import type { ReactNode } from 'react';
import { Play, Star } from 'lucide-react';
import { Poster } from '@/components/reel';
import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/badge';
import { getImageUrl } from '@/lib/tmdb';
import { formatRuntime } from './format';

interface TitleHeroProps {
  /** Shared horizontal gutters, so the hero lines up with everything below it. */
  shell: string;
  title: string;
  isMovie: boolean;
  yearLabel: string | number | null;
  year: number | null;
  runtime: number | null;
  certification?: string | null;
  voteAverage: number;
  voteCount: number;
  genres: string[];
  backdropPath: string | null;
  posterPath: string | null;
  hasTrailer: boolean;
  onPlayTrailer: () => void;
  /** Back link (page) rendered at the top left. */
  topLeft?: ReactNode;
  /** Close button (modal) rendered at the top right. */
  topRight?: ReactNode;
  /** Lets the modal make this heading its accessible title. */
  renderHeading?: (className: string, text: string) => ReactNode;
}

const headingClass =
  'font-display text-[1.75rem] font-semibold leading-[1.05] tracking-tight text-balance text-white sm:text-display-sm lg:text-display [text-shadow:0_2px_24px_hsl(var(--scrim)/0.55)]';

/**
 * The still: a wide crop of the backdrop under a scrim and film grain, with the title set over
 * it. On wide screens the poster hangs over the bottom edge, like a one-sheet pinned to the frame.
 */
export function TitleHero({
  shell, title, isMovie, yearLabel, year, runtime, certification, voteAverage, voteCount, genres,
  backdropPath, posterPath, hasTrailer, onPlayTrailer, topLeft, topRight, renderHeading,
}: TitleHeroProps) {
  const backdrop780 = getImageUrl(backdropPath, 'w780');
  const backdrop1280 = getImageUrl(backdropPath, 'w1280');

  return (
    <div className="relative">
      {/* The image layer clips itself; the poster is a sibling so it can overhang. */}
      <div className="grain relative aspect-[3/2] max-h-[min(34rem,62vh)] w-full overflow-hidden bg-surface-3 sm:aspect-[2/1] lg:aspect-[2.39/1]">
        {backdrop780 && (
          <img
            src={backdrop780}
            srcSet={backdrop1280 ? `${backdrop780} 780w, ${backdrop1280} 1280w` : undefined}
            sizes="(min-width: 1280px) 1280px, 100vw"
            alt=""
            // React 18 only knows the lowercase attribute; spread it so TypeScript allows it.
            {...{ fetchpriority: 'high' }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        )}
        <div aria-hidden className="scrim-b absolute inset-0" />
        <div aria-hidden className="scrim-r absolute inset-0 hidden opacity-70 sm:block" />
      </div>

      {(topLeft || topRight) && (
        <div className="absolute inset-x-0 top-0 z-20 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className={`${shell} flex items-start justify-between gap-3`}>
            <div>{topLeft}</div>
            <div>{topRight}</div>
          </div>
        </div>
      )}

      {hasTrailer && (
        <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center sm:flex">
          <Button variant="overlay" size="icon-lg" className="pointer-events-auto h-14 w-14 rounded-full ring-1 ring-white/25 hover:scale-105" aria-label="Play trailer" onClick={onPlayTrailer}>
            <Play className="ml-0.5 !size-6 fill-current" />
          </Button>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-20 pb-6 sm:pb-8">
        <div className={`${shell} flex items-end gap-6`}>
          <div className="hidden w-32 shrink-0 translate-y-[4.5rem] sm:block lg:w-44 lg:translate-y-24">
            <Poster
              path={posterPath}
              title={title}
              year={year}
              size="w342"
              eager
              className="shadow-poster ring-1 ring-white/20"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            {renderHeading ? renderHeading(headingClass, title) : <h1 className={headingClass}>{title}</h1>}

            <div className="numeral flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[0.8125rem] text-white/85">
              <Tag variant="overlay">{isMovie ? 'Movie' : 'TV'}</Tag>
              {yearLabel && <span>{yearLabel}</span>}
              {runtime && runtime > 0 ? <span>{formatRuntime(runtime)}{isMovie ? '' : ' total'}</span> : null}
              {certification && <Tag variant="overlay" className="text-white">{certification}</Tag>}
              {voteAverage > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-rating text-rating" aria-hidden />
                  <span className="sr-only">Rated </span>
                  <span className="font-semibold text-white">{voteAverage.toFixed(1)}</span>
                  <span className="text-white/60">({voteCount.toLocaleString()})</span>
                </span>
              )}
            </div>

            {genres.length > 0 && <p className="text-sm text-white/80">{genres.join(' · ')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
