import { useState, useCallback, useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { MediaTypeFilter } from '@/components/MediaTypeFilter';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { searchMedia, getTrending, sortMedia } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  // Handle URL params for deep linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const movieId = params.get('movie');
    const tvId = params.get('tv');
    
    if (movieId) {
      setSelectedMedia({ id: parseInt(movieId), type: 'movie' });
    } else if (tvId) {
      setSelectedMedia({ id: parseInt(tvId), type: 'tv' });
    }
  }, []);

  const {
    data: trendingData,
    isLoading: trendingLoading,
    fetchNextPage: fetchNextTrending,
    hasNextPage: hasMoreTrending,
    isFetchingNextPage: isFetchingTrending,
  } = useInfiniteQuery({
    queryKey: ['trending', mediaType],
    queryFn: ({ pageParam = 1 }) => getTrending(mediaType, pageParam),
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
    queryKey: ['search', searchQuery, mediaType],
    queryFn: ({ pageParam = 1 }) => searchMedia(searchQuery, mediaType, pageParam),
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

  const isLoading = searchQuery ? searchLoading : trendingLoading;
  const isFetchingMore = searchQuery ? isFetchingSearch : isFetchingTrending;
  const hasMore = searchQuery ? hasMoreSearch : hasMoreTrending;
  const fetchMore = searchQuery ? fetchNextSearch : fetchNextTrending;

  const rawItems = useMemo(() => {
    const data = searchQuery ? searchData : trendingData;
    return data?.pages.flatMap(page => page.results) || [];
  }, [searchQuery, searchData, trendingData]);

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
    // Update URL for deep linking
    const url = new URL(window.location.href);
    url.searchParams.set(type, id.toString());
    window.history.replaceState({}, '', url);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedMedia(null);
    // Clear URL params
    const url = new URL(window.location.href);
    url.searchParams.delete('movie');
    url.searchParams.delete('tv');
    window.history.replaceState({}, '', url);
  }, []);

  useKeyboardShortcuts({
    onEscape: handleCloseDetails,
    enabled: !!selectedMedia,
  });

  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-4 lg:px-6 h-14">
          <SearchBar 
            onSearch={setSearchQuery} 
            className="flex-1 max-w-md" 
          />
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            className="w-32 hidden sm:flex"
          />
          <MediaTypeFilter 
            value={mediaType} 
            onChange={setMediaType} 
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {searchQuery ? `Results for "${searchQuery}"` : `Trending ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`}
            </h1>
            {!isLoading && items.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {items.length} {items.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
          <SortSelect
            value={sortBy}
            onChange={setSortBy}
            className="w-32 sm:hidden"
          />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No results found"
            description={searchQuery ? `Try a different search term` : 'Start searching for movies and TV shows'}
          />
        ) : (
          <>
            <MediaGrid
              items={items}
              mediaType={mediaType}
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
          onClose={handleCloseDetails}
          onNavigate={handleMediaClick}
        />
      )}
    </Layout>
  );
}
