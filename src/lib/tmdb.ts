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

async function fetchTMDB<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  // Try to get a fresh session token; fall back to anon key
  let token = anonKey;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.access_token) {
      token = sessionData.session.access_token;
    }
  } catch {
    // Use anon key on any auth error
  }
  
  const response = await fetch(`${EDGE_FUNCTION_URL}?${searchParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch from TMDB');
  }

  return response.json();
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

export function getImageUrl(path: string | null, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w342'): string | null {
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
        return b.popularity - a.popularity;
      case 'rating':
        return b.vote_average - a.vote_average;
      case 'release_date':
        const dateA = getReleaseDate(a);
        const dateB = getReleaseDate(b);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      case 'title':
        const titleA = getTitle(a);
        const titleB = getTitle(b);
        return titleA.localeCompare(titleB);
      default:
        return 0;
    }
  });
}
