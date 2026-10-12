import { useState } from 'react';
import { Star } from 'lucide-react';
import { RatingScale } from '@/components/reel';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RatingPopoverProps {
  rating: number | null | undefined;
  /** Whether the title is already marked watched (rating an unwatched one marks it watched). */
  watched: boolean;
  onRate: (value: number) => void;
  onClear: () => void;
}

/** A star button that shows your score (a gold numeral) and opens the ten-frame rating scale. */
export function RatingPopover({ rating, watched, onRate, onClear }: RatingPopoverProps) {
  const [open, setOpen] = useState(false);
  const rated = typeof rating === 'number';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Rate this title"
          className="inline-flex h-10 min-w-10 items-center justify-center gap-1.5 rounded-md px-2 text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground sm:h-11 sm:min-w-11"
        >
          <Star className={cn('h-5 w-5', rated && 'fill-rating text-rating')} aria-hidden />
          {rated && <span className="numeral font-display text-xl font-bold leading-none text-rating">{rating}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[19rem] space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="label-mono">Rate this title</p>
          {rated && (
            <button
              type="button"
              onClick={() => { onClear(); setOpen(false); }}
              className="rounded-sm text-xs font-semibold text-primary-text underline underline-offset-4"
            >
              Clear rating
            </button>
          )}
        </div>
        <RatingScale
          size="sm"
          value={rated ? rating! : null}
          onChange={value => {
            if (value === null) onClear();
            else onRate(value);
            setOpen(false);
          }}
        />
        {!watched && <p className="text-xs text-muted-foreground">Rating a title you haven't watched marks it as watched.</p>}
      </PopoverContent>
    </Popover>
  );
}
