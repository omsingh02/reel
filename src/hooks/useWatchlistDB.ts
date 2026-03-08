import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { TMDBMovie, TMDBTVShow, MediaType } from '@/types/tmdb';
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
}

export function useWatchlistDB() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlist = [], isLoading, refetch } = useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Ensure session is fresh before querying
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        await supabase.auth.refreshSession();
      }
      
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .order('added_at', { ascending: false });
      
      if (error) {
        // If JWT expired, try refreshing and retrying once
        if (error.message?.includes('JWT expired') || error.code === 'PGRST303') {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          
          const { data: retryData, error: retryError } = await supabase
            .from('watchlist_items')
            .select('*')
            .order('added_at', { ascending: false });
          
          if (retryError) throw retryError;
          return retryData as WatchlistItemDB[];
        }
        throw error;
      }
      return data as WatchlistItemDB[];
    },
    enabled: !!user,
    retry: (failureCount, error: any) => {
      // Retry once on JWT errors to allow auto-refresh to kick in
      if (error?.message?.includes('JWT expired') || error?.code === 'PGRST303') {
        return failureCount < 2;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
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
      if (error.code === '23505') {
        toast({ title: 'Already in watchlist' });
      } else {
        toast({ variant: 'destructive', title: 'Failed to add', description: error.message });
      }
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

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType) => {
    addMutation.mutate({ media, mediaType });
  }, [addMutation]);

  const removeFromWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    removeMutation.mutate({ tmdbId, mediaType });
  }, [removeMutation]);

  const isInWatchlist = useCallback((tmdbId: number, mediaType: MediaType) => {
    return watchlist.some(item => item.tmdb_id === tmdbId && item.tmdb_type === mediaType);
  }, [watchlist]);

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    refetch,
  };
}
