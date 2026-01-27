import type { WatchlistItem, TMDBMovie, TMDBTVShow, MediaType } from "@/types/tmdb";
import { getTitle, getReleaseDate } from "./tmdb";

const WATCHLIST_KEY = 'movie-watchlist';

export function getWatchlist(): WatchlistItem[] {
  const stored = localStorage.getItem(WATCHLIST_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addToWatchlist(media: TMDBMovie | TMDBTVShow, mediaType: MediaType): void {
  const watchlist = getWatchlist();
  const exists = watchlist.some(item => item.id === media.id && item.mediaType === mediaType);
  
  if (!exists) {
    const newItem: WatchlistItem = {
      id: media.id,
      mediaType,
      title: getTitle(media),
      posterPath: media.poster_path,
      releaseDate: getReleaseDate(media),
      voteAverage: media.vote_average,
      addedAt: new Date().toISOString()
    };
    watchlist.unshift(newItem);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }
}

export function removeFromWatchlist(id: number, mediaType: MediaType): void {
  const watchlist = getWatchlist();
  const filtered = watchlist.filter(item => !(item.id === id && item.mediaType === mediaType));
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
}

export function isInWatchlist(id: number, mediaType: MediaType): boolean {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === id && item.mediaType === mediaType);
}
