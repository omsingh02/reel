import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tv } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { searchMedia, getPopular } from '@/lib/tmdb';
import type { MediaType } from '@/types/tmdb';

export default function TVShows() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const { data: popularData, isLoading: popularLoading } = useQuery({
    queryKey: ['popular', 'tv'],
    queryFn: () => getPopular('tv'),
    enabled: !searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery, 'tv'],
    queryFn: () => searchMedia(searchQuery, 'tv'),
    enabled: !!searchQuery,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = searchQuery ? searchLoading : popularLoading;
  const items = searchQuery ? (searchData?.results || []) : (popularData?.results || []);

  const handleMediaClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
          <h1 className="text-lg font-semibold hidden sm:block">TV Shows</h1>
          <SearchBar 
            onSearch={setSearchQuery} 
            placeholder="Search TV shows..."
            className="flex-1 max-w-md" 
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-6 py-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold sm:hidden">TV Shows</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery ? `Results for "${searchQuery}"` : 'Popular TV shows right now'}
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
          <MediaGrid
            items={items}
            mediaType="tv"
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
