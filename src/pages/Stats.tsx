import { useEffect, useMemo, useRef } from 'react';
import { BarChart3, Clock, Film, Tv, Star, type LucideIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { useWatchlist, useRuntimeLookup } from '@/hooks/useWatchlist';
import { yearOf } from '@/lib/dates';

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-card border border-border/40">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />{label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export default function Stats() {
  const { watchlist, setWatched } = useWatchlist();
  const lookupRuntime = useRuntimeLookup();
  const attempted = useRef(new Set<string>());

  // Titles marked watched before runtimes were tracked (or from places that
  // never set one) would count as 0 hours. Fill them in once per title.
  useEffect(() => {
    const missing = watchlist
      .filter(w => w.status === 'watched' && !w.runtime && !attempted.current.has(`${w.mediaType}:${w.id}`))
      .slice(0, 25);
    missing.forEach(w => {
      attempted.current.add(`${w.mediaType}:${w.id}`);
      void lookupRuntime(w.id, w.mediaType).then(runtime => {
        if (runtime) setWatched(w.id, w.mediaType, { runtime });
      });
    });
  }, [watchlist, lookupRuntime, setWatched]);

  const stats = useMemo(() => {
    const watched = watchlist.filter(w => w.status === 'watched');
    const movies = watched.filter(w => w.mediaType === 'movie').length;
    const shows = watched.filter(w => w.mediaType === 'tv').length;
    const minutes = watched.reduce((sum, w) => sum + (w.runtime || 0), 0);
    const ratings = watched.filter(w => typeof w.rating === 'number') as Array<typeof watched[number] & { rating: number }>;
    const avgRating = ratings.length
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
      : '—';

    // By decade
    const decades = new Map<string, number>();
    watched.forEach(w => {
      const y = yearOf(w.releaseDate);
      if (y === null) return;
      const d = `${Math.floor(y / 10) * 10}s`;
      decades.set(d, (decades.get(d) || 0) + 1);
    });
    const topDecades = Array.from(decades.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return { total: watched.length, movies, shows, minutes, avgRating, topDecades };
  }, [watchlist]);

  const hours = Math.round(stats.minutes / 60);

  return (
    <Layout>
      <Seo title="Your Viewing Stats — Reel" description="Time watched, movies and shows completed, and your average rating across everything you have marked as watched." path="/stats" noindex />
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">Your Stats</h1>
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 max-w-3xl">
        {stats.total === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No watched titles yet"
            description="Mark titles as watched from their details page to start tracking your stats."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={BarChart3} label="Watched" value={String(stats.total)} />
              <StatCard icon={Clock} label="Hours" value={String(hours)} />
              <StatCard icon={Film} label="Movies" value={String(stats.movies)} />
              <StatCard icon={Tv} label="TV titles" value={String(stats.shows)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Star className="h-3.5 w-3.5" />Your average rating
                </div>
                <p className="text-2xl font-semibold">{stats.avgRating}{stats.avgRating !== '—' && <span className="text-sm text-muted-foreground"> / 10</span>}</p>
              </div>
              <div className="p-4 rounded-2xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground mb-2">Top decades</p>
                {stats.topDecades.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No release dates yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {stats.topDecades.map(([d, n]) => (
                      <li key={d} className="flex justify-between">
                        <span>{d}</span>
                        <span className="text-muted-foreground">{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
