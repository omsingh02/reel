import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { MediaType } from '@/types/tmdb';
import { useToast } from '@/hooks/use-toast';
import {
  getHidden as guestGet,
  subscribeHidden as guestSubscribe,
  hideItem as guestHide,
  unhideItem as guestUnhide,
} from '@/lib/hidden';
import { useSyncExternalStore } from 'react';

interface HiddenRow {
  id: string;
  user_id: string;
  tmdb_id: number;
  tmdb_type: 'movie' | 'tv';
  hidden_at: string;
}

export function useHidden() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const guest = useSyncExternalStore(guestSubscribe, guestGet, guestGet);

  const { data: dbRows = [] } = useQuery({
    queryKey: ['hidden_items', user?.id],
    queryFn: async () => {
      if (!user) return [] as HiddenRow[];
      const { data, error } = await supabase.from('hidden_items').select('*');
      if (error) throw error;
      return (data || []) as HiddenRow[];
    },
    enabled: !!user,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const items = user
    ? dbRows.map(r => ({ id: r.tmdb_id, mediaType: r.tmdb_type as MediaType, hiddenAt: r.hidden_at }))
    : guest;

  const addMutation = useMutation({
    mutationFn: async ({ id, mediaType }: { id: number; mediaType: MediaType }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase.from('hidden_items').insert({
        user_id: user.id, tmdb_id: id, tmdb_type: mediaType,
      });
      if (error && error.code !== '23505') throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hidden_items', user?.id] }),
    onError: (e: any) => toast({ variant: 'destructive', title: "Couldn't hide", description: e.message }),
  });

  const removeMutation = useMutation({
    mutationFn: async ({ id, mediaType }: { id: number; mediaType: MediaType }) => {
      if (!user) throw new Error('Not signed in');
      const { error } = await supabase
        .from('hidden_items').delete()
        .eq('user_id', user.id).eq('tmdb_id', id).eq('tmdb_type', mediaType);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hidden_items', user?.id] }),
  });

  const hide = useCallback((id: number, mediaType: MediaType) => {
    if (user) addMutation.mutate({ id, mediaType });
    else guestHide(id, mediaType);
  }, [user, addMutation]);

  const unhide = useCallback((id: number, mediaType: MediaType) => {
    if (user) removeMutation.mutate({ id, mediaType });
    else guestUnhide(id, mediaType);
  }, [user, removeMutation]);

  const hiddenKeys = useMemo(
    () => new Set(items.map(i => `${i.mediaType}:${i.id}`)),
    [items]
  );
  const isHidden = useCallback(
    (id: number, mediaType: MediaType) => hiddenKeys.has(`${mediaType}:${id}`),
    [hiddenKeys]
  );

  return { items, hide, unhide, isHidden };
}
