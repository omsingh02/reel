import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import { formatCalendarDate, isTodayOrLater, parseCalendarDate } from '@/lib/dates';
import type { MediaType, TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';
import { SITE_URL } from '@/lib/site';

interface Entry {
  id: number;
  mediaType: MediaType;
  title: string;
  date: string; // ISO
  label: string;
}

const MAX_TITLES = 80;

export default function Upcoming() {
  const { watchlist, isLoading } = useWatchlist();
  const openTitle = useOpenTitle();

  // Movies still "to watch", plus every show you follow — a show marked
  // watched can still have a new episode on the way.
  const tracked = useMemo(
    () => watchlist.filter(w => w.mediaType === 'tv' || (w.status ?? 'watchlist') !== 'watched'),
    [watchlist]
  );
  const pending = useMemo(() => tracked.slice(0, MAX_TITLES), [tracked]);

  const queries = useQueries({
    queries: pending.map(item => ({
      // Slim payload: only release / next-episode dates are needed here.
      queryKey: ['upcoming-details', item.mediaType, item.id],
      queryFn: () =>
        item.mediaType === 'movie'
          ? getMovieDetails(item.id, { slim: true })
          : getTVShowDetails(item.id, { slim: true }),
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
        if (isTodayOrLater(m.release_date)) {
          out.push({
            id: m.id, mediaType: 'movie',
            title: m.title,
            date: m.release_date,
            label: 'Release',
          });
        }
      } else {
        const tv = q.data as TMDBTVShowDetails;
        const next = tv.next_episode_to_air;
        if (next && isTodayOrLater(next.air_date)) {
          out.push({
            id: tv.id, mediaType: 'tv',
            title: tv.name,
            date: next.air_date,
            label: `S${next.season_number}E${next.episode_number}: ${next.name}`,
          });
        }
      }
    });
    return out.sort((a, b) => (parseCalendarDate(a.date)?.getTime() ?? 0) - (parseCalendarDate(b.date)?.getTime() ?? 0));
  }, [queries, pending]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach(e => {
      const key = formatCalendarDate(e.date, {
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      });
      const arr = map.get(key) || [];
      arr.push(e);
      map.set(key, arr);
    });
    return Array.from(map.entries());
  }, [entries]);

  // Show results as they arrive instead of waiting for the slowest request.
  const anyLoading = isLoading || (entries.length === 0 && queries.some(q => q.isLoading));
  const failed = queries.filter(q => q.isError).length;
  const skipped = Math.max(0, tracked.length - pending.length);

  return (
    <Layout>
      <Seo title="Upcoming Releases — Reel" description="See upcoming movie releases and TV episode air dates for the titles saved in your list." path="/upcoming" noindex jsonLd={{"@context":"https://schema.org","@type":"CollectionPage","name":"Upcoming Releases","description":"Upcoming movie releases and TV episode air dates for titles saved in your list.","url":`${SITE_URL}/upcoming`}} />
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
            title={failed > 0 ? "Couldn't check upcoming releases" : "Nothing on the horizon"}
            description={
              failed > 0
                ? "Some titles failed to load. Check your connection and reopen this page."
                : "Add titles to your list to see upcoming releases and new episodes here."
            }
          />
        ) : (
          <div className="space-y-6">
            {(failed > 0 || skipped > 0) && (
              <p className="text-xs text-muted-foreground">
                {failed > 0 && `Couldn't check ${failed} title${failed === 1 ? '' : 's'} just now. `}
                {skipped > 0 && `Showing the first ${MAX_TITLES} of ${tracked.length} titles.`}
              </p>
            )}
            {grouped.map(([date, items]) => (
              <div key={date}>
                <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{date}</h2>
                <div className="space-y-2">
                  {items.map(e => (
                    <button
                      key={`${e.mediaType}-${e.id}-${e.date}`}
                      onClick={() => openTitle(e.id, e.mediaType)}
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

    </Layout>
  );
}
