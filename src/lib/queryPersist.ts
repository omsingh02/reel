import { dehydrate, hydrate, type QueryClient } from '@tanstack/react-query';

/**
 * Small disk cache for catalogue data, in the spirit of a native client's
 * on-disk provider cache: versioned key, TTL, whole-blob atomic write.
 *
 * Only TMDB catalogue queries are persisted — user data (watchlist, hidden,
 * progress) stays live so a stale copy can never be shown as truth.
 */
const KEY = 'reel:query-cache:v1';
const TTL = 6 * 60 * 60 * 1000; // 6h — TMDB catalogues move slowly
const MAX_BYTES = 1_500_000; // keep well inside the 5MB localStorage budget

const PERSISTED = new Set([
  'trending', 'popular', 'discover', 'media-details', 'season', 'genres',
]);

const shouldPersist = (key: readonly unknown[]) =>
  typeof key[0] === 'string' && PERSISTED.has(key[0]);

export function restoreQueryCache(client: QueryClient) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const { at, state } = JSON.parse(raw) as { at: number; state: unknown };
    if (!at || Date.now() - at > TTL) {
      localStorage.removeItem(KEY);
      return;
    }
    hydrate(client, state);
  } catch {
    try { localStorage.removeItem(KEY); } catch { /* private mode */ }
  }
}

export function persistQueryCache(client: QueryClient) {
  try {
    const state = dehydrate(client, {
      shouldDehydrateQuery: (q) => q.state.status === 'success' && shouldPersist(q.queryKey),
    });
    const payload = JSON.stringify({ at: Date.now(), state });
    if (payload.length > MAX_BYTES) return;
    localStorage.setItem(KEY, payload);
  } catch { /* quota or private mode — cache is optional */ }
}

/** Persist when the tab is backgrounded or closed; that covers every exit path. */
export function startQueryPersistence(client: QueryClient) {
  restoreQueryCache(client);
  const save = () => { if (document.visibilityState === 'hidden') persistQueryCache(client); };
  document.addEventListener('visibilitychange', save);
  window.addEventListener('pagehide', () => persistQueryCache(client));
}
