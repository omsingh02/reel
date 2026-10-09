import { cn } from '@/lib/utils';

export interface SlateRow {
  label: string;
  value: React.ReactNode;
  /** Span both columns (long values such as production companies). */
  wide?: boolean;
}

/**
 * Production details laid out like the info grid on a clapperboard: hairline cells, a mono label
 * above each value. Rows with no value are skipped, so callers can pass everything they have.
 */
export function Slate({ rows, className }: { rows: SlateRow[]; className?: string }) {
  const visible = rows.filter(r => r.value !== null && r.value !== undefined && r.value !== '' && r.value !== false);
  if (visible.length === 0) return null;
  return (
    <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border', className)}>
      {visible.map(row => (
        <div key={row.label} className={cn('min-w-0 bg-card px-4 py-3', row.wide && 'col-span-2')}>
          <dt className="label-mono">{row.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
