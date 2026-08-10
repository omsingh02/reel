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

export function isEpisodeWatched(tmdbId: number, season: number, episode: number): boolean {
  return read().some(p => p.tmdbId === tmdbId && p.season === season && p.episode === episode);
}

export function getShowProgress(tmdbId: number): EpisodeProgressItem[] {
  return read().filter(p => p.tmdbId === tmdbId);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach(l => l());
    }
  });
}
