import { useCallback, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  getProgress as guestGet,
  subscribeProgress as guestSubscribe,
  markEpisodeWatched as guestMark,
  unmarkEpisodeWatched as guestUnmark,
  markSeasonWatched as guestMarkSeason,
  unmarkSeasonWatched as guestUnmarkSeason,
} from '@/lib/progress';
import type { EpisodeProgressItem } from '@/types/tmdb';

interface ProgressRow {
  id: string;
  user_id: string;
  tmdb_id: number;
  season: number;
  episode: number;
  watched_at: string;
}

export function useEpisodeProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const guest = useSyncExternalStore(guestSubscribe, guestGet, guestGet);

  const { data: rows = [] } = useQuery({
    queryKey: ['episode_progress', user?.id],
    queryFn: async () => {
      if (!user) return [] as ProgressRow[];
      const { data, error } = await supabase.from('episode_progress').select('*');
      if (error) throw error;
      return (data || []) as ProgressRow[];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items: EpisodeProgressItem[] = user
    ? rows.map(r => ({ tmdbId: r.tmdb_id, season: r.season, episode: r.episode, watchedAt: r.watched_at }))
    : guest;

  const addMut = useMutation({
    mutationFn: async (p: { tmdbId: number; season: number; episode: number }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('episode_progress').insert({
        user_id: user.id, tmdb_id: p.tmdbId, season: p.season, episode: p.episode,
      });
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_progress', user?.id] }),
    onError: (e: any) => toast({ variant: 'destructive', title: "Couldn't update", description: e.message }),
  });

  const delMut = useMutation({
    mutationFn: async (p: { tmdbId: number; season: number; episode: number }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase
        .from('episode_progress').delete()
        .eq('user_id', user.id).eq('tmdb_id', p.tmdbId).eq('season', p.season).eq('episode', p.episode);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_progress', user?.id] }),
  });

  const mark = useCallback((tmdbId: number, season: number, episode: number) => {
    if (user) addMut.mutate({ tmdbId, season, episode });
    else guestMark(tmdbId, season, episode);
  }, [user, addMut]);

  const unmark = useCallback((tmdbId: number, season: number, episode: number) => {
    if (user) delMut.mutate({ tmdbId, season, episode });
    else guestUnmark(tmdbId, season, episode);
  }, [user, delMut]);

  const seasonMut = useMutation({
    mutationFn: async (p: { tmdbId: number; season: number; episodes: number[] }) => {
      if (!user) throw new Error('Not signed in');
      const have = new Set(
        rows.filter(r => r.tmdb_id === p.tmdbId && r.season === p.season).map(r => r.episode)
      );
      const insert = p.episodes
        .filter(e => !have.has(e))
        .map(episode => ({ user_id: user.id, tmdb_id: p.tmdbId, season: p.season, episode }));
      if (insert.length === 0) return;
      const { error } = await supabase.from('episode_progress').insert(insert);
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_progress', user?.id] }),
    onError: (e: any) => toast({ variant: 'destructive', title: "Couldn't update", description: e.message }),
  });

  const unseasonMut = useMutation({
    mutationFn: async (p: { tmdbId: number; season: number }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase
        .from('episode_progress').delete()
        .eq('user_id', user.id).eq('tmdb_id', p.tmdbId).eq('season', p.season);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['episode_progress', user?.id] }),
  });

  const markSeason = useCallback((tmdbId: number, season: number, episodes: number[]) => {
    if (user) seasonMut.mutate({ tmdbId, season, episodes });
    else guestMarkSeason(tmdbId, season, episodes);
  }, [user, seasonMut]);

  const unmarkSeason = useCallback((tmdbId: number, season: number) => {
    if (user) unseasonMut.mutate({ tmdbId, season });
    else guestUnmarkSeason(tmdbId, season);
  }, [user, unseasonMut]);

  const isWatched = useCallback(
    (tmdbId: number, season: number, episode: number) =>
      items.some(p => p.tmdbId === tmdbId && p.season === season && p.episode === episode),
    [items]
  );

  const forShow = useCallback(
    (tmdbId: number) => items.filter(p => p.tmdbId === tmdbId),
    [items]
  );

  return { items, mark, unmark, isWatched, forShow };
}
