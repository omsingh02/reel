import { useState, useCallback, useSyncExternalStore } from 'react';
import type { WatchlistItem, TMDBMovie, TMDBTVShow, MediaType } from '@/types/tmdb';
import { getWatchlist, addToWatchlist as add, removeFromWatchlist as remove, isInWatchlist as check } from '@/lib/watchlist';

const WATCHLIST_KEY = 'movie-watchlist';

// Create a simple store for cross-component reactivity
let listeners: (() => void)[] = [];

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

function notifyListeners() {
  listeners.forEach(l => l());
}

function getSnapshot(): string {
  return localStorage.getItem(WATCHLIST_KEY) || '[]';
}

export function useWatchlist() {
  const watchlistString = useSyncExternalStore(subscribe, getSnapshot);
  const watchlist: WatchlistItem[] = JSON.parse(watchlistString);

  const addToWatchlist = useCallback((media: TMDBMovie | TMDBTVShow, mediaType: MediaType) => {
    add(media, mediaType);
    notifyListeners();
  }, []);

  const removeFromWatchlist = useCallback((id: number, mediaType: MediaType) => {
    remove(id, mediaType);
    notifyListeners();
  }, []);

  const isInWatchlist = useCallback((id: number, mediaType: MediaType) => {
    return check(id, mediaType);
  }, []);

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist
  };
}
