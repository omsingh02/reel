import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
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
  /** Sync ?movie= / ?tv= deep links to the open details modal. */
  enableDeepLinks?: boolean;
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
  enableDeepLinks = false,
}: MediaListPageProps) {
  const [switchableType, setSwitchableType] = useState<MediaType>('movie');
  const mediaType = fixedMediaType ?? switchableType;
  const allowSwitch = !fixedMediaType;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  // Deep-link parsing (Index page only)
  useEffect(() => {
    if (!enableDeepLinks) return;
    const params = new URLSearchParams(window.location.search);
    const parseId = (v: string | null) => {
      if (!v) return NaN;
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };
    const movieId = parseId(params.get('movie'));
    const tvId = parseId(params.get('tv'));
    if (!Number.isNaN(movieId)) setSelectedMedia({ id: movieId, type: 'movie' });
    else if (!Number.isNaN(tvId)) setSelectedMedia({ id: tvId, type: 'tv' });
  }, [enableDeepLinks]);

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

  const rawItems = useMemo(() => {
    const flat = data?.pages.flatMap(page => page.results) || [];
    return cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[]);
  }, [data]);

  const items = useMemo(() => sortMedia(rawItems, sortBy), [rawItems, sortBy]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
  });

  const handleMediaClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
    if (enableDeepLinks) {
      const url = new URL(window.location.href);
      url.searchParams.set(type, id.toString());
      window.history.replaceState({}, '', url);
    }
  }, [enableDeepLinks]);

  const handleCloseDetails = useCallback(() => {
    setSelectedMedia(null);
    if (enableDeepLinks) {
      const url = new URL(window.location.href);
      url.searchParams.delete('movie');
      url.searchParams.delete('tv');
      window.history.replaceState({}, '', url);
    }
  }, [enableDeepLinks]);

  useKeyboardShortcuts({
    onEscape: handleCloseDetails,
    enabled: !!selectedMedia,
  });

  const headingPrefix = searchQuery
    ? `Results for "${searchQuery}"`
    : allowSwitch
      ? `Trending ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`
      : title;

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/60">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 h-16">
          {!allowSwitch && (
            <h1 className="text-xl font-extrabold italic tracking-tight uppercase hidden sm:block">
              {title}<span className="text-primary">.</span>
            </h1>
          )}
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

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-8">
        <div className="mb-8 flex items-end justify-between gap-4 border-b border-border/40 pb-5">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              {searchQuery ? 'Search // Results' : source === 'trending' ? 'Index // Trending Now' : 'Index // Popular'}
            </p>
            {allowSwitch ? (
              <h1 className="text-2xl sm:text-3xl font-extrabold italic tracking-tight uppercase truncate">
                {headingPrefix}<span className="text-primary">.</span>
              </h1>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-extrabold italic tracking-tight uppercase truncate sm:hidden">
                {title}<span className="text-primary">.</span>
              </h2>
            )}
            {!isLoading && items.length > 0 && (
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-2">
                {searchQuery && !allowSwitch ? `"${searchQuery}" · ` : ''}
                {items.length} {items.length === 1 ? 'title' : 'titles'}
                {!searchQuery && !allowSwitch ? ` · ${defaultSubtitle}` : ''}
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
