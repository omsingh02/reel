export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export type TMDBMedia = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' };

export interface TMDBSearchResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBMovieDetails extends TMDBMovie {
  budget: number;
  genres: { id: number; name: string }[];
  homepage: string;
  imdb_id: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
}

export interface TMDBTVShowDetails extends TMDBTVShow {
  created_by: { id: number; name: string; profile_path: string | null }[];
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  status: string;
  tagline: string;
  type: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
}

export type MediaType = 'movie' | 'tv';

export interface WatchlistItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
  addedAt: string;
}
