import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Tv } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import { searchMedia, getPopular, sortMedia, cleanMediaList } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export default function TVShows() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const {
    data: popularData,
    isLoading: popularLoading,
    fetchNextPage: fetchNextPopular,
    hasNextPage: hasMorePopular,
    isFetchingNextPage: isFetchingPopular,
  } = useInfiniteQuery({
    queryKey: ['popular', 'tv'],
    queryFn: ({ pageParam = 1 }) => getPopular('tv', pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 10) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: searchData,
    isLoading: searchLoading,
    fetchNextPage: fetchNextSearch,
    hasNextPage: hasMoreSearch,
    isFetchingNextPage: isFetchingSearch,
  } = useInfiniteQuery({
    queryKey: ['search', searchQuery, 'tv'],
    queryFn: ({ pageParam = 1 }) => searchMedia(searchQuery, 'tv', pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages && lastPage.page < 10) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = searchQuery ? searchLoading : popularLoading;
  const isFetchingMore = searchQuery ? isFetchingSearch : isFetchingPopular;
  const hasMore = searchQuery ? hasMoreSearch : hasMorePopular;
  const fetchMore = searchQuery ? fetchNextSearch : fetchNextPopular;

  const rawItems = useMemo(() => {
    const data = searchQuery ? searchData : popularData;
    const flat = data?.pages.flatMap(page => page.results) || [];
    return cleanMediaList(flat as (TMDBMovie | TMDBTVShow)[]);
  }, [searchQuery, searchData, popularData]);

  const items = useMemo(() => {
    return sortMedia(rawItems, sortBy);
  }, [rawItems, sortBy]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchMore(),
    hasMore: !!hasMore,
    isLoading: isFetchingMore,
  });

  const handleMediaClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  useKeyboardShortcuts({
    onEscape: () => setSelectedMedia(null),
    enabled: !!selectedMedia,
  });

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold hidden sm:block">TV Shows</h1>
          <SearchBar 
            onSearch={setSearchQuery} 
            placeholder="Search TV shows..."
            className="flex-1 max-w-md" 
          />
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            className="w-32"
          />
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold sm:hidden">TV Shows</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `Results for "${searchQuery}"` : 'Popular TV shows right now'}
            {!isLoading && items.length > 0 && ` • ${items.length} results`}
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Tv}
            title="No TV shows found"
            description={searchQuery ? 'Try a different search term' : 'Check back later'}
          />
        ) : (
          <>
            <MediaGrid
              items={items}
              mediaType="tv"
              onItemClick={handleMediaClick}
            />
            
            <div ref={loadMoreRef} className="py-4">
              {isFetchingMore && <MediaGridSkeleton count={6} />}
            </div>
          </>
        )}
      </div>

      {selectedMedia && (
        <MediaDetails
          id={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={() => setSelectedMedia(null)}
          onNavigate={handleMediaClick}
        />
      )}
    </Layout>
  );
}
