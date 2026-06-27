import type { HiddenItem, MediaType } from "@/types/tmdb";

const KEY = 'hidden-items';
const listeners = new Set<() => void>();
let cache: HiddenItem[] | null = null;

function read(): HiddenItem[] {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(KEY);
    cache = stored ? JSON.parse(stored) : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function write(next: HiddenItem[]) {
  cache = next;
  localStorage.setItem(KEY, JSON.stringify(next));
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

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      cache = null;
      listeners.forEach(l => l());
    }
  });
}
