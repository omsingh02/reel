import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Film } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { searchMedia, getPopular, sortMedia } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export default function Movies() {
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
    queryKey: ['popular', 'movie'],
    queryFn: ({ pageParam = 1 }) => getPopular('movie', pageParam),
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
    queryKey: ['search', searchQuery, 'movie'],
    queryFn: ({ pageParam = 1 }) => searchMedia(searchQuery, 'movie', pageParam),
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
    return data?.pages.flatMap(page => page.results) || [];
  }, [searchQuery, searchData, popularData]);

  const items = useMemo(() => {
    return sortMedia(rawItems as (TMDBMovie | TMDBTVShow)[], sortBy);
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
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
          <h1 className="text-lg font-semibold hidden sm:block">Movies</h1>
          <SearchBar 
            onSearch={setSearchQuery} 
            placeholder="Search movies..."
            className="flex-1 max-w-md" 
          />
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            className="w-32"
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold sm:hidden">Movies</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `Results for "${searchQuery}"` : 'Popular movies right now'}
            {!isLoading && items.length > 0 && ` • ${items.length} results`}
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Film}
            title="No movies found"
            description={searchQuery ? 'Try a different search term' : 'Check back later'}
          />
        ) : (
          <>
            <MediaGrid
              items={items}
              mediaType="movie"
              onItemClick={handleMediaClick}
            />
            
            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingMore && <LoadingSpinner size="sm" />}
            </div>
          </>
        )}
      </div>

      {/* Details Panel */}
      {selectedMedia && (
        <MediaDetails
          id={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </Layout>
  );
}
