import { useCallback, useState } from 'react';
import { getImageUrl } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

interface PosterProps {
  /** TMDB poster path, or null when the title has none. */
  path: string | null | undefined;
  title: string;
  year?: number | null;
  size?: 'w154' | 'w185' | 'w342' | 'w500';
  /** Load immediately (above the fold) instead of lazily. */
  eager?: boolean;
  className?: string;
  /** Overlays (status flags, quick actions) positioned inside the poster. */
  children?: React.ReactNode;
}

/**
 * A 2:3 poster with a hairline edge. While the image loads it shimmers; if there is no image
 * (or it fails) the title is typeset on a film-edge card, so nothing ever shows a blank box.
 */
export function Poster({ path, title, year, size = 'w342', eager, className, children }: PosterProps) {
  const url = getImageUrl(path ?? null, size);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Images already in the browser cache can finish before React attaches onLoad.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete && node.naturalWidth > 0) setLoaded(true);
  }, []);

  const showImage = !!url && !failed;

  return (
    <div
      className={cn(
        'relative aspect-[2/3] w-full overflow-hidden rounded-poster bg-surface-2 ring-1 ring-inset ring-foreground/10 transition-[box-shadow] duration-base',
        className,
      )}
    >
      {showImage ? (
        <>
          {!loaded && <div aria-hidden className="skeleton absolute inset-0 rounded-none" />}
          <img
            ref={imgRef}
            src={url!}
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn('h-full w-full object-cover transition-opacity duration-slow', loaded ? 'opacity-100' : 'opacity-0')}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-2 px-6 text-center">
          <span aria-hidden className="sprocket-y absolute inset-y-3 left-1.5 text-border-strong/70" />
          <span aria-hidden className="sprocket-y absolute inset-y-3 right-1.5 text-border-strong/70" />
          <span className="line-clamp-5 font-display text-[1.0625rem] font-semibold leading-tight text-foreground/90 text-balance">{title}</span>
          {year ? <span className="font-mono text-xs text-muted-foreground numeral">{year}</span> : null}
        </div>
      )}
      {children}
    </div>
  );
}
