import { useState, useCallback } from 'react';
import { List } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { WatchlistCard } from '@/components/WatchlistCard';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { MediaType } from '@/types/tmdb';

export default function Watchlist() {
  const { watchlist } = useWatchlist();
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);

  const handleItemClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 lg:px-6 h-14">
          <h1 className="text-lg font-semibold">My Watchlist</h1>
          {watchlist.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({watchlist.length} {watchlist.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 lg:px-6 py-6">
        {watchlist.length === 0 ? (
          <EmptyState
            icon={List}
            title="Your watchlist is empty"
            description="Start adding movies and TV shows to keep track of what you want to watch"
          />
        ) : (
          <div className="space-y-2 max-w-2xl">
            {watchlist.map((item) => (
              <WatchlistCard
                key={`${item.mediaType}-${item.id}`}
                item={item}
                onClick={() => handleItemClick(item.id, item.mediaType)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Panel */}
      {selectedMedia && (
        <MediaDetails
          id={selectedMedia.id}
          mediaType={selectedMedia.type}
          onClose={() => setSelectedMedia(null)}
          onNavigate={handleItemClick}
        />
      )}
    </Layout>
  );
}
