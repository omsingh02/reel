import { cn } from '@/lib/utils';

/** Reel monogram mark — bold R in a rounded squircle. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('h-9 w-9', className)} role="img" aria-label="Reel">
      <rect width="48" height="48" rx="14" className="fill-primary" />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, sans-serif"
        fontWeight="800"
        fontSize="28"
        letterSpacing="-1"
        className="fill-primary-foreground"
      >
        R
      </text>
    </svg>
  );
}
