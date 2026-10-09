import type { EpisodeProgressItem } from "@/types/tmdb";
import { asFiniteNumber, asString, isRecord, readStoredArray, writeStored } from "./storage";

const KEY = 'episode-progress';
const listeners = new Set<() => void>();
let cache: EpisodeProgressItem[] | null = null;

function parseProgress(raw: unknown): EpisodeProgressItem | null {
  if (!isRecord(raw)) return null;
  const tmdbId = asFiniteNumber(raw.tmdbId);
  const season = asFiniteNumber(raw.season);
  const episode = asFiniteNumber(raw.episode);
  if (tmdbId === null || season === null || episode === null || season < 0 || episode < 0) return null;
  return { tmdbId, season, episode, watchedAt: asString(raw.watchedAt, new Date().toISOString()) };
}

function read(): EpisodeProgressItem[] {
  if (!cache) cache = readStoredArray(KEY, parseProgress, p => `${p.tmdbId}:${p.season}:${p.episode}`);
  return cache;
}

function write(next: EpisodeProgressItem[]) {
  cache = next;
  // Storage full or unavailable (Safari private mode) — keep in-memory state.
  writeStored(KEY, next);
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
