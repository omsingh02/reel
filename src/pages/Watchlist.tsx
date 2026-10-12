import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { WatchlistCard } from '@/components/WatchlistCard';
import { EmptyState } from '@/components/EmptyState';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { ListSkeleton } from '@/components/library/Skeletons';
import { Button } from '@/components/ui/button';
import { Callout } from '@/components/ui/callout';
import { Segmented } from '@/components/ui/segmented';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import type { WatchlistItem } from '@/types/tmdb';

type StatusFilter = 'all' | 'watchlist' | 'watched';
type TypeFilter = 'all' | 'movie' | 'tv';
type SortKey = 'added' | 'title' | 'release' | 'myrating' | 'rating';

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoading } = useWatchlist();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<SortKey>('added');

  const handleItemClick = useOpenTitle();

  const filtered = useMemo(() => {
    const out = watchlist.filter(it => {
      const s = it.status ?? 'watchlist';
      if (status !== 'all' && s !== status) return false;
      if (type !== 'all' && it.mediaType !== type) return false;
      return true;
    });
    const sorted = [...out];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'title': return a.title.localeCompare(b.title);
        case 'release': {
          const ta = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const tb = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        }
        case 'rating': return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'myrating': {
          // Your own ratings first (highest to lowest); unrated titles last.
          const ra = typeof a.rating === 'number' ? a.rating : -1;
          const rb = typeof b.rating === 'number' ? b.rating : -1;
          return rb - ra;
        }
        case 'added':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });
    return sorted;
  }, [watchlist, status, type, sort]);

  const showSignInPrompt = !user && !authLoading && watchlist.length === 0;
  const watchedCount = watchlist.filter(w => (w.status ?? 'watchlist') === 'watched').length;
  const loading = authLoading || isLoading;

  const description = watchlist.length > 0
    ? `${watchlist.length} ${watchlist.length === 1 ? 'title' : 'titles'} · ${watchedCount} watched`
    : 'The movies and shows you want to see, and the ones you have.';

  const browseButtons = (
    <>
      <Button asChild><Link to="/movies">Browse movies</Link></Button>
      <Button asChild variant="secondary"><Link to="/shows">Browse shows</Link></Button>
    </>
  );

  return (
    <Layout>
      <Seo title="My List — Reel" description="Your saved movies and TV shows, with watched status, ratings and filters to decide what to watch next." path="/watchlist" noindex />
      <PageHeader eyebrow="Library" title="My List" description={description} />

      <PageContainer className="pb-6">
        {!loading && !user && watchlist.length > 0 && (
          <Callout title="Your list lives on this device." className="mb-6">
            Sign in to keep it everywhere.{' '}
            <Link to="/auth" className="rounded-sm font-semibold text-primary-text underline underline-offset-4">Sign in</Link>
          </Callout>
        )}

        {!showSignInPrompt && watchlist.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <Segmented<StatusFilter>
              aria-label="Show"
              value={status}
              onValueChange={setStatus}
              options={[
                { value: 'all', label: 'All' },
                { value: 'watchlist', label: 'To watch' },
                { value: 'watched', label: 'Watched' },
              ]}
            />
            <Segmented<TypeFilter>
              aria-label="Type"
              value={type}
              onValueChange={setType}
              options={[
                { value: 'all', label: 'All' },
                { value: 'movie', label: 'Movies' },
                { value: 'tv', label: 'TV' },
              ]}
            />
            <div className="sm:ml-auto">
              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger aria-label="Sort by" className="h-9 w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="added">Recently added</SelectItem>
                  <SelectItem value="title">Title (A–Z)</SelectItem>
                  <SelectItem value="release">Newest release</SelectItem>
                  <SelectItem value="myrating">My rating</SelectItem>
                  <SelectItem value="rating">TMDB score</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {loading ? (
          <ListSkeleton />
        ) : showSignInPrompt ? (
          <EmptyState
            art="list"
            title="Your list is empty"
            description="Start adding movies and TV shows right away. Sign in any time to keep them in sync across devices."
          >
            {browseButtons}
            <Button asChild variant="ghost"><Link to="/auth">Sign in to sync</Link></Button>
          </EmptyState>
        ) : watchlist.length === 0 ? (
          <EmptyState
            art="list"
            title="Your list is empty"
            description="Start adding movies and TV shows to keep track of what you want to watch."
          >
            {browseButtons}
          </EmptyState>
        ) : filtered.length === 0 ? (
          <EmptyState art="search" title="Nothing matches" description="Try clearing or changing your filters.">
            <Button
              variant="outline"
              onClick={() => { setStatus('all'); setType('all'); setSort('added'); }}
            >
              Reset filters
            </Button>
          </EmptyState>
        ) : (
          <>
          <h2 className="sr-only">Your titles</h2>
          <ul className="grid gap-3 lg:grid-cols-2">
            {filtered.map((item: WatchlistItem) => (
              <WatchlistCard
                key={`${item.mediaType}-${item.id}`}
                item={item}
                onClick={() => handleItemClick(item.id, item.mediaType)}
              />
            ))}
          </ul>
          </>
        )}
      </PageContainer>
    </Layout>
  );
}
