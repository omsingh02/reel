import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const ALLOWED_ENDPOINTS = ['search', 'details', 'trending', 'popular', 'season', 'genres', 'discover'];
const ALLOWED_MEDIA_TYPES = ['movie', 'tv'];

const UPSTREAM_TIMEOUT_MS = 8000;
const UPSTREAM_UNAVAILABLE = 'TMDB is unreachable or timed out';

// Catalogue data moves slowly; browsers may reuse a response for 5 minutes (genres: a day) and
// serve a stale copy while revalidating. Errors are never cached.
const CACHE_DEFAULT = 'public, max-age=300, stale-while-revalidate=3600';
const CACHE_GENRES = 'public, max-age=86400, stale-while-revalidate=3600';

/**
 * Fetch errors can embed the full request URL, which contains `api_key=...`.
 * Anything that gets logged or returned goes through this first.
 */
function redactKey(text: string): string {
  return text.replace(/api_key=[^&\s"')]+/gi, 'api_key=REDACTED');
}

function describeError(error: unknown): string {
  return redactKey(error instanceof Error ? `${error.name}: ${error.message}` : String(error));
}

function jsonResponse(body: unknown, status: number, cacheControl = 'no-store', extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': cacheControl, ...extra },
  });
}

const errorResponse = (status: number, message: string, extra: Record<string, string> = {}) =>
  jsonResponse({ error: message }, status, 'no-store', extra);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(401, 'Missing authorization header');
    }

    // The catalogue is public data, so the bearer token is not inspected (the anon/publishable key
    // the web app sends is enough). The header check above only filters stray requests.

    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      return errorResponse(500, 'TMDB API key not configured');
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const query = url.searchParams.get('query');
    const pageStr = url.searchParams.get('page') || '1';
    const mediaType = url.searchParams.get('type') || 'movie';
    const idStr = url.searchParams.get('id');

    if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return errorResponse(400, 'Invalid endpoint');
    }

    if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
      return errorResponse(400, 'Invalid media type. Must be "movie" or "tv"');
    }

    const page = parseInt(pageStr, 10);
    if (isNaN(page) || page < 1 || page > 1000) {
      return errorResponse(400, 'Invalid page number. Must be between 1 and 1000');
    }

    let tmdbUrl: string;

    switch (endpoint) {
      case 'search':
        if (!query || query.trim().length === 0) {
          return errorResponse(400, 'Query parameter required for search');
        }
        if (query.length > 200) {
          return errorResponse(400, 'Query too long. Maximum 200 characters');
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'details': {
        const id = parseInt(idStr || '', 10);
        if (isNaN(id) || id < 1) {
          return errorResponse(400, 'Valid numeric ID parameter required for details');
        }
        // slim=1: bare details (dates, runtime, next episode) without the heavy append_to_response payload.
        tmdbUrl = url.searchParams.get('slim') === '1'
          ? `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${apiKey}`
          : `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,keywords,external_ids,images,similar,watch/providers${mediaType === 'movie' ? ',release_dates' : ',content_ratings'}`;
        break;
      }
      case 'trending':
        tmdbUrl = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${apiKey}&page=${page}`;
        break;
      case 'popular':
        tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${apiKey}&page=${page}`;
        break;
      case 'season': {
        if (mediaType !== 'tv') {
          return errorResponse(400, 'Season endpoint requires type=tv');
        }
        const tvId = parseInt(idStr || '', 10);
        const seasonNum = parseInt(url.searchParams.get('season') || '', 10);
        if (isNaN(tvId) || tvId < 1 || isNaN(seasonNum) || seasonNum < 0) {
          return errorResponse(400, 'Valid id and season parameters required');
        }
        tmdbUrl = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${apiKey}`;
        break;
      }
      case 'genres':
        tmdbUrl = `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${apiKey}`;
        break;
      case 'discover': {
        const params = new URLSearchParams({
          api_key: apiKey,
          page: String(page),
          include_adult: 'false',
        });
        const sortBy = url.searchParams.get('sort_by') || 'popularity.desc';
        const ALLOWED_SORTS = [
          'popularity.desc', 'vote_average.desc', 'primary_release_date.desc',
          'first_air_date.desc', 'revenue.desc',
        ];
        const safeSort = ALLOWED_SORTS.includes(sortBy) ? sortBy : 'popularity.desc';
        params.set('sort_by', safeSort);

        // Vote floor depends on the sort: "Top rated" needs a real sample so a
        // handful of 10/10 votes can't win; "Newest" must not hide fresh releases;
        // and unreleased titles must not lead the newest-first list.
        if (safeSort === 'vote_average.desc') {
          params.set('vote_count.gte', '300');
        } else if (safeSort === 'primary_release_date.desc' || safeSort === 'first_air_date.desc') {
          params.set('vote_count.gte', '10');
          const today = new Date().toISOString().slice(0, 10);
          params.set(mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte', today);
        } else {
          params.set('vote_count.gte', '50');
        }

        const genre = url.searchParams.get('genre');
        if (genre && /^\d+(,\d+)*$/.test(genre)) params.set('with_genres', genre);

        const year = url.searchParams.get('year');
        if (year && /^\d{4}$/.test(year)) {
          params.set(mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year', year);
        }

        const minRating = url.searchParams.get('min_rating');
        if (minRating && /^\d+(\.\d+)?$/.test(minRating)) params.set('vote_average.gte', minRating);

        tmdbUrl = `${TMDB_BASE_URL}/discover/${mediaType}?${params}`;
        break;
      }

      default:
        return errorResponse(400, 'Invalid endpoint');
    }

    console.log(`Fetching TMDB: ${endpoint} ${mediaType}`);

    let upstream: Response;
    let raw: string;
    try {
      upstream = await fetch(tmdbUrl, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
      raw = await upstream.text(); // the timeout also covers reading the body
    } catch (fetchError) {
      const timedOut = fetchError instanceof DOMException && fetchError.name === 'TimeoutError';
      console.error('TMDB request failed:', describeError(fetchError));
      return errorResponse(timedOut ? 504 : 502, UPSTREAM_UNAVAILABLE);
    }

    let data: Record<string, unknown> | null = null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') data = parsed as Record<string, unknown>;
    } catch {
      // not JSON — handled below
    }

    if (!upstream.ok) {
      // Pass the meaningful statuses through; our own TMDB credentials failing (401/403)
      // or TMDB being down is a bad gateway from the client's point of view.
      const status = upstream.status === 404 || upstream.status === 429
        ? upstream.status
        : upstream.status === 401 || upstream.status === 403 || upstream.status >= 500
          ? 502
          : upstream.status;
      const publicMessage = status === 502
        ? UPSTREAM_UNAVAILABLE
        : typeof data?.status_message === 'string'
          ? redactKey(data.status_message)
          : `TMDB request failed (${upstream.status})`;
      const retryAfter = upstream.headers.get('retry-after');
      console.error(`TMDB responded ${upstream.status} for ${endpoint} ${mediaType}`);
      return errorResponse(status, publicMessage, retryAfter ? { 'Retry-After': retryAfter } : {});
    }

    if (!data) {
      console.error(`TMDB returned a non-JSON body for ${endpoint} ${mediaType}`);
      return errorResponse(502, 'TMDB returned an unexpected response');
    }

    return jsonResponse(data, upstream.status, endpoint === 'genres' ? CACHE_GENRES : CACHE_DEFAULT);
  } catch (error) {
    console.error('TMDB API error:', describeError(error));
    return errorResponse(500, 'Failed to fetch from TMDB');
  }
});
