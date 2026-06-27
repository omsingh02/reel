import { useState, useCallback, useMemo } from 'react';
import { List, LogIn, Filter as FilterIcon, CalendarDays, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { WatchlistCard } from '@/components/WatchlistCard';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { MediaType, WatchlistItem } from '@/types/tmdb';

type StatusFilter = 'all' | 'watchlist' | 'watched';
type TypeFilter = 'all' | 'movie' | 'tv';
type SortKey = 'added' | 'title' | 'release' | 'rating';

export default function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const { watchlist, isLoading } = useWatchlist();
  const [selectedMedia, setSelectedMedia] = useState<{ id: number; type: MediaType } | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [sort, setSort] = useState<SortKey>('added');
  const navigate = useNavigate();

  const handleItemClick = useCallback((id: number, type: MediaType) => {
    setSelectedMedia({ id, type });
  }, []);

  const filtered = useMemo(() => {
    const out = watchlist.filter(it => {
      const s = it.status ?? 'watchlist';
      if (status !== 'all' && s !== status) return false;
      if (type !== 'all' && it.mediaType !== type) return false;
      return true;
    });
    const sorted = [...out];
    sorted.sort((a, b) => {
      switch (sort) {
        case 'title': return a.title.localeCompare(b.title);
        case 'release': {
          const ta = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const tb = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return (isNaN(tb) ? 0 : tb) - (isNaN(ta) ? 0 : ta);
        }
        case 'rating': return (b.voteAverage || 0) - (a.voteAverage || 0);
        case 'added':
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      }
    });
    return sorted;
  }, [watchlist, status, type, sort]);

  const showSignInPrompt = !user && !authLoading && watchlist.length === 0;
  const watchedCount = watchlist.filter(w => (w.status ?? 'watchlist') === 'watched').length;

  return (
    <Layout>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">My Watchlist</h1>
          {watchlist.length > 0 && (
            <span className="text-sm text-muted-foreground">
              ({watchlist.length} · {watchedCount} watched)
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/upcoming"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">Upcoming</span>
            </Link>
            <Link
              to="/stats"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
            >
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Stats</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6">
        {!showSignInPrompt && watchlist.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-36 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="watchlist">To watch</SelectItem>
                <SelectItem value="watched">Watched</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => setType(v as TypeFilter)}>
              <SelectTrigger className="w-32 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="added">Recently added</SelectItem>
                <SelectItem value="title">Title (A–Z)</SelectItem>
                <SelectItem value="release">Newest release</SelectItem>
                <SelectItem value="rating">Highest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

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
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FilterIcon}
            title="Nothing matches"
            description="Try clearing or changing your filters."
          >
            <Button
              variant="outline"
              className="rounded-full mt-3"
              onClick={() => { setStatus('all'); setType('all'); setSort('added'); }}
            >
              Reset filters
            </Button>
          </EmptyState>
        ) : (
          <div className="space-y-2 max-w-2xl">
            {filtered.map((item: WatchlistItem) => (
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
