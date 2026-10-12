import type { HiddenItem, MediaType } from "@/types/tmdb";
import { asFiniteNumber, asString, isRecord, readStoredArray, writeStored } from "./storage";

const KEY = 'hidden-items';
const listeners = new Set<() => void>();
let cache: HiddenItem[] | null = null;

function parseHidden(raw: unknown): HiddenItem | null {
  if (!isRecord(raw)) return null;
  const id = asFiniteNumber(raw.id);
  if (id === null || (raw.mediaType !== 'movie' && raw.mediaType !== 'tv')) return null;
  return { id, mediaType: raw.mediaType, hiddenAt: asString(raw.hiddenAt, new Date().toISOString()) };
}

function read(): HiddenItem[] {
  if (!cache) cache = readStoredArray(KEY, parseHidden, i => `${i.mediaType}:${i.id}`);
  return cache;
}

function write(next: HiddenItem[]) {
  cache = next;
  // Storage full or unavailable (Safari private mode) — keep in-memory state.
  writeStored(KEY, next);
  listeners.forEach(l => l());
}

export function subscribeHidden(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getHidden(): HiddenItem[] { return read(); }

export function hideItem(id: number, mediaType: MediaType) {
  const list = read();
  if (list.some(i => i.id === id && i.mediaType === mediaType)) return;
  write([{ id, mediaType, hiddenAt: new Date().toISOString() }, ...list]);
}

export function unhideItem(id: number, mediaType: MediaType) {
  write(read().filter(i => !(i.id === id && i.mediaType === mediaType)));
}

export function isHidden(id: number, mediaType: MediaType): boolean {
  return read().some(i => i.id === id && i.mediaType === mediaType);
}

export function clearHidden() { write([]); }

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach(l => l());
    }
  });
}
