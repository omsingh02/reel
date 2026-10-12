import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { SectionHeader, Stat } from '@/components/reel';
import { DecadeBars } from '@/components/library/DecadeBars';
import { RatingStrip } from '@/components/library/RatingStrip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWatchlist, useRuntimeLookup } from '@/hooks/useWatchlist';
import { yearOf } from '@/lib/dates';

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
    const avgNumber = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : null;
    const avgRating = avgNumber !== null ? avgNumber.toFixed(1) : '—';

    // By decade
    const decades = new Map<string, number>();
    watched.forEach(w => {
      const y = yearOf(w.releaseDate);
      if (y === null) return;
      const d = `${Math.floor(y / 10) * 10}s`;
      decades.set(d, (decades.get(d) || 0) + 1);
    });
    const topDecades = Array.from(decades.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);

    return { total: watched.length, movies, shows, minutes, avgRating, avgNumber, topDecades };
  }, [watchlist]);

  const hours = Math.round(stats.minutes / 60);

  return (
    <Layout>
      <Seo title="Your Viewing Stats — Reel" description="Time watched, movies and shows completed, and your average rating across everything you have marked as watched." path="/stats" noindex />
      <PageHeader
        eyebrow="Library"
        title="Stats"
        description="A look at everything you've marked as watched."
      />

      <PageContainer className="pb-6">
        {stats.total === 0 ? (
          <EmptyState
            art="stats"
            title="No watched titles yet"
            description="Mark titles as watched from their details page to start tracking your stats."
          >
            <Button asChild><Link to="/movies">Browse movies</Link></Button>
            <Button asChild variant="ghost"><Link to="/watchlist">Open My List</Link></Button>
          </EmptyState>
        ) : (
          <div className="space-y-10">
            <section aria-label="Totals" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Watched" value={stats.total} />
              <Stat label="Hours" value={hours} />
              <Stat label="Movies" value={stats.movies} />
              <Stat label="TV titles" value={stats.shows} />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section aria-labelledby="avg-heading">
                <SectionHeader title={<span id="avg-heading">Your average rating</span>} subtitle="Across everything you've rated" as="h2" />
                <Card className="space-y-5 p-6">
                  <p className="numeral font-display text-display font-semibold leading-none sm:text-display-lg">
                    {stats.avgRating}
                    {stats.avgNumber !== null && <span className="ml-2 font-sans text-base font-medium text-muted-foreground">/ 10</span>}
                  </p>
                  <RatingStrip value={stats.avgNumber ?? 0} />
                  {stats.avgNumber === null && (
                    <p className="text-sm text-muted-foreground">Rate a few of the titles you've watched to see your average.</p>
                  )}
                </Card>
              </section>

              <section aria-labelledby="decades-heading">
                <SectionHeader title={<span id="decades-heading">Top decades</span>} subtitle="When your watched titles were released" as="h2" />
                <Card className="p-6">
                  {stats.topDecades.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No release dates yet.</p>
                  ) : (
                    <DecadeBars decades={stats.topDecades} />
                  )}
                </Card>
              </section>
            </div>
          </div>
        )}
      </PageContainer>
    </Layout>
  );
}
