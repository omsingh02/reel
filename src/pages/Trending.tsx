import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { MediaTypeFilter } from '@/components/MediaTypeFilter';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getTrending } from '@/lib/tmdb';
import type { MediaType } from '@/types/tmdb';

export default function Trending() {
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['trending', mediaType],
    queryFn: () => getTrending(mediaType),
    staleTime: 5 * 60 * 1000,
  });

  const items = data?.results || [];

  const handleMediaClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <h1 className="text-lg font-semibold">Trending This Week</h1>
          <MediaTypeFilter 
            value={mediaType} 
            onChange={setMediaType} 
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-6 py-6">
        {isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No trending content"
            description="Check back later for trending movies and TV shows"
          />
        ) : (
          <MediaGrid
            items={items}
            mediaType={mediaType}
            onItemClick={handleMediaClick}
          />
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
