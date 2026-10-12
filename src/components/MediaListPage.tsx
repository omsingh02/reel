import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { MediaGrid } from '@/components/MediaGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import {
  FiltersBar,
  DEFAULT_FILTERS,
  hasActiveFilters,
  type CatalogFilters,
} from '@/components/FiltersBar';
import { discoverMedia, cleanMediaList } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export interface MediaListPageProps {
  title: string;
  mediaType: MediaType;
  subtitle: string;
}

const PAGE_CAP = 10;

function buildPageParam(lastPage: { page: number; total_pages: number; results: unknown[] }) {
  return lastPage.page < lastPage.total_pages && lastPage.page < PAGE_CAP
    ? lastPage.page + 1
    : undefined;
}

/**
 * Catalog page (Movies / Shows). Filters live in the URL so a filtered view
 * is shareable and survives back/forward navigation.
 */
export function MediaListPage({ title, mediaType, subtitle }: MediaListPageProps) {
  const [params, setParams] = useSearchParams();
  const openTitle = useOpenTitle();
  const { isHidden } = useHidden();

  const filters: CatalogFilters = useMemo(
    () => ({
      genre: params.get('genre') ?? '',
      year: params.get('year') ?? '',
      minRating: params.get('rating') ?? '',
      sort: params.get('sort') ?? DEFAULT_FILTERS.sort,
    }),
    [params]
  );

  const setFilters = useCallback(
    (next: CatalogFilters) => {
      const sp = new URLSearchParams();
      if (next.genre) sp.set('genre', next.genre);
      if (next.year) sp.set('year', next.year);
      if (next.minRating) sp.set('rating', next.minRating);
      if (next.sort !== DEFAULT_FILTERS.sort) sp.set('sort', next.sort);
      setParams(sp, { replace: true });
    },
    [setParams]
  );

  const query = useInfiniteQuery({
    queryKey: ['discover', mediaType, filters],
    queryFn: ({ pageParam = 1 }) =>
      discoverMedia(
        mediaType,
        { genre: filters.genre, year: filters.year, minRating: filters.minRating, sortBy: filters.sort },
        pageParam
      ),
    getNextPageParam: buildPageParam,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, data } = query;
  const lastPage = data?.pages[data.pages.length - 1];
  const reachedCap = !!lastPage && lastPage.page < lastPage.total_pages;

  const items = useMemo(() => {
    const flat = data?.pages.flatMap(page => page.results) ?? [];
    return cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[]).filter(it => !isHidden(it.id, mediaType));
  }, [data, isHidden, mediaType]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  return (
    <Layout>
      <PageHeader eyebrow="Browse" title={title} description={subtitle} />

      <PageContainer className="space-y-8">
        <FiltersBar mediaType={mediaType} value={filters} onChange={setFilters} />

        {isLoading ? (
          <MediaGridSkeleton count={12} />
        ) : isError ? (
          <EmptyState
            art="error"
            title="Couldn't load this list"
            description="Something went wrong reaching the catalogue. Check your connection and try again."
          >
            <Button onClick={() => refetch()}>Try again</Button>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            art="search"
            title="Nothing matches these filters"
            description="Try a different genre or year, or lower the minimum rating."
          >
            {hasActiveFilters(filters) && (
              <Button variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <h2 className="sr-only">{title} results</h2>
            <MediaGrid items={items} mediaType={mediaType} onItemClick={openTitle} />
            <div ref={loadMoreRef} className="pb-4">
              {isFetchingNextPage && <MediaGridSkeleton count={6} />}
              {!hasNextPage && (
                <p className="label-mono py-8 text-center">
                  {reachedCap
                    ? `Showing the top ${PAGE_CAP * 20} results — use the filters to narrow it down`
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
