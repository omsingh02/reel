import { useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Clapperboard, Tv } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { Seo } from '@/components/Seo';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { searchMedia, cleanMediaList } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
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

  const lastPage = results.data?.pages[results.data.pages.length - 1];
  const reachedCap = !!lastPage && lastPage.page < lastPage.total_pages;

  // Keep poster-less results: obscure and brand-new titles often have none yet,
  // and dropping them made some titles impossible to find.
  const items = useMemo(() => {
    const flat = results.data?.pages.flatMap(p => p.results) ?? [];
    return cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[], { requirePoster: false }).filter(it => !isHidden(it.id, type));
  }, [results.data, isHidden, type]);

  // Nothing on the default (Movies) tab but hits on the other one? Switch for
  // the user instead of making them discover the tab.
  const typeInUrl = params.get('type');
  const otherType: MediaType = type === 'movie' ? 'tv' : 'movie';
  const other = useQuery({
    queryKey: ['search-probe', query, otherType],
    queryFn: () => searchMedia(query, otherType, 1),
    enabled: !!query && !typeInUrl && results.isSuccess && items.length === 0,
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
  useEffect(() => {
    if (!typeInUrl && results.isSuccess && items.length === 0 && (other.data?.results.length ?? 0) > 0) {
      setType(otherType);
    }
  }, [typeInUrl, results.isSuccess, items.length, other.data, otherType, setType]);

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
      <PageHeader
        eyebrow="Search"
        title={query ? <>Results for &ldquo;{query}&rdquo;</> : 'Search'}
        className="pb-5 sm:pb-6"
      />

      <PageContainer className="space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            key={query}
            defaultValue={query}
            onSearch={setQuery}
            autoFocus
            placeholder="Search movies and TV shows…"
            className="flex-1 sm:max-w-2xl"
          />
          <Segmented<MediaType>
            aria-label="Search in"
            value={type}
            onValueChange={setType}
            options={[
              { value: 'movie', label: 'Movies', icon: <Clapperboard /> },
              { value: 'tv', label: 'Shows', icon: <Tv /> },
            ]}
            className="self-start sm:self-auto"
          />
        </div>

        {query && results.isSuccess && (
          <p role="status" className="sr-only">
            {items.length === 0 ? 'No results' : `${items.length} ${items.length === 1 ? 'result' : 'results'} loaded`}
          </p>
        )}

        {!query ? (
          <EmptyState
            art="search"
            title="Search the catalogue"
            description="Type a movie or show title to get started."
          />
        ) : results.isLoading ? (
          <MediaGridSkeleton count={12} />
        ) : results.isError ? (
          <EmptyState art="error" title="Couldn't load results" description="Something went wrong reaching the catalogue. Check your connection and try again.">
            <Button onClick={() => results.refetch()}>Try again</Button>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            art="search"
            title="No results found"
            description={`No ${type === 'movie' ? 'movies' : 'shows'} match “${query}”. Try the other tab or a different spelling.`}
          />
        ) : (
          <>
            <h2 className="sr-only">Search results</h2>
            <MediaGrid items={items} mediaType={type} onItemClick={openTitle} />
            <div ref={loadMoreRef} className="pb-4">
              {results.isFetchingNextPage && <MediaGridSkeleton count={6} />}
              {!results.hasNextPage && (
                <p className="label-mono py-8 text-center">
                  {reachedCap
                    ? `Showing the top ${PAGE_CAP * 20} results — try a more specific search`
                    : "You've reached the end"}
                </p>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </Layout>
  );
}
