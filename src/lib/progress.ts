import type { EpisodeProgressItem } from "@/types/tmdb";

const KEY = 'episode-progress';
const listeners = new Set<() => void>();
let cache: EpisodeProgressItem[] | null = null;

function read(): EpisodeProgressItem[] {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(KEY);
    cache = stored ? JSON.parse(stored) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: EpisodeProgressItem[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable (Safari private mode) — keep in-memory state.
  }
  listeners.forEach(l => l());
}

export function subscribeProgress(l: () => void): () => void {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function getProgress(): EpisodeProgressItem[] { return read(); }

export function markEpisodeWatched(tmdbId: number, season: number, episode: number) {
  const list = read();
  if (list.some(p => p.tmdbId === tmdbId && p.season === season && p.episode === episode)) return;
  write([{ tmdbId, season, episode, watchedAt: new Date().toISOString() }, ...list]);
}

export function unmarkEpisodeWatched(tmdbId: number, season: number, episode: number) {
  write(read().filter(p => !(p.tmdbId === tmdbId && p.season === season && p.episode === episode)));
}

export function markSeasonWatched(tmdbId: number, season: number, episodes: number[]) {
  const list = read();
  const have = new Set(
    list.filter(p => p.tmdbId === tmdbId && p.season === season).map(p => p.episode)
  );
  const watchedAt = new Date().toISOString();
  const added = episodes
    .filter(e => !have.has(e))
    .map(episode => ({ tmdbId, season, episode, watchedAt }));
  if (added.length === 0) return;
  write([...added, ...list]);
}

export function unmarkSeasonWatched(tmdbId: number, season: number) {
  write(read().filter(p => !(p.tmdbId === tmdbId && p.season === season)));
}

export function isEpisodeWatched(tmdbId: number, season: number, episode: number): boolean {
  return read().some(p => p.tmdbId === tmdbId && p.season === season && p.episode === episode);
}

export function getShowProgress(tmdbId: number): EpisodeProgressItem[] {
  return read().filter(p => p.tmdbId === tmdbId);
}

export function clearProgress() { write([]); }

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach(l => l());
    }
  });
}
