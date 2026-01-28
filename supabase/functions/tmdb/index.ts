import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const page = url.searchParams.get('page') || '1';
    const mediaType = url.searchParams.get('type') || 'movie';
    const id = url.searchParams.get('id');

    let tmdbUrl: string;

    switch (endpoint) {
      case 'search':
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query parameter required for search' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/search/${mediaType}?api_key=${apiKey}&query=${encodeURIComponent(query)}&page=${page}`;
        break;
      case 'details':
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'ID parameter required for details' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${apiKey}&append_to_response=credits,videos,recommendations,keywords,external_ids`;
        break;
      case 'trending':
        tmdbUrl = `${TMDB_BASE_URL}/trending/${mediaType}/week?api_key=${apiKey}&page=${page}`;
        break;
      case 'popular':
        tmdbUrl = `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${apiKey}&page=${page}`;
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

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
