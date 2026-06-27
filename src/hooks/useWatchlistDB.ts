import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TMDBMovie, TMDBTVShow, MediaType, WatchlistStatus } from '@/types/tmdb';
import { getTitle, getReleaseDate } from '@/lib/tmdb';
import { useToast } from '@/hooks/use-toast';

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
  status: WatchlistStatus;
  rating: number | null;
  watched_at: string | null;
  runtime: number | null;
}

export function useWatchlistDB() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: ['watchlist', user?.id],
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

  const addMutation = useMutation({
    mutationFn: async ({ media, mediaType }: { media: TMDBMovie | TMDBTVShow; mediaType: MediaType }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase.from('watchlist_items').insert({
        user_id: user.id,
        tmdb_id: media.id,
        tmdb_type: mediaType,
        title: getTitle(media),
        poster_path: media.poster_path,
        release_date: getReleaseDate(media),
        vote_average: media.vote_average,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      toast({ title: 'Added to watchlist' });
    },
    onError: (error: any) => {
      if (error.code === '23505') toast({ title: 'Already in watchlist' });
      else toast({ variant: 'destructive', title: 'Failed to add', description: error.message });
    },
  });

  const removeMutation = useMutation({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] });
      toast({ title: 'Removed from watchlist' });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Failed to remove', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (p: {
      tmdbId: number;
      mediaType: MediaType;
      patch: Partial<Pick<WatchlistItemDB, 'status' | 'rating' | 'watched_at' | 'runtime'>>;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('watchlist_items')
        .update(p.patch)
        .eq('user_id', user.id)
        .eq('tmdb_id', p.tmdbId)
        .eq('tmdb_type', p.mediaType);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] }),
    onError: (e: any) => toast({ variant: 'destructive', title: "Couldn't update", description: e.message }),
  });

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType) => {
    addMutation.mutate({ media, mediaType });
  }, [addMutation]);

  const removeFromWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    removeMutation.mutate({ tmdbId, mediaType });
  }, [removeMutation]);

  const isInWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    return watchlist.some(item => item.tmdb_id === tmdbId && item.tmdb_type === mediaType);
  }, [watchlist]);

  const updateItem = useCallback(
    (tmdbId: number, mediaType: MediaType, patch: Partial<Pick<WatchlistItemDB, 'status' | 'rating' | 'watched_at' | 'runtime'>>) => {
      updateMutation.mutate({ tmdbId, mediaType, patch });
    },
    [updateMutation]
  );

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    updateItem,
    refetch,
  };
}
