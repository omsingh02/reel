import { supabase } from "@/integrations/supabase/client";
import type { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBSearchResponse, 
  TMDBMovieDetails, 
  TMDBTVShowDetails,
  MediaType 
} from "@/types/tmdb";
import type { SortOption } from "@/components/SortSelect";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb`;

// Dedupe identical concurrent requests. Two components mounting at the same
// time often ask for the same trending page or details payload — without this
// we'd fire duplicate network calls.
const inflight = new Map<string, Promise<unknown>>();

function isTokenExpired(jwt: string): boolean {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function resolveToken(anonKey: string): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token && !isTokenExpired(token)) return token;
    if (data?.session) {
      const { data: refreshed } = await supabase.auth.refreshSession();
      const t = refreshed?.session?.access_token;
      if (t && !isTokenExpired(t)) return t;
    }
  } catch {
    /* fall through to anon */
  }
  return anonKey;
}

async function fetchTMDB<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const url = `${EDGE_FUNCTION_URL}?${searchParams}`;
  const cacheKey = url;

  const existing = inflight.get(cacheKey) as Promise<T> | undefined;
  if (existing) return existing;

  const run = (async (): Promise<T> => {
    const started = performance.now();
    let attempt = 0;
    const maxAttempts = 3;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const token = await resolveToken(anonKey);
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            apikey: anonKey,
            Authorization: `Bearer ${token}`,
          },
        });

        // 401 once: force-refresh and retry without counting against backoff.
        if (response.status === 401 && attempt === 1) {
          try {
            const { data } = await supabase.auth.refreshSession();
            const fresh = data?.session?.access_token || anonKey;
            const retry = await fetch(url, {
              headers: {
                'Content-Type': 'application/json',
                apikey: anonKey,
                Authorization: `Bearer ${fresh}`,
              },
            });
            if (retry.ok) return retry.json();
          } catch { /* fall through */ }
        }

        if (response.ok) {
          const elapsed = performance.now() - started;
          if (elapsed > 2000) {
            console.warn(`[tmdb] slow request ${elapsed | 0}ms: ${params.endpoint}/${params.type || ''}`);
          }
          return response.json();
        }

        // 4xx (except 408/429) — don't retry, surface immediately.
        if (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error || `Request failed (${response.status})`);
        }

        // Retryable (5xx, 408, 429, opaque network). Honor Retry-After when present.
        const retryAfter = Number(response.headers.get('retry-after'));
        const backoff = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : Math.min(2000, 250 * 2 ** (attempt - 1)) + Math.random() * 150;
        lastError = new Error(`Request failed (${response.status})`);
        if (attempt < maxAttempts) await sleep(backoff);
      } catch (e) {
        // Network/abort — retry with backoff.
        lastError = e;
        if (attempt < maxAttempts) {
          await sleep(Math.min(2000, 250 * 2 ** (attempt - 1)) + Math.random() * 150);
        }
      }
    }

    console.error('[tmdb] failed after retries', params, lastError);
    throw lastError instanceof Error ? lastError : new Error('Failed to fetch from TMDB');
  })();

  inflight.set(cacheKey, run);
  try {
    return await run;
  } finally {
    inflight.delete(cacheKey);
  }
}

export async function searchMedia(
  query: string, 
  type: MediaType = 'movie', 
  page: number = 1
): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
  return fetchTMDB({
    endpoint: 'search',
    query,
    type,
    page: page.toString()
  });
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetails> {
  return fetchTMDB({
    endpoint: 'details',
    id: id.toString(),
    type: 'movie'
  });
}

export async function getTVShowDetails(id: number): Promise<TMDBTVShowDetails> {
  return fetchTMDB({
    endpoint: 'details',
    id: id.toString(),
    type: 'tv'
  });
}

export async function getTrending(
  type: MediaType = 'movie', 
  page: number = 1
): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
  return fetchTMDB({
    endpoint: 'trending',
    type,
    page: page.toString()
  });
}

export async function getPopular(
  type: MediaType = 'movie', 
  page: number = 1
): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
  return fetchTMDB({
    endpoint: 'popular',
    type,
    page: page.toString()
  });
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  air_date: string | null;
  overview: string;
  poster_path: string | null;
  episodes: {
    id: number;
    name: string;
    overview: string;
    air_date: string | null;
    episode_number: number;
    season_number: number;
    runtime: number | null;
    still_path: string | null;
    vote_average: number;
  }[];
}

export async function getSeason(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetails> {
  return fetchTMDB({
    endpoint: 'season',
    type: 'tv',
    id: tvId.toString(),
    season: seasonNumber.toString(),
  });
}

export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'w1280' | 'original' = 'w342'): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getTitle(media: TMDBMovie | TMDBTVShow): string {
  return 'title' in media ? media.title : media.name;
}

export function getReleaseDate(media: TMDBMovie | TMDBTVShow): string {
  return 'release_date' in media ? media.release_date : media.first_air_date;
}

export function sortMedia<T extends TMDBMovie | TMDBTVShow>(
  items: T[],
  sortBy: SortOption
): T[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.popularity ?? 0) - (a.popularity ?? 0);
      case 'rating':
        return (b.vote_average ?? 0) - (a.vote_average ?? 0);
      case 'release_date': {
        const dateA = getReleaseDate(a);
        const dateB = getReleaseDate(b);
        const tA = dateA ? new Date(dateA).getTime() : 0;
        const tB = dateB ? new Date(dateB).getTime() : 0;
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
      }
      case 'title': {
        const titleA = getTitle(a) || '';
        const titleB = getTitle(b) || '';
        return titleA.localeCompare(titleB);
      }
      default:
        return 0;
    }
  });
}

/**
 * Dedupe a TMDB list by id and drop low-quality entries (missing poster).
 * TMDB pagination commonly returns the same item across pages — without
 * this, the grid renders duplicate cards.
 */
export function cleanMediaList<T extends { id: number; poster_path?: string | null; adult?: boolean }>(
  items: T[]
): T[] {
  const seen = new Set<number>();
  const out: T[] = [];
  for (const item of items) {
    if (!item || typeof item.id !== 'number' || seen.has(item.id)) continue;
    if (!item.poster_path) continue;
    if (item.adult) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
}

export interface Genre { id: number; name: string }

export async function getGenres(type: MediaType): Promise<{ genres: Genre[] }> {
  return fetchTMDB({ endpoint: 'genres', type });
}

export interface DiscoverFilters {
  genre?: string;
  year?: string;
  minRating?: string;
  sortBy?: string;
}

export async function discoverMedia(
  type: MediaType,
  filters: DiscoverFilters,
  page = 1
): Promise<TMDBSearchResponse<TMDBMovie | TMDBTVShow>> {
  const params: Record<string, string> = {
    endpoint: 'discover',
    type,
    page: page.toString(),
  };
  if (filters.genre) params.genre = filters.genre;
  if (filters.year) params.year = filters.year;
  if (filters.minRating) params.min_rating = filters.minRating;
  if (filters.sortBy) params.sort_by = filters.sortBy;
  return fetchTMDB(params);
}

/** Route path for a title, e.g. /movie/603 or /show/1396. */
export function titlePath(id: number, type: MediaType): string {
  return `/${type === 'movie' ? 'movie' : 'show'}/${id}`;
}
