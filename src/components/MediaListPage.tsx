import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { MediaTypeFilter } from '@/components/MediaTypeFilter';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import {
  searchMedia,
  getTrending,
  getPopular,
  sortMedia,
  cleanMediaList,
} from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useHidden } from '@/hooks/useHidden';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

type Source = 'trending' | 'popular';

export interface MediaListPageProps {
  /** Title rendered in the header (and as h2 on mobile when allowMediaTypeSwitch is false). */
  title: string;
  /** When provided, page is locked to this media type; otherwise user can switch. */
  fixedMediaType?: MediaType;
  /** Which catalog endpoint to use for the default (non-search) listing. */
  source: Source;
  /** Icon shown in the "no results" empty state. */
  emptyIcon: LucideIcon;
  /** Search placeholder. */
  searchPlaceholder?: string;
  /** Subtitle prefix when not searching (e.g. "Popular movies right now"). */
  defaultSubtitle: string;
}

const PAGE_CAP = 10;

function buildPageParam(lastPage: { page: number; total_pages: number; results: unknown[] }) {
  if (lastPage.page < lastPage.total_pages && lastPage.page < PAGE_CAP) {
    return lastPage.page + 1;
  }
  return undefined;
}

export function MediaListPage({
  title,
  fixedMediaType,
  source,
  emptyIcon: EmptyIcon,
  searchPlaceholder,
  defaultSubtitle,
}: MediaListPageProps) {
  const [switchableType, setSwitchableType] = useState<MediaType>('movie');
  const mediaType = fixedMediaType ?? switchableType;
  const allowSwitch = !fixedMediaType;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const baseFetcher = source === 'trending' ? getTrending : getPopular;

  const baseQuery = useInfiniteQuery({
    queryKey: [source, mediaType],
    queryFn: ({ pageParam = 1 }) => baseFetcher(mediaType, pageParam),
    getNextPageParam: buildPageParam,
    initialPageParam: 1,
    enabled: !searchQuery,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const searchQueryResult = useInfiniteQuery({
    queryKey: ['search', searchQuery, mediaType],
    queryFn: ({ pageParam = 1 }) => searchMedia(searchQuery, mediaType, pageParam),
    getNextPageParam: buildPageParam,
    initialPageParam: 1,
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const active = searchQuery ? searchQueryResult : baseQuery;
  const { isLoading, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage, data } = active;

  const { isHidden } = useHidden();

  const rawItems = useMemo(() => {
    const flat = data?.pages.flatMap(page => page.results) || [];
    const cleaned = cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[]);
    // Filter out items the user has marked "not interested".
    return cleaned.filter(it => !isHidden(it.id, mediaType));
  }, [data, isHidden, mediaType]);

  const items = useMemo(() => sortMedia(rawItems, sortBy), [rawItems, sortBy]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const handleMediaClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  // Note: Escape handling for the open modal is owned by MediaDetails itself
  // (it needs to close nested layers like the trailer/StreamPlayer first).
  // A duplicate listener here would close the whole modal on the same keypress.

  const headingPrefix = searchQuery
    ? `Results for "${searchQuery}"`
    : allowSwitch
      ? `Trending ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`
      : title;

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 h-16">
          {!allowSwitch && <span className="text-xl font-semibold hidden sm:block">{title}</span>}
          <SearchBar
            onSearch={setSearchQuery}
            placeholder={searchPlaceholder}
            className="flex-1 max-w-md"
          />
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            className={allowSwitch ? 'w-32 hidden sm:flex' : 'w-32'}
          />
          {allowSwitch && (
            <MediaTypeFilter value={mediaType} onChange={setSwitchableType} />
          )}
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            {allowSwitch ? (
              <h1 className="text-xl font-semibold">{headingPrefix}</h1>
            ) : (
              <>
                <h2 className="text-xl font-semibold sm:hidden">{title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchQuery ? headingPrefix : defaultSubtitle}
                  {!isLoading && items.length > 0 && ` • ${items.length} results`}
                </p>
              </>
            )}
            {allowSwitch && !isLoading && items.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
          {allowSwitch && (
            <SortSelect value={sortBy} onChange={setSortBy} className="w-32 sm:hidden" />
          )}
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
            title={searchQuery ? 'No results found' : 'Nothing to show yet'}
            description={
              searchQuery
                ? `No matches for "${searchQuery}". Try a different search term.`
                : 'Check back later.'
            }
          />
        ) : (
          <>
            <MediaGrid items={items} mediaType={mediaType} onItemClick={handleMediaClick} />
            <div ref={loadMoreRef} className="py-4">
              {isFetchingNextPage && <MediaGridSkeleton count={6} />}
              {!hasNextPage && items.length > 0 && (
                <p className="text-center text-xs text-muted-foreground py-2">
                  You've reached the end
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {selectedMedia && (
        <MediaDetails
          id={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={handleCloseDetails}
          onNavigate={handleMediaClick}
        />
      )}
    </Layout>
  );
}
