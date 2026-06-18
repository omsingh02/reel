import type { WatchlistItem, TMDBMovie, TMDBTVShow, MediaType } from "@/types/tmdb";
import { getTitle, getReleaseDate } from "./tmdb";

const WATCHLIST_KEY = 'movie-watchlist';

// Simple pub/sub so React can subscribe via useSyncExternalStore.
// Without this, guest add/remove updates localStorage but components
// never re-render and the +/✓ icon stays stale.
const listeners = new Set<() => void>();
let cache: WatchlistItem[] | null = null;

function read(): WatchlistItem[] {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    cache = stored ? JSON.parse(stored) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: WatchlistItem[]): void {
  cache = next;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(next));
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
  };
  write([newItem, ...list]);
}

export function removeFromWatchlist(id: number, mediaType: MediaType): void {
  write(read().filter(item => !(item.id === id && item.mediaType === mediaType)));
}

export function isInWatchlist(id: number, mediaType: MediaType): boolean {
  return read().some(item => item.id === id && item.mediaType === mediaType);
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
