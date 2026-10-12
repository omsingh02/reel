import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface RatingScaleProps {
  /** 1–10, or null for "not rated". */
  value: number | null;
  /** Called with the new rating; choosing the current value again clears it (null). */
  onChange: (value: number | null) => void;
  /** `md` shows a header with the big numeral; `sm` is just the scale (for popovers and rows). */
  size?: 'md' | 'sm';
  label?: string;
  disabled?: boolean;
  className?: string;
}

const STOPS = Array.from({ length: 10 }, (_, i) => i + 1);

/**
 * Rate a title from 1 to 10: ten frames in a strip that fill with gold up to your score.
 * A radio group underneath: click or tap a frame, use the arrow keys, Home/End, or
 * Backspace/Delete to clear. Hovering previews a score before you commit to it.
 */
export function RatingScale({ value, onChange, size = 'md', label = 'Your rating', disabled, className }: RatingScaleProps) {
  const [preview, setPreview] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const shown = preview ?? value ?? 0;

  const choose = (n: number) => onChange(n === value ? null : n);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const current = value ?? 0;
    let next: number | null | undefined;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(10, current + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, current - 1);
    else if (e.key === 'Home') next = 1;
    else if (e.key === 'End') next = 10;
    else if (e.key === 'Backspace' || e.key === 'Delete') next = null;
    else return;
    e.preventDefault();
    onChange(next);
    if (next) refs.current[next - 1]?.focus();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {size === 'md' && (
        <div className="flex items-baseline justify-between gap-3">
          <span id="rating-label" className="label-mono">{label}</span>
          <span aria-hidden className="numeral font-display text-2xl font-semibold leading-none">
            {shown ? shown : <span className="text-subtle">–</span>}
            <span className="ml-0.5 font-sans text-sm font-medium text-muted-foreground">/10</span>
          </span>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setPreview(null)}
        className={cn('flex gap-1', disabled && 'pointer-events-none opacity-50')}
      >
        {STOPS.map(n => {
          const filled = n <= shown;
          const selected = n === value;
          // Only one stop is in the tab order: the chosen score, or the first when unrated.
          const tabbable = value ? selected : n === 1;
          return (
            <button
              key={n}
              ref={el => (refs.current[n - 1] = el)}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${n} out of 10`}
              tabIndex={tabbable ? 0 : -1}
              disabled={disabled}
              onClick={() => choose(n)}
              onMouseEnter={() => setPreview(n)}
              onFocus={() => setPreview(null)}
              className={cn(
                'relative flex-1 rounded-sm border transition-[background-color,border-color,transform] duration-fast ease-snap',
                size === 'md' ? 'h-10' : 'h-8',
                filled ? 'border-rating bg-rating' : 'border-border-strong bg-surface-2 hover:border-rating/70',
                selected && 'animate-frame-pop',
              )}
            >
            </button>
          );
        })}
      </div>

      {size === 'md' && (
        <div aria-hidden className="numeral grid grid-cols-10 gap-1 font-mono text-[0.6875rem] leading-none text-subtle">
          {STOPS.map(n => (
            <span key={n} className="text-center">{n === 1 || n === 5 || n === 10 ? n : ''}</span>
          ))}
        </div>
      )}
    </div>
  );
}
