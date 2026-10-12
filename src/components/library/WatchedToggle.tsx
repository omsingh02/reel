import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WatchedToggleProps {
  watched: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * The watched check: an outlined circle that fills green with the tick drawing itself when you
 * mark something watched. The animation only plays for a change you make, not on page load.
 */
export function WatchedToggle({ watched, onToggle, className }: WatchedToggleProps) {
  const [drawn, setDrawn] = useState(false);

  return (
    <button
      type="button"
      aria-label={watched ? 'Mark as not watched' : 'Mark as watched'}
      onClick={() => {
        if (!watched) setDrawn(true);
        onToggle();
      }}
      className={cn('group/check inline-flex h-10 w-10 items-center justify-center rounded-full sm:h-11 sm:w-11', className)}
    >
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-base ease-snap',
          watched
            ? 'border-success bg-success text-success-foreground'
            : 'border-border-strong text-muted-foreground group-hover/check:border-success group-hover/check:text-success-text',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="24" className={cn(drawn && watched && 'animate-check-draw')} />
        </svg>
      </span>
    </button>
  );
}
