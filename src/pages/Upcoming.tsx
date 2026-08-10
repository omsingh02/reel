import { useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MediaDetails } from '@/components/MediaDetails';
import { useWatchlist } from '@/hooks/useWatchlist';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import type { MediaType, TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';

interface Entry {
  id: number;
  mediaType: MediaType;
  title: string;
  date: string; // ISO
  label: string;
}

function isUpcoming(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const t = new Date(dateStr).getTime();
  if (isNaN(t)) return false;
  return t >= Date.now() - 24 * 60 * 60 * 1000; // include today
}

export default function Upcoming() {
  const { watchlist, isLoading } = useWatchlist();
  const [selected, setSelected] = useState<{ id: number; type: MediaType } | null>(null);

  // Only fetch details for items still "to watch".
  const pending = useMemo(
    () => watchlist.filter(w => (w.status ?? 'watchlist') !== 'watched').slice(0, 80),
    [watchlist]
  );

  const queries = useQueries({
    queries: pending.map(item => ({
      queryKey: ['media-details', item.mediaType, item.id],
      queryFn: () =>
        item.mediaType === 'movie' ? getMovieDetails(item.id) : getTVShowDetails(item.id),
      staleTime: 6 * 60 * 60 * 1000,
      retry: 1,
    })),
  });

  const entries: Entry[] = useMemo(() => {
    const out: Entry[] = [];
    queries.forEach((q, i) => {
      const item = pending[i];
      if (!item || !q.data) return;
      if (item.mediaType === 'movie') {
        const m = q.data as TMDBMovieDetails;
        if (isUpcoming(m.release_date)) {
          out.push({
            id: m.id, mediaType: 'movie',
            title: m.title,
            date: m.release_date,
            label: 'Theatrical release',
          });
        }
      } else {
        const tv = q.data as TMDBTVShowDetails;
        const next = tv.next_episode_to_air;
        if (next && isUpcoming(next.air_date)) {
          out.push({
            id: tv.id, mediaType: 'tv',
            title: tv.name,
            date: next.air_date,
            label: `S${next.season_number}E${next.episode_number}: ${next.name}`,
          });
        }
      }
    });
    return out.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [queries, pending]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach(e => {
      const key = new Date(e.date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      });
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [entries]);

  const anyLoading = isLoading || queries.some(q => q.isLoading);

  return (
    <Layout>
      <Seo title="Upcoming Releases — Watchlist" description="See upcoming movie releases and TV episode air dates for the titles saved in your watchlist." path="/upcoming" />
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">Upcoming</h1>
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 max-w-3xl">
        {anyLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing on the horizon"
            description="Add titles to your watchlist to see upcoming releases and new episodes here."
          />
        ) : (
          <div className="space-y-6">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{date}</h2>
                <div className="space-y-2">
                  {items.map(e => (
                    <button
                      key={`${e.mediaType}-${e.id}-${e.date}`}
                      onClick={() => setSelected({ id: e.id, type: e.mediaType })}
                      className="w-full text-left p-3 rounded-2xl bg-card border border-border/40 hover:shadow-md transition-all"
                    >
                      <p className="text-sm font-medium truncate">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <MediaDetails
          id={selected.id}
          mediaType={selected.type}
          onClose={() => setSelected(null)}
          onNavigate={(id, type) => setSelected({ id, type })}
        />
      )}
    </Layout>
  );
}
