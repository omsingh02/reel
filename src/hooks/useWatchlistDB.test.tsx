import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { TMDBMovie } from '@/types/tmdb';

const calls: string[] = [];
let releaseInsert: () => void = () => {};

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1' } }) }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ order: async () => ({ data: [], error: null }) }),
      insert: () => {
        calls.push('insert:start');
        return new Promise(resolve => {
          releaseInsert = () => { calls.push('insert:done'); resolve({ error: null }); };
        });
      },
      delete: () => ({
        eq: () => ({ eq: () => ({ eq: async () => { calls.push('delete'); return { error: null }; } }) }),
      }),
    }),
  },
}));

import { useWatchlistDB } from './useWatchlistDB';

const movie = { id: 1, title: 'Dune', poster_path: null, release_date: '2021-10-22', vote_average: 8 } as unknown as TMDBMovie;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => { calls.length = 0; });

describe('useWatchlistDB write ordering', () => {
  it('does not send a remove until the preceding add has finished', async () => {
    const { result } = renderHook(() => useWatchlistDB(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.addToWatchlist(movie, 'movie'); });
    await waitFor(() => expect(calls).toContain('insert:start'));

    // The user taps "remove" while the insert is still in flight.
    act(() => { result.current.removeFromWatchlist(1, 'movie'); });
    await new Promise(r => setTimeout(r, 50));
    expect(calls).toEqual(['insert:start']); // the delete must be queued, not sent yet

    act(() => { releaseInsert(); });
    await waitFor(() => expect(calls).toContain('delete'));
    expect(calls).toEqual(['insert:start', 'insert:done', 'delete']);
  });
});
