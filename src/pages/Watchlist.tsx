import { useState, useCallback } from 'react';
import { List, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WatchlistCard } from '@/components/WatchlistCard';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import type { MediaType } from '@/types/tmdb';

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoading } = useWatchlistDB();
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);
  const navigate = useNavigate();

  const handleItemClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">My Watchlist</h1>
          {user && watchlist.length > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              ({watchlist.length} {watchlist.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 px-5 lg:px-8 py-6">
        {!user && !authLoading ? (
          <EmptyState
            icon={LogIn}
            title="Sign in to access your watchlist"
            description="Create an account to save movies and TV shows across devices"
          >
            <Button onClick={() => navigate('/auth')} className="mt-4 rounded-full">
              Sign In
            </Button>
          </EmptyState>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
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
                key={`${item.tmdb_type}-${item.tmdb_id}`}
                item={{
                  id: item.tmdb_id,
                  mediaType: item.tmdb_type,
                  title: item.title,
                  posterPath: item.poster_path,
                  releaseDate: item.release_date || '',
                  voteAverage: item.vote_average || 0,
                  addedAt: item.added_at,
                }}
                onClick={() => handleItemClick(item.tmdb_id, item.tmdb_type)}
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
