import { supabase } from "@/integrations/supabase/client";
import type { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBSearchResponse, 
  TMDBMovieDetails, 
  TMDBTVShowDetails,
  MediaType 
} from "@/types/tmdb";

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tmdb`;

async function fetchTMDB<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const { data: sessionData } = await supabase.auth.getSession();
  
  const response = await fetch(`${EDGE_FUNCTION_URL}?${searchParams}`, {
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      ...(sessionData?.session?.access_token && {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      })
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
