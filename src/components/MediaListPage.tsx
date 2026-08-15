import { useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { MediaGrid } from '@/components/MediaGrid';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import { SearchLink } from '@/components/SearchLink';
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
  emptyIcon: LucideIcon;
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
export function MediaListPage({ title, mediaType, emptyIcon: EmptyIcon, subtitle }: MediaListPageProps) {
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
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <span className="text-xl font-semibold">{title}</span>
          <SearchLink className="ml-auto" />
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 space-y-5">
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <FiltersBar mediaType={mediaType} value={filters} onChange={setFilters} />
        </div>

        {isLoading ? (
          <MediaGridSkeleton count={12} />
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load results"
            description="Something went wrong reaching the catalog. Check your connection and try again."
          >
            <Button onClick={() => refetch()} className="rounded-full">Try again</Button>
          </EmptyState>
        ) : items.length === 0 ? (
          <EmptyState
            icon={EmptyIcon}
            title="Nothing matches these filters"
            description="Try widening the year range or lowering the minimum rating."
          >
            {hasActiveFilters(filters) && (
              <Button variant="outline" className="rounded-full" onClick={() => setFilters(DEFAULT_FILTERS)}>
                Clear filters
              </Button>
            )}
          </EmptyState>
        ) : (
          <>
            <MediaGrid items={items} mediaType={mediaType} onItemClick={openTitle} />
            <div ref={loadMoreRef} className="py-4">
              {isFetchingNextPage && <MediaGridSkeleton count={6} />}
              {!hasNextPage && (
                <p className="text-center text-xs text-muted-foreground py-2">You've reached the end</p>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
