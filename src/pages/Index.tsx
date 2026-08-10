import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { SearchBar } from '@/components/SearchBar';
import { MediaRail } from '@/components/MediaRail';
import { DiscoverHero } from '@/components/DiscoverHero';
import { MediaGrid } from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaGridSkeleton';
import { MediaDetails } from '@/components/MediaDetails';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { getTrending, getPopular, searchMedia, cleanMediaList } from '@/lib/tmdb';
import { useHidden } from '@/hooks/useHidden';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

/**
 * Editorial discovery experience: cinematic hero + curated rails.
 * When a search query is active, switches to a unified results grid.
 */
export default function Index() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<{ id: number; type: MediaType } | null>(null);
  const { isHidden } = useHidden();

  // Deep-link ?movie=/?tv= on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parse = (v: string | null) => {
      if (!v) return NaN;
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n > 0 ? n : NaN;
    };
    const m = parse(params.get('movie'));
    const t = parse(params.get('tv'));
    if (!Number.isNaN(m)) setSelected({ id: m, type: 'movie' });
    else if (!Number.isNaN(t)) setSelected({ id: t, type: 'tv' });
  }, []);

  const trendingMovies = useQuery({
    queryKey: ['trending', 'movie', 1],
    queryFn: () => getTrending('movie', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !query,
  });
  const trendingTV = useQuery({
    queryKey: ['trending', 'tv', 1],
    queryFn: () => getTrending('tv', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !query,
  });
  const popularMovies = useQuery({
    queryKey: ['popular', 'movie', 1],
    queryFn: () => getPopular('movie', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !query,
  });
  const popularTV = useQuery({
    queryKey: ['popular', 'tv', 1],
    queryFn: () => getPopular('tv', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !query,
  });

  const searchMovies = useQuery({
    queryKey: ['search', query, 'movie'],
    queryFn: () => searchMedia(query, 'movie', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !!query,
  });
  const searchTV = useQuery({
    queryKey: ['search', query, 'tv'],
    queryFn: () => searchMedia(query, 'tv', 1),
    staleTime: 5 * 60 * 1000,
    enabled: !!query,
  });

  const cleanFor = useCallback(
    <T extends TMDBMovie | TMDBTVShow>(items: T[] | undefined, type: MediaType): T[] => {
      if (!items) return [];
      return cleanMediaList(items).filter((it) => !isHidden(it.id, type)) as T[];
    },
    [isHidden]
  );

  const trendingMovieItems = useMemo(
    () => cleanFor(trendingMovies.data?.results as TMDBMovie[] | undefined, 'movie'),
    [trendingMovies.data, cleanFor]
  );
  const trendingTVItems = useMemo(
    () => cleanFor(trendingTV.data?.results as TMDBTVShow[] | undefined, 'tv'),
    [trendingTV.data, cleanFor]
  );
  const popularMovieItems = useMemo(
    () => cleanFor(popularMovies.data?.results as TMDBMovie[] | undefined, 'movie'),
    [popularMovies.data, cleanFor]
  );
  const popularTVItems = useMemo(
    () => cleanFor(popularTV.data?.results as TMDBTVShow[] | undefined, 'tv'),
    [popularTV.data, cleanFor]
  );

  const featured = trendingMovieItems[0] ?? trendingTVItems[0];
  const featuredType: MediaType = trendingMovieItems[0] ? 'movie' : 'tv';

  // Skip the hero item in its own rail so it's not duplicated below.
  const trendingMoviesRail = featured && featuredType === 'movie'
    ? trendingMovieItems.slice(1)
    : trendingMovieItems;
  const trendingTVRail = featured && featuredType === 'tv'
    ? trendingTVItems.slice(1)
    : trendingTVItems;

  const openMedia = useCallback((id: number, type: MediaType) => {
    setSelected({ id, type });
    const url = new URL(window.location.href);
    url.searchParams.delete('movie');
    url.searchParams.delete('tv');
    url.searchParams.set(type, id.toString());
    window.history.replaceState({}, '', url);
  }, []);

  const closeMedia = useCallback(() => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('movie');
    url.searchParams.delete('tv');
    window.history.replaceState({}, '', url);
  }, []);

  const isSearching = !!query;
  const isDiscoverLoading =
    trendingMovies.isLoading || trendingTV.isLoading || popularMovies.isLoading || popularTV.isLoading;
  const isDiscoverError =
    trendingMovies.isError && trendingTV.isError && popularMovies.isError && popularTV.isError;

  const searchMovieItems = useMemo(
    () => cleanFor(searchMovies.data?.results as TMDBMovie[] | undefined, 'movie'),
    [searchMovies.data, cleanFor]
  );
  const searchTVItems = useMemo(
    () => cleanFor(searchTV.data?.results as TMDBTVShow[] | undefined, 'tv'),
    [searchTV.data, cleanFor]
  );

  const refetchAll = () => {
    trendingMovies.refetch();
    trendingTV.refetch();
    popularMovies.refetch();
    popularTV.refetch();
  };

  return (
    <Layout>
      <Seo title="Watchlist — Track Movies & TV Shows" description="Discover trending movies and TV shows, build your personal watchlist, and never miss what to watch next." path="/" jsonLd={{"@context":"https://schema.org","@type":"WebSite","name":"Watchlist","url":"https://wat.lovable.app/","potentialAction":{"@type":"SearchAction","target":"https://wat.lovable.app/?q={search_term_string}","query-input":"required name=search_term_string"}}} />
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold hidden sm:block">Discover</h1>
          <SearchBar
            onSearch={setQuery}
            placeholder="Search movies and TV shows..."
            className="flex-1 max-w-md sm:ml-auto"
          />
        </div>
      </header>

      {isSearching ? (
        <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 space-y-8">
          <p className="text-sm text-muted-foreground">
            Results for <span className="text-foreground font-medium">"{query}"</span>
          </p>
          {searchMovies.isLoading || searchTV.isLoading ? (
            <MediaGridSkeleton count={12} />
          ) : searchMovies.isError && searchTV.isError ? (
            <EmptyState
              icon={AlertTriangle}
              title="Couldn't load results"
              description="Something went wrong reaching the catalog."
            >
              <Button onClick={() => { searchMovies.refetch(); searchTV.refetch(); }} className="rounded-full">
                Try again
              </Button>
            </EmptyState>
          ) : searchMovieItems.length === 0 && searchTVItems.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No results found"
              description={`No matches for "${query}". Try a different search term.`}
            />
          ) : (
            <>
              {searchMovieItems.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold tracking-tight">Movies</h2>
                  <MediaGrid items={searchMovieItems} mediaType="movie" onItemClick={openMedia} />
                </section>
              )}
              {searchTVItems.length > 0 && (
                <section className="space-y-3">
                  <h2 className="text-lg font-semibold tracking-tight">TV Shows</h2>
                  <MediaGrid items={searchTVItems} mediaType="tv" onItemClick={openMedia} />
                </section>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 py-2 pb-8 space-y-8">
          {isDiscoverError ? (
            <div className="px-3 sm:px-5 lg:px-8 py-10">
              <EmptyState
                icon={AlertTriangle}
                title="Couldn't load discovery"
                description="Check your connection and try again."
              >
                <Button onClick={refetchAll} className="rounded-full">Try again</Button>
              </EmptyState>
            </div>
          ) : (
            <>
              {featured ? (
                <DiscoverHero media={featured} mediaType={featuredType} onOpen={openMedia} />
              ) : isDiscoverLoading ? (
                <div className="mx-3 sm:mx-5 lg:mx-8 mt-4 aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] rounded-3xl bg-secondary/60 animate-pulse" />
              ) : null}

              <MediaRail
                title="Trending movies"
                subtitle="What everyone's watching this week"
                items={trendingMoviesRail}
                mediaType="movie"
                onItemClick={openMedia}
                loading={trendingMovies.isLoading}
              />
              <MediaRail
                title="Trending TV"
                subtitle="Series with buzz right now"
                items={trendingTVRail}
                mediaType="tv"
                onItemClick={openMedia}
                loading={trendingTV.isLoading}
              />
              <MediaRail
                title="Popular movies"
                subtitle="All-time favourites"
                items={popularMovieItems}
                mediaType="movie"
                onItemClick={openMedia}
                loading={popularMovies.isLoading}
              />
              <MediaRail
                title="Popular TV"
                subtitle="Long-running hits"
                items={popularTVItems}
                mediaType="tv"
                onItemClick={openMedia}
                loading={popularTV.isLoading}
              />
            </>
          )}
        </div>
      )}

      {selected && (
        <MediaDetails
          id={selected.id}
          mediaType={selected.type}
          onClose={closeMedia}
          onNavigate={openMedia}
        />
      )}
    </Layout>
  );
}
