import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface WhereToWatchProps {
  regions: string[];
  region: string;
  onRegionChange: (region: string) => void;
  stream: Provider[];
  rent: Provider[];
  buy: Provider[];
  /** The TMDB/JustWatch page every logo links to. */
  link?: string;
}

function Group({ label, items, link }: { label: string; items: Provider[]; link?: string }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="label-mono mb-2">{label}</p>
      <ul className="flex flex-wrap gap-2">
        {items.map(p => (
          <li key={p.provider_id}>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              title={p.provider_name}
              aria-label={`${p.provider_name} (${label.toLowerCase()})`}
              className="block h-11 w-11 overflow-hidden rounded-md border border-border bg-surface-2 transition-[box-shadow,transform] duration-fast hover:-translate-y-0.5 hover:shadow-panel"
            >
              <img src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt="" className="h-full w-full object-cover" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Where you can watch it, by region. The logos link to the full list on TMDB. */
export function WhereToWatch({ regions, region, onRegionChange, stream, rent, buy, link }: WhereToWatchProps) {
  const total = stream.length + rent.length + buy.length;
  return (
    <section aria-labelledby="where-to-watch" className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 id="where-to-watch" className="font-display text-lg font-semibold tracking-tight">Where to watch</h2>
        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger aria-label="Region" className="h-8 w-[5.25rem] font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {regions.map(r => <SelectItem key={r} value={r} className="font-mono text-xs">{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground">No providers listed for {region}. Try another region.</p>
      ) : (
        <div className="space-y-4">
          <Group label="Stream" items={stream} link={link} />
          <Group label="Rent" items={rent} link={link} />
          <Group label="Buy" items={buy} link={link} />
        </div>
      )}
    </section>
  );
}
