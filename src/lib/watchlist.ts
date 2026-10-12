import type { WatchlistItem, TMDBMovie, TMDBTVShow, MediaType, WatchlistStatus } from "@/types/tmdb";
import { getTitle, getReleaseDate } from "./tmdb";
import { asFiniteNumber, asString, isRecord, readStoredArray, writeStored } from "./storage";

const WATCHLIST_KEY = 'movie-watchlist';

// Simple pub/sub so React can subscribe via useSyncExternalStore.
const listeners = new Set<() => void>();
let cache: WatchlistItem[] | null = null;

type StoredItem = Partial<WatchlistItem> & Pick<WatchlistItem, 'id' | 'mediaType' | 'title'>;

/** Validates one stored entry and fills in fields older builds didn't have. Returns null if unusable. */
function parseItem(raw: unknown): WatchlistItem | null {
  if (!isRecord(raw)) return null;
  const id = asFiniteNumber(raw.id);
  if (id === null || (raw.mediaType !== 'movie' && raw.mediaType !== 'tv')) return null;
  const rating = asFiniteNumber(raw.rating);
  const runtime = asFiniteNumber(raw.runtime);
  return {
    id,
    mediaType: raw.mediaType,
    title: asString(raw.title, 'Untitled'),
    posterPath: typeof raw.posterPath === 'string' ? raw.posterPath : null,
    releaseDate: asString(raw.releaseDate),
    voteAverage: asFiniteNumber(raw.voteAverage) ?? 0,
    addedAt: asString(raw.addedAt, new Date().toISOString()),
    status: raw.status === 'watched' ? 'watched' : 'watchlist',
    rating: rating !== null && rating >= 1 && rating <= 10 ? rating : null,
    watchedAt: typeof raw.watchedAt === 'string' ? raw.watchedAt : null,
    runtime: runtime !== null && runtime >= 0 ? runtime : null,
  };
}

function read(): WatchlistItem[] {
  if (!cache) cache = readStoredArray(WATCHLIST_KEY, parseItem, i => `${i.mediaType}:${i.id}`);
  return cache;
}

function write(next: WatchlistItem[]): void {
  cache = next;
  // If storage is full or unavailable (Safari private mode) the in-memory copy still works.
  writeStored(WATCHLIST_KEY, next);
  listeners.forEach(l => l());
}

export function subscribeWatchlist(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getWatchlist(): WatchlistItem[] {
  return read();
}

export type InitialState = Partial<Pick<WatchlistItem, 'status' | 'rating' | 'watchedAt' | 'runtime'>>;

export function addToWatchlist(media: TMDBMovie | TMDBTVShow, mediaType: MediaType, initial: InitialState = {}): void {
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
    status: initial.status ?? 'watchlist',
    rating: initial.rating ?? null,
    watchedAt: initial.watchedAt ?? null,
    runtime: initial.runtime ?? null,
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
