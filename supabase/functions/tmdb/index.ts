import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const ALLOWED_ENDPOINTS = ['search', 'details', 'trending', 'popular', 'season'];
const ALLOWED_MEDIA_TYPES = ['movie', 'tv'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authorization header exists
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the token using getClaims
    const token = authHeader.replace('Bearer ', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

    // If token is not the anon key, validate it as a user JWT.
    // Any validation failure should gracefully fall back to anon access,
    // since TMDB content is public and should not hard-fail the request.
    if (token !== anonKey) {
      try {
        const supabaseClient = createClient(supabaseUrl, anonKey, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data, error } = await supabaseClient.auth.getClaims(token);
        if (error || !data?.claims) {
          console.warn('JWT validation failed, proceeding with anon access:', error?.message || 'no claims');
        }
      } catch (jwtError) {
        const message = jwtError instanceof Error ? jwtError.message : 'unknown JWT validation error';
        console.warn('JWT validation threw, proceeding with anon access:', message);
      }
    }

    const apiKey = Deno.env.get('TMDB_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'TMDB API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    const query = url.searchParams.get('query');
    const pageStr = url.searchParams.get('page') || '1';
    const mediaType = url.searchParams.get('type') || 'movie';
    const idStr = url.searchParams.get('id');

    if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid media type. Must be "movie" or "tv"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const page = parseInt(pageStr, 10);
    if (isNaN(page) || page < 1 || page > 1000) {
      return new Response(
        JSON.stringify({ error: 'Invalid page number. Must be between 1 and 1000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let tmdbUrl: string;

    switch (endpoint) {
      case 'search':
        if (!query || query.trim().length === 0) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required for search' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (query.length > 200) {
          return new Response(
            JSON.stringify({ error: 'Query too long. Maximum 200 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'details':
        const id = parseInt(idStr || '', 10);
        if (isNaN(id) || id < 1) {
          return new Response(
            JSON.stringify({ error: 'Valid numeric ID parameter required for details' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,keywords,external_ids,images,similar,watch/providers${mediaType === 'movie' ? ',release_dates' : ',content_ratings'}`;
        break;
      case 'trending':
        tmdbUrl = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${apiKey}&page=${page}`;
        break;
      case 'popular':
        tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${apiKey}&page=${page}`;
        break;
      case 'season': {
        if (mediaType !== 'tv') {
          return new Response(
            JSON.stringify({ error: 'Season endpoint requires type=tv' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        const tvId = parseInt(idStr || '', 10);
        const seasonNum = parseInt(url.searchParams.get('season') || '', 10);
        if (isNaN(tvId) || tvId < 1 || isNaN(seasonNum) || seasonNum < 0) {
          return new Response(
            JSON.stringify({ error: 'Valid id and season parameters required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNum}?api_key=${apiKey}`;
        break;
      }
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Fetching TMDB: ${endpoint} ${mediaType}`);
    const response = await fetch(tmdbUrl);
    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TMDB API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch from TMDB' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
