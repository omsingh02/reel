/** Horizontal bars for "top decades": a mono label, a track, and the count. Pure CSS. */
export function DecadeBars({ decades }: { decades: [string, number][] }) {
  const max = Math.max(1, ...decades.map(([, n]) => n));
  return (
    <ul className="space-y-3">
      {decades.map(([decade, count]) => (
        <li key={decade} className="grid grid-cols-[4rem_1fr_2rem] items-center gap-3">
          <span className="numeral font-mono text-sm font-medium">{decade}</span>
          <span aria-hidden className="h-3 overflow-hidden rounded-sm bg-surface-3">
            <span className="block h-full rounded-sm bg-primary/70" style={{ width: `${Math.max(6, Math.round((count / max) * 100))}%` }} />
          </span>
          <span className="numeral text-right font-mono text-sm text-muted-foreground">{count}</span>
        </li>
      ))}
    </ul>
  );
}
