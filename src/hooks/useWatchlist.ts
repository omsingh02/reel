import { useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWatchlistDB } from '@/hooks/useWatchlistDB';
import type { TMDBMovie, TMDBTVShow, MediaType, WatchlistItem, WatchlistStatus } from '@/types/tmdb';
import { computeRuntime, getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';
import {
  getWatchlist,
  subscribeWatchlist,
  addToWatchlist as addLocal,
  removeFromWatchlist as removeLocal,
  isInWatchlist as checkLocal,
  setWatchedStatus as setLocalStatus,
  restoreWatchlistItem,
  type InitialState,
} from '@/lib/watchlist';

/** Cheap lookup (no credits/images) of a title's total runtime, cached for a day. */
export function useRuntimeLookup() {
  const queryClient = useQueryClient();
  return useCallback(
    async (id: number, mediaType: MediaType): Promise<number | null> => {
      try {
        const details = await queryClient.fetchQuery<TMDBMovieDetails | TMDBTVShowDetails>({
          queryKey: ['runtime-details', mediaType, id],
          queryFn: () => (mediaType === 'movie' ? getMovieDetails(id, { slim: true }) : getTVShowDetails(id, { slim: true })),
          staleTime: 24 * 60 * 60 * 1000,
        });
        return computeRuntime(details, mediaType);
      } catch {
        return null;
      }
    },
    [queryClient]
  );
}

/** Rebuild a TMDB-shaped object from a saved item so it can be re-added. */
function toMediaLike(item: WatchlistItem): TMDBMovie | TMDBTVShow {
  const base = {
    id: item.id,
    poster_path: item.posterPath,
    vote_average: item.voteAverage,
  } as Record<string, unknown>;
  if (item.mediaType === 'movie') {
    base.title = item.title;
    base.release_date = item.releaseDate;
  } else {
    base.name = item.title;
    base.first_air_date = item.releaseDate;
  }
  return base as unknown as TMDBMovie | TMDBTVShow;
}

export function useWatchlist() {
  const { user } = useAuth();
  const dbWatchlist = useWatchlistDB();
  const lookupRuntime = useRuntimeLookup();

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

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType, initial: InitialState = {}) => {
    if (user) {
      dbWatchlist.addToWatchlist(media, mediaType, {
        status: initial.status,
        rating: initial.rating ?? undefined,
        watched_at: initial.watchedAt ?? undefined,
        runtime: initial.runtime ?? undefined,
      });
    } else {
      addLocal(media, mediaType, initial);
    }
    toast.success(initial.status === 'watched' ? 'Marked as watched' : 'Added to watchlist');
  }, [user, dbWatchlist]);

  const removeFromWatchlist = useCallback((id: number, mediaType: MediaType) => {
    const removed = watchlist.find(i => i.id === id && i.mediaType === mediaType);
    if (user) dbWatchlist.removeFromWatchlist(id, mediaType);
    else removeLocal(id, mediaType);

    toast('Removed from watchlist', {
      action: removed
        ? {
            label: 'Undo',
            onClick: () => {
              if (user) dbWatchlist.restoreItem(removed);
              else restoreWatchlistItem(removed);
            },
          }
        : undefined,
    });
  }, [user, dbWatchlist, watchlist]);

  const isInWatchlist = useCallback((id: number, mediaType: MediaType) => {
    if (user) return dbWatchlist.isInWatchlist(id, mediaType);
    return checkLocal(id, mediaType);
  }, [user, dbWatchlist]);

  const applyPatch = useCallback(
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

  const setWatched = useCallback(
    (
      id: number,
      mediaType: MediaType,
      patch: { status?: WatchlistStatus; rating?: number | null; watchedAt?: string | null; runtime?: number | null }
    ) => {
      applyPatch(id, mediaType, patch);

      // Stats totals need a runtime. Whatever button marked the title watched
      // (card, details, rating stars), fill it in afterwards if it's missing.
      const existing = watchlist.find(i => i.id === id && i.mediaType === mediaType);
      if (patch.status === 'watched' && patch.runtime === undefined && !existing?.runtime) {
        void lookupRuntime(id, mediaType).then(runtime => {
          if (runtime) applyPatch(id, mediaType, { runtime });
        });
      }
    },
    [applyPatch, watchlist, lookupRuntime]
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
