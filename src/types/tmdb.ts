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
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
    crew: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  recommendations?: {
    results: TMDBMovie[];
  };
  keywords?: {
    keywords: { id: number; name: string }[];
  };
  external_ids?: {
    imdb_id: string;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
  images?: {
    backdrops: { file_path: string; width: number; height: number; vote_average: number }[];
    posters: { file_path: string; width: number; height: number; vote_average: number }[];
  };
  similar?: {
    results: TMDBMovie[];
  };
  'watch/providers'?: {
    results: Record<string, {
      link?: string;
      flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
      rent?: { provider_id: number; provider_name: string; logo_path: string }[];
      buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    }>;
  };
  release_dates?: {
    results: { iso_3166_1: string; release_dates: { certification: string; type: number; release_date: string }[] }[];
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
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    runtime: number;
    still_path: string | null;
  } | null;
  next_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
  } | null;
  networks: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
    air_date: string;
    overview: string;
  }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  type: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null; order: number }[];
    crew: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
  };
  videos?: {
    results: { id: string; key: string; name: string; site: string; type: string }[];
  };
  recommendations?: {
    results: TMDBTVShow[];
  };
  keywords?: {
    results: { id: number; name: string }[];
  };
  external_ids?: {
    imdb_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
  };
  images?: {
    backdrops: { file_path: string; width: number; height: number; vote_average: number }[];
    posters: { file_path: string; width: number; height: number; vote_average: number }[];
  };
  similar?: {
    results: TMDBTVShow[];
  };
  'watch/providers'?: {
    results: Record<string, {
      link?: string;
      flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
      rent?: { provider_id: number; provider_name: string; logo_path: string }[];
      buy?: { provider_id: number; provider_name: string; logo_path: string }[];
    }>;
  };
  content_ratings?: {
    results: { iso_3166_1: string; rating: string }[];
  };
}

export type MediaType = 'movie' | 'tv';

export type WatchlistStatus = 'watchlist' | 'watched';

export interface WatchlistItem {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  voteAverage: number;
  addedAt: string;
  status?: WatchlistStatus;
  rating?: number | null;
  watchedAt?: string | null;
  runtime?: number | null;
}

export interface HiddenItem {
  id: number;
  mediaType: MediaType;
  hiddenAt: string;
}

export interface EpisodeProgressItem {
  tmdbId: number;
  season: number;
  episode: number;
  watchedAt: string;
}
