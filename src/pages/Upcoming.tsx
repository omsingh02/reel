import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { StubSkeleton } from '@/components/library/Skeletons';
import { TicketStub } from '@/components/library/TicketStub';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Tag } from '@/components/ui/badge';
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
  posterPath: string | null;
}

const MAX_TITLES = 80;

/** "Today", "Tomorrow" or "In 4 days" for the coming week, otherwise nothing. */
function soon(date: string): string | null {
  const d = parseCalendarDate(date);
  if (!d) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return days > 1 && days <= 7 ? `In ${days} days` : null;
}

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
            posterPath: item.posterPath,
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
            label: `S${next.season_number}E${next.episode_number} · ${next.name}`,
            posterPath: item.posterPath,
          });
        }
      }
    });
    return out.sort((a, b) => (parseCalendarDate(a.date)?.getTime() ?? 0) - (parseCalendarDate(b.date)?.getTime() ?? 0));
  }, [queries, pending]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    entries.forEach(e => {
      const arr = map.get(e.date) || [];
      arr.push(e);
      map.set(e.date, arr);
    });
    return Array.from(map.entries());
  }, [entries]);

  // Show results as they arrive instead of waiting for the slowest request.
  const anyLoading = isLoading || (entries.length === 0 && queries.some(q => q.isLoading));
  const failed = queries.filter(q => q.isError).length;
  const skipped = Math.max(0, tracked.length - pending.length);
  const thisYear = new Date().getFullYear();

  return (
    <Layout>
      <Seo title="Upcoming Releases — Reel" description="See upcoming movie releases and TV episode air dates for the titles saved in your list." path="/upcoming" noindex jsonLd={{"@context":"https://schema.org","@type":"CollectionPage","name":"Upcoming Releases","description":"Upcoming movie releases and TV episode air dates for titles saved in your list.","url":`${SITE_URL}/upcoming`}} />
      <PageHeader
        eyebrow="Library"
        title="Upcoming"
        description="Release dates and new episodes for the movies and shows in your list."
      />

      <PageContainer className="pb-6">
        <div className="max-w-4xl">
        {anyLoading ? (
          <StubSkeleton />
        ) : entries.length === 0 ? (
          <EmptyState
            art="upcoming"
            title={failed > 0 ? "Couldn't check upcoming releases" : "Nothing on the horizon"}
            description={
              failed > 0
                ? "Some titles failed to load. Check your connection and reopen this page."
                : "Add titles to your list to see upcoming releases and new episodes here."
            }
          >
            {failed === 0 && (
              <>
                <Button asChild><Link to="/shows">Browse shows</Link></Button>
                <Button asChild variant="ghost"><Link to="/movies">Browse movies</Link></Button>
              </>
            )}
          </EmptyState>
        ) : (
          <div className="space-y-8">
            {(failed > 0 || skipped > 0) && (
              <Callout tone={failed > 0 ? 'warning' : 'info'}>
                {failed > 0 && `Couldn't check ${failed} title${failed === 1 ? '' : 's'} just now. `}
                {skipped > 0 && `Showing the first ${MAX_TITLES} of ${tracked.length} titles.`}
              </Callout>
            )}
            {grouped.map(([date, items]) => {
              const hint = soon(date);
              const year = parseCalendarDate(date)?.getFullYear();
              return (
                <section key={date} aria-labelledby={`day-${date}`}>
                  <h2
                    id={`day-${date}`}
                    className="sticky top-[var(--topbar-h)] z-10 -mx-1 mb-3 flex items-center gap-3 bg-background/95 px-1 py-2 font-mono text-label font-medium uppercase backdrop-blur-sm"
                  >
                    <span className="text-foreground">
                      {formatCalendarDate(date, { weekday: 'long', month: 'long', day: 'numeric', ...(year && year !== thisYear ? { year: 'numeric' } : {}) })}
                    </span>
                    {hint && <Tag variant="signal">{hint}</Tag>}
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </h2>
                  <ul className="space-y-3">
                    {items.map(e => (
                      <TicketStub
                        key={`${e.mediaType}-${e.id}-${e.date}`}
                        title={e.title}
                        date={e.date}
                        detail={e.label}
                        mediaType={e.mediaType}
                        posterPath={e.posterPath}
                        onOpen={() => openTitle(e.id, e.mediaType)}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
        </div>
      </PageContainer>
    </Layout>
  );
}
