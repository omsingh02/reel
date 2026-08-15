import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { searchMedia, cleanMediaList } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import { cn } from '@/lib/utils';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

const PAGE_CAP = 10;

function nextPage(last: { page: number; total_pages: number; results: unknown[] }) {
  return last.page < last.total_pages && last.page < PAGE_CAP ? last.page + 1 : undefined;
}

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const type = (params.get('type') === 'tv' ? 'tv' : 'movie') as MediaType;
  const openTitle = useOpenTitle();
  const { isHidden } = useHidden();

  const setQuery = useCallback(
    (q: string) => {
      const next = new URLSearchParams(params);
      if (q) next.set('q', q);
      else next.delete('q');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const setType = useCallback(
    (t: MediaType) => {
      const next = new URLSearchParams(params);
      next.set('type', t);
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  const results = useInfiniteQuery({
    queryKey: ['search', query, type],
    queryFn: ({ pageParam = 1 }) => searchMedia(query, type, pageParam),
    getNextPageParam: nextPage,
    initialPageParam: 1,
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const items = useMemo(() => {
    const flat = results.data?.pages.flatMap(p => p.results) ?? [];
    return cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[]).filter(it => !isHidden(it.id, type));
  }, [results.data, isHidden, type]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => results.fetchNextPage(),
    hasMore: !!results.hasNextPage,
    isLoading: results.isFetchingNextPage,
  });

  return (
    <Layout>
      <Seo
        title={query ? `Search: ${query} — Reel` : 'Search movies & TV shows — Reel'}
        description="Search the full catalog of movies and TV shows and add anything to your list."
        path="/search"
        noindex
      />
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <SearchBar
            key={query}
            defaultValue={query}
            onSearch={setQuery}
            autoFocus
            placeholder="Search movies and TV shows..."
            className="flex-1 max-w-2xl"
          />
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight truncate">
            {query ? `Results for “${query}”` : 'Search'}
          </h1>
          <div className="flex items-center gap-1 p-1 rounded-full bg-secondary/60 shrink-0">
            {(['movie', 'tv'] as MediaType[]).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'px-4 h-8 rounded-full text-sm font-medium transition-colors',
                  type === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'movie' ? 'Movies' : 'Shows'}
              </button>
            ))}
          </div>
        </div>

        {!query ? (
          <EmptyState
            icon={SearchIcon}
            title="Search the catalog"
            description="Type a movie or show title to get started."
          />
        ) : results.isLoading ? (
          <MediaGridSkeleton count={12} />
        ) : results.isError ? (
          <EmptyState icon={AlertTriangle} title="Couldn't load results" description="Something went wrong reaching the catalog.">
            <Button className="rounded-full" onClick={() => results.refetch()}>Try again</Button>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No results found"
            description={`No ${type === 'movie' ? 'movies' : 'shows'} match “${query}”. Try the other tab or a different spelling.`}
          />
        ) : (
          <>
            <MediaGrid items={items} mediaType={type} onItemClick={openTitle} />
            <div ref={loadMoreRef} className="py-4">
              {results.isFetchingNextPage && <MediaGridSkeleton count={6} />}
              {!results.hasNextPage && (
                <p className="text-center text-xs text-muted-foreground py-2">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
