import { getImageUrl } from '@/lib/tmdb';

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
}

/** The cast as a credits list: a small portrait, the name, the role in mono. */
export function Credits({ cast }: { cast: CastMember[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
      {cast.map(person => {
        const src = getImageUrl(person.profile_path, 'w185');
        return (
          <li key={person.id} className="flex min-w-0 items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-3 ring-1 ring-inset ring-foreground/10">
              {src ? (
                <img src={src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div aria-hidden className="flex h-full w-full items-center justify-center font-display text-lg font-semibold text-muted-foreground">
                  {person.name.slice(0, 1)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{person.name}</p>
              {person.character && <p className="truncate font-mono text-xs text-muted-foreground">{person.character}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
