import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TMDBMovie, TMDBTVShow, MediaType, WatchlistItem } from '@/types/tmdb';
import { getTitle, getReleaseDate } from '@/lib/tmdb';
import { toast } from 'sonner';

export interface WatchlistItemDB {
  id: string;
  user_id: string;
  tmdb_id: number;
  tmdb_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date: string | null;
  vote_average: number | null;
  added_at: string;
  status: string;
  rating: number | null;
  watched_at: string | null;
  runtime: number | null;
}

type Patch = Partial<Pick<WatchlistItemDB, 'status' | 'rating' | 'watched_at' | 'runtime'>>;

/** Everything a fresh row can carry beyond the TMDB basics, written in the same insert. */
export type InitialRow = Partial<Pick<WatchlistItemDB, 'status' | 'rating' | 'watched_at' | 'runtime'>> & { added_at?: string };

export function useWatchlistDB() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ['watchlist', user?.id];

  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: key,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .order('added_at', { ascending: false });
      if (error) throw error;
      return data as WatchlistItemDB[];
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    retry: 1,
  });

  /** Snapshot + optimistic write shared by every mutation below. */
  const optimistic = async (update: (prev: WatchlistItemDB[]) => WatchlistItemDB[]) => {
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<WatchlistItemDB[]>(key) ?? [];
    queryClient.setQueryData<WatchlistItemDB[]>(key, update(previous));
    return { previous };
  };

  const rollback = (ctx: { previous: WatchlistItemDB[] } | undefined) => {
    if (ctx) queryClient.setQueryData(key, ctx.previous);
  };

  const addMutation = useMutation({
    // Same scope = run one at a time, in the order started. Without it a quick add-then-remove
    // (or add-then-update) can reach the server out of order and leave the wrong state behind.
    scope: { id: 'watchlist-items' },
    mutationFn: async ({ media, mediaType, initial }: { media: TMDBMovie | TMDBTVShow; mediaType: MediaType; initial?: InitialRow }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('watchlist_items').insert({
        user_id: user.id,
        tmdb_id: media.id,
        tmdb_type: mediaType,
        title: getTitle(media),
        poster_path: media.poster_path,
        release_date: getReleaseDate(media),
        vote_average: media.vote_average,
        ...(initial ?? {}),
      });
      if (error && error.code !== '23505') throw error;
    },
    onMutate: ({ media, mediaType, initial }) =>
      optimistic(prev =>
        prev.some(i => i.tmdb_id === media.id && i.tmdb_type === mediaType)
          ? prev
          : [
              {
                id: `optimistic-${media.id}-${mediaType}`,
                user_id: user?.id ?? '',
                tmdb_id: media.id,
                tmdb_type: mediaType,
                title: getTitle(media),
                poster_path: media.poster_path,
                release_date: getReleaseDate(media),
                vote_average: media.vote_average,
                added_at: initial?.added_at ?? new Date().toISOString(),
                status: initial?.status ?? 'watchlist',
                rating: initial?.rating ?? null,
                watched_at: initial?.watched_at ?? null,
                runtime: initial?.runtime ?? null,
              },
              ...prev,
            ]
      ),
    onError: (error: Error, _vars, ctx) => {
      rollback(ctx);
      toast.error("Couldn't add", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const removeMutation = useMutation({
    scope: { id: 'watchlist-items' },
    mutationFn: async ({ tmdbId, mediaType }: { tmdbId: number; mediaType: MediaType }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('tmdb_id', tmdbId)
        .eq('tmdb_type', mediaType);
      if (error) throw error;
    },
    onMutate: ({ tmdbId, mediaType }) =>
      optimistic(prev => prev.filter(i => !(i.tmdb_id === tmdbId && i.tmdb_type === mediaType))),
    onError: (error: Error, _vars, ctx) => {
      rollback(ctx);
      toast.error("Couldn't remove", { description: error.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const updateMutation = useMutation({
    scope: { id: 'watchlist-items' },
    mutationFn: async (p: { tmdbId: number; mediaType: MediaType; patch: Patch }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('watchlist_items')
        .update(p.patch)
        .eq('user_id', user.id)
        .eq('tmdb_id', p.tmdbId)
        .eq('tmdb_type', p.mediaType);
      if (error) throw error;
    },
    onMutate: ({ tmdbId, mediaType, patch }) =>
      optimistic(prev =>
        prev.map(i => (i.tmdb_id === tmdbId && i.tmdb_type === mediaType ? { ...i, ...patch } : i))
      ),
    onError: (e: Error, _vars, ctx) => {
      rollback(ctx);
      toast.error("Couldn't update", { description: e.message });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType, initial?: InitialRow) => {
    addMutation.mutate({ media, mediaType, initial });
  }, [addMutation]);

  /** Undo for a removal: one insert carrying the full saved state, so nothing races. */
  const restoreItem = useCallback((item: WatchlistItem) => {
    addMutation.mutate({
      media: {
        id: item.id,
        poster_path: item.posterPath,
        vote_average: item.voteAverage,
        ...(item.mediaType === 'movie'
          ? { title: item.title, release_date: item.releaseDate }
          : { name: item.title, first_air_date: item.releaseDate }),
      } as unknown as TMDBMovie | TMDBTVShow,
      mediaType: item.mediaType,
      initial: {
        added_at: item.addedAt,
        status: item.status ?? 'watchlist',
        rating: item.rating ?? null,
        watched_at: item.watchedAt ?? null,
        runtime: item.runtime ?? null,
      },
    });
  }, [addMutation]);

  const removeFromWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    removeMutation.mutate({ tmdbId, mediaType });
  }, [removeMutation]);

  const isInWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    return watchlist.some(item => item.tmdb_id === tmdbId && item.tmdb_type === mediaType);
  }, [watchlist]);

  const updateItem = useCallback(
    (tmdbId: number, mediaType: MediaType, patch: Patch) => {
      updateMutation.mutate({ tmdbId, mediaType, patch });
    },
    [updateMutation]
  );

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    restoreItem,
    removeFromWatchlist,
    isInWatchlist,
    updateItem,
    refetch,
  };
}
