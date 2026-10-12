import { cn } from '@/lib/utils';

interface StatProps {
  label: string;
  value: React.ReactNode;
  /** Small unit after the number ("hrs", "/ 10"). */
  unit?: string;
  hint?: React.ReactNode;
  className?: string;
}

/** One headline number, set big in the display serif with a credits-style label. */
export function Stat({ label, value, unit, hint, className }: StatProps) {
  return (
    <div className={cn('rounded-lg border border-border bg-card p-5 shadow-panel', className)}>
      <p className="label-mono">{label}</p>
      <p className="numeral mt-3 font-display text-display-sm font-semibold leading-none sm:text-display">
        {value}
        {unit && <span className="ml-1.5 font-sans text-base font-medium text-muted-foreground">{unit}</span>}
      </p>
      {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
