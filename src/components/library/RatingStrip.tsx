import { cn } from '@/lib/utils';

/**
 * A read-only strip of ten frames filled gold up to `value` (fractions fill part of a frame).
 * It is the display twin of the RatingScale input.
 */
export function RatingStrip({ value, className }: { value: number; className?: string }) {
  return (
    <div role="img" aria-label={`${value.toFixed(1)} out of 10`} className={cn('flex gap-1', className)}>
      {Array.from({ length: 10 }, (_, i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative h-5 flex-1 overflow-hidden rounded-sm border border-border-strong bg-surface-2">
            <span className="absolute inset-y-0 left-0 bg-rating" style={{ width: `${fill * 100}%` }} />
          </span>
        );
      })}
    </div>
  );
}
