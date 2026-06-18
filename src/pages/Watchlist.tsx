import { useState, useCallback } from 'react';
import { List, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WatchlistCard } from '@/components/WatchlistCard';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { MediaType } from '@/types/tmdb';

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoading } = useWatchlist();
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);
  const navigate = useNavigate();

  const handleItemClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  const showSignInPrompt = !user && !authLoading && watchlist.length === 0;

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">My Watchlist</h1>
          {watchlist.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({watchlist.length} {watchlist.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6">
        {authLoading || isLoading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : showSignInPrompt ? (
          <EmptyState
            icon={LogIn}
            title="Sign in to sync your watchlist"
            description="Create an account to save movies and TV shows across devices"
          >
            <Button onClick={() => navigate('/auth')} className="mt-4 rounded-full">
              Sign In
            </Button>
          </EmptyState>
        ) : watchlist.length === 0 ? (
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
