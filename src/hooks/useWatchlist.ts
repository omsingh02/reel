import { useCallback, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import type { TMDBMovie, TMDBTVShow, MediaType, WatchlistItem, WatchlistStatus } from '@/types/tmdb';
import {
  getWatchlist,
  subscribeWatchlist,
  addToWatchlist as addLocal,
  removeFromWatchlist as removeLocal,
  isInWatchlist as checkLocal,
  setWatchedStatus as setLocalStatus,
} from '@/lib/watchlist';

export function useWatchlist() {
  const { user } = useAuth();
  const dbWatchlist = useWatchlistDB();

  const localWatchlist = useSyncExternalStore(
    subscribeWatchlist,
    getWatchlist,
    getWatchlist,
  );

  const watchlist: WatchlistItem[] = user
    ? dbWatchlist.watchlist.map(item => ({
        id: item.tmdb_id,
        mediaType: item.tmdb_type as MediaType,
        title: item.title,
        posterPath: item.poster_path,
        releaseDate: item.release_date || '',
        voteAverage: item.vote_average || 0,
        addedAt: item.added_at,
        status: (item.status as WatchlistStatus) ?? 'watchlist',
        rating: item.rating,
        watchedAt: item.watched_at,
        runtime: item.runtime,
      }))
    : localWatchlist;

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType) => {
    if (user) dbWatchlist.addToWatchlist(media, mediaType);
    else addLocal(media, mediaType);
  }, [user, dbWatchlist]);

  const removeFromWatchlist = useCallback((id: number, mediaType: MediaType) => {
    if (user) dbWatchlist.removeFromWatchlist(id, mediaType);
    else removeLocal(id, mediaType);
  }, [user, dbWatchlist]);

  const isInWatchlist = useCallback((id: number, mediaType: MediaType) => {
    if (user) return dbWatchlist.isInWatchlist(id, mediaType);
    return checkLocal(id, mediaType);
  }, [user, dbWatchlist]);

  const setWatched = useCallback(
    (
      id: number,
      mediaType: MediaType,
      patch: { status?: WatchlistStatus; rating?: number | null; watchedAt?: string | null; runtime?: number | null }
    ) => {
      if (user) {
        // Only forward fields the caller explicitly set — otherwise toggling
        // "watched" would null out an existing rating, and rating an item
        // would null out its watched_at timestamp.
        const dbPatch: Partial<{ status: WatchlistStatus; rating: number | null; watched_at: string | null; runtime: number | null }> = {};
        if (patch.status !== undefined) dbPatch.status = patch.status;
        if (patch.rating !== undefined) dbPatch.rating = patch.rating;
        if (patch.watchedAt !== undefined) dbPatch.watched_at = patch.watchedAt;
        if (patch.runtime !== undefined) dbPatch.runtime = patch.runtime;
        dbWatchlist.updateItem(id, mediaType, dbPatch);
      } else {
        setLocalStatus(id, mediaType, patch);
      }
    },
    [user, dbWatchlist]
  );

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    setWatched,
    isLoading: user ? dbWatchlist.isLoading : false,
  };
}
