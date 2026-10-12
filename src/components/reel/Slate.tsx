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

  // The grid's hairlines are the container's background showing through a 1px gap, so a cell left
  // alone in its row would read as a solid block. Stretch any such cell across the row.
  const spans: boolean[] = [];
  let column = 0;
  visible.forEach((row, i) => {
    if (row.wide) {
      spans[i] = true;
      column = 0;
      return;
    }
    const next = visible[i + 1];
    const alone = column === 0 && (!next || next.wide);
    spans[i] = alone;
    column = alone ? 0 : (column + 1) % 2;
  });

  return (
    <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border', className)}>
      {visible.map((row, i) => (
        <div key={row.label} className={cn('min-w-0 bg-card px-4 py-3', spans[i] && 'col-span-2')}>
          <dt className="label-mono">{row.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
