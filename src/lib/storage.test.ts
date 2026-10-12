import { beforeEach, describe, expect, it, vi } from 'vitest';

// The stores keep a module-level cache, so each test loads a fresh copy after seeding storage.
async function load<T>(path: string): Promise<T> {
  vi.resetModules();
  return (await import(/* @vite-ignore */ path)) as T;
}

beforeEach(() => localStorage.clear());

describe('hidden store', () => {
  type M = typeof import('./hidden');
  it('survives a value that is not an array', async () => {
    localStorage.setItem('hidden-items', JSON.stringify({ oops: true }));
    const m = await load<M>('./hidden');
    expect(m.getHidden()).toEqual([]);
    expect(m.isHidden(1, 'movie')).toBe(false);
  });

  it('survives invalid JSON and keeps the original text as a backup', async () => {
    localStorage.setItem('hidden-items', '[{"id":1,');
    const m = await load<M>('./hidden');
    expect(m.getHidden()).toEqual([]);
    expect(localStorage.getItem('hidden-items:corrupt')).toBe('[{"id":1,');
  });

  it('keeps valid entries, drops bad ones and duplicates', async () => {
    localStorage.setItem('hidden-items', JSON.stringify([
      { id: 1, mediaType: 'movie', hiddenAt: '2026-01-01T00:00:00.000Z' },
      null, 'x', { id: 'nope', mediaType: 'movie' }, { id: 2, mediaType: 'book' },
      { id: 1, mediaType: 'movie' },
      { id: 3, mediaType: 'tv' },
    ]));
    const m = await load<M>('./hidden');
    expect(m.getHidden().map(i => `${i.mediaType}:${i.id}`)).toEqual(['movie:1', 'tv:3']);
    expect(localStorage.getItem('hidden-items:corrupt')).not.toBeNull();
  });
});

describe('episode progress store', () => {
  type M = typeof import('./progress');
  it('rejects malformed rows but keeps good ones', async () => {
    localStorage.setItem('episode-progress', JSON.stringify([
      { tmdbId: 10, season: 1, episode: 2, watchedAt: '2026-02-02T00:00:00.000Z' },
      { tmdbId: 10, season: -1, episode: 2 },
      { tmdbId: '10', season: 1, episode: 3 },
      { tmdbId: 10, season: 1, episode: 2 },
    ]));
    const m = await load<M>('./progress');
    expect(m.getProgress()).toHaveLength(1);
    expect(m.isEpisodeWatched(10, 1, 2)).toBe(true);
  });

  it('still works after loading from a corrupt value', async () => {
    localStorage.setItem('episode-progress', 'not json');
    const m = await load<M>('./progress');
    m.markEpisodeWatched(5, 1, 1);
    expect(m.isEpisodeWatched(5, 1, 1)).toBe(true);
    expect(JSON.parse(localStorage.getItem('episode-progress')!)).toHaveLength(1);
  });
});

describe('watchlist store', () => {
  type M = typeof import('./watchlist');
  it('normalises old and out-of-range data instead of crashing', async () => {
    localStorage.setItem('movie-watchlist', JSON.stringify([
      { id: 1, mediaType: 'movie', title: 'A', status: 'watching', rating: 42, runtime: -5 },
      { id: 2, mediaType: 'tv', title: 'B', status: 'watched', rating: 9, runtime: 300, watchedAt: '2026-03-03T00:00:00.000Z' },
      { id: 3, mediaType: 'movie' },
      null,
      { id: 2, mediaType: 'tv', title: 'dupe' },
      { mediaType: 'movie', title: 'no id' },
    ]));
    const m = await load<M>('./watchlist');
    const items = m.getWatchlist();
    expect(items.map(i => i.id)).toEqual([1, 2, 3]);
    expect(items[0]).toMatchObject({ status: 'watchlist', rating: null, runtime: null });
    expect(items[1]).toMatchObject({ status: 'watched', rating: 9, runtime: 300, title: 'B' });
    expect(items[2].title).toBe('Untitled');
  });

  it('does not wipe the list when one entry is corrupt', async () => {
    localStorage.setItem('movie-watchlist', JSON.stringify([{ id: 1, mediaType: 'movie', title: 'Keep me' }, 42, null]));
    const m = await load<M>('./watchlist');
    expect(m.getWatchlist().map(i => i.title)).toEqual(['Keep me']);
  });
});
