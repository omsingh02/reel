import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { MediaTypeFilter } from '@/components/MediaTypeFilter';
import { SortSelect, SortOption } from '@/components/SortSelect';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getTrending, sortMedia } from '@/lib/tmdb';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

export default function Trending() {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
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
    staleTime: 5 * 60 * 1000,
  });

  const rawItems = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || [];
  }, [data]);

  const items = useMemo(() => {
    return sortMedia(rawItems as (TMDBMovie | TMDBTVShow)[], sortBy);
  }, [rawItems, sortBy]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: () => fetchNextPage(),
    hasMore: !!hasNextPage,
    isLoading: isFetchingNextPage,
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
        <div className="flex items-center justify-between gap-3 px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">Trending This Week</h1>
          <div className="flex items-center gap-2">
            <SortSelect
              value={sortBy}
              onChange={setSortBy}
              className="w-32"
            />
            <MediaTypeFilter 
              value={mediaType} 
              onChange={setMediaType} 
            />
          </div>
        </div>
      </header>

      <div className="flex-1 px-5 lg:px-8 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No trending content"
            description="Check back later for trending movies and TV shows"
          />
        ) : (
          <>
            <MediaGrid
              items={items}
              mediaType={mediaType}
              onItemClick={handleMediaClick}
            />
            
            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {isFetchingNextPage && <LoadingSpinner size="sm" />}
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
