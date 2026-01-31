import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import type { TMDBMovie, TMDBTVShow, MediaType, WatchlistItem } from '@/types/tmdb';
import { getWatchlist, addToWatchlist as addLocal, removeFromWatchlist as removeLocal, isInWatchlist as checkLocal } from '@/lib/watchlist';

// This hook provides a unified interface for watchlist operations
// Uses database when authenticated, localStorage when not
export function useWatchlist() {
  const { user } = useAuth();
  const dbWatchlist = useWatchlistDB();

  // For unauthenticated users, use localStorage
  const localWatchlist = getWatchlist();
  
  const watchlist: WatchlistItem[] = user 
    ? dbWatchlist.watchlist.map(item => ({
        id: item.tmdb_id,
        mediaType: item.tmdb_type,
        title: item.title,
        posterPath: item.poster_path,
        releaseDate: item.release_date || '',
        voteAverage: item.vote_average || 0,
        addedAt: item.added_at,
      }))
    : localWatchlist;

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType) => {
    if (user) {
      dbWatchlist.addToWatchlist(media, mediaType);
    } else {
      addLocal(media, mediaType);
    }
  }, [user, dbWatchlist]);

  const removeFromWatchlist = useCallback((id: number, mediaType: MediaType) => {
    if (user) {
      dbWatchlist.removeFromWatchlist(id, mediaType);
    } else {
      removeLocal(id, mediaType);
    }
  }, [user, dbWatchlist]);

  const isInWatchlist = useCallback((id: number, mediaType: MediaType) => {
    if (user) {
      return dbWatchlist.isInWatchlist(id, mediaType);
    }
    return checkLocal(id, mediaType);
  }, [user, dbWatchlist]);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isLoading: user ? dbWatchlist.isLoading : false,
  };
}
