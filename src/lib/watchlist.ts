import type { WatchlistItem, TMDBMovie, TMDBTVShow, MediaType, WatchlistStatus } from "@/types/tmdb";
import { getTitle, getReleaseDate } from "./tmdb";

const WATCHLIST_KEY = 'movie-watchlist';

// Simple pub/sub so React can subscribe via useSyncExternalStore.
const listeners = new Set<() => void>();
let cache: WatchlistItem[] | null = null;

function migrate(items: any[]): WatchlistItem[] {
  return items.map(it => ({
    id: it.id,
    mediaType: it.mediaType,
    title: it.title,
    posterPath: it.posterPath ?? null,
    releaseDate: it.releaseDate ?? '',
    voteAverage: typeof it.voteAverage === 'number' ? it.voteAverage : 0,
    addedAt: it.addedAt ?? new Date().toISOString(),
    status: it.status ?? 'watchlist',
    rating: typeof it.rating === 'number' ? it.rating : null,
    watchedAt: it.watchedAt ?? null,
    runtime: typeof it.runtime === 'number' ? it.runtime : null,
  }));
}

function read(): WatchlistItem[] {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    cache = stored ? migrate(JSON.parse(stored)) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: WatchlistItem[]): void {
  cache = next;
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable (Safari private mode) — keep in-memory state.
  }
  listeners.forEach(l => l());
}

export function subscribeWatchlist(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getWatchlist(): WatchlistItem[] {
  return read();
}

export function addToWatchlist(media: TMDBMovie | TMDBTVShow, mediaType: MediaType): void {
  const list = read();
  if (list.some(item => item.id === media.id && item.mediaType === mediaType)) return;
  const newItem: WatchlistItem = {
    id: media.id,
    mediaType,
    title: getTitle(media),
    posterPath: media.poster_path,
    releaseDate: getReleaseDate(media),
    voteAverage: media.vote_average,
    addedAt: new Date().toISOString(),
    status: 'watchlist',
    rating: null,
    watchedAt: null,
    runtime: null,
  };
  write([newItem, ...list]);
}

export function removeFromWatchlist(id: number, mediaType: MediaType): void {
  write(read().filter(item => !(item.id === id && item.mediaType === mediaType)));
}

export function isInWatchlist(id: number, mediaType: MediaType): boolean {
  return read().some(item => item.id === id && item.mediaType === mediaType);
}

export function clearWatchlist(): void { write([]); }

/** Re-insert a full item (used by "Undo" after a removal). */
export function restoreWatchlistItem(item: WatchlistItem): void {
  const list = read();
  if (list.some(i => i.id === item.id && i.mediaType === item.mediaType)) return;
  write([item, ...list]);
}

export function setWatchedStatus(
  id: number,
  mediaType: MediaType,
  patch: { status?: WatchlistStatus; rating?: number | null; watchedAt?: string | null; runtime?: number | null }
): void {
  const list = read();
  const idx = list.findIndex(it => it.id === id && it.mediaType === mediaType);
  if (idx === -1) return;
  const next = [...list];
  next[idx] = { ...next[idx], ...patch };
  write(next);
}

// Cross-tab sync
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === WATCHLIST_KEY) {
      cache = null;
      listeners.forEach(l => l());
    }
  });
}
