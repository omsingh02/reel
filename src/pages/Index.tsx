import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { SearchLink } from '@/components/SearchLink';
import { MediaRail } from '@/components/MediaRail';
import { DiscoverHero } from '@/components/DiscoverHero';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { getTrending, getPopular, cleanMediaList } from '@/lib/tmdb';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';

/** Editorial discovery experience: cinematic hero + curated rails. */
export default function Index() {
  const { isHidden } = useHidden();
  const openTitle = useOpenTitle();

  const trendingMovies = useQuery({
    queryKey: ['trending', 'movie', 1],
    queryFn: () => getTrending('movie', 1),
    staleTime: 5 * 60 * 1000,
  });
  const trendingTV = useQuery({
    queryKey: ['trending', 'tv', 1],
    queryFn: () => getTrending('tv', 1),
    staleTime: 5 * 60 * 1000,
  });
  const popularMovies = useQuery({
    queryKey: ['popular', 'movie', 1],
    queryFn: () => getPopular('movie', 1),
    staleTime: 5 * 60 * 1000,
  });
  const popularTV = useQuery({
    queryKey: ['popular', 'tv', 1],
    queryFn: () => getPopular('tv', 1),
    staleTime: 5 * 60 * 1000,
  });

  const cleanFor = useCallback(
    <T extends TMDBMovie | TMDBTVShow>(items: T[] | undefined, type: MediaType): T[] => {
      if (!items) return [];
      return cleanMediaList(items).filter(it => !isHidden(it.id, type)) as T[];
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

  // A title should appear only once on the page: the hero wins, then rails in order.
  const { trendingMoviesRail, trendingTVRail, popularMoviesRail, popularTVRail } = useMemo(() => {
    const seen = new Set<string>();
    if (featured) seen.add(`${featuredType}-${featured.id}`);
    const take = <T extends TMDBMovie | TMDBTVShow>(items: T[], type: MediaType): T[] =>
      items.filter(it => {
        const key = `${type}-${it.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return {
      trendingMoviesRail: take(trendingMovieItems, 'movie'),
      trendingTVRail: take(trendingTVItems, 'tv'),
      popularMoviesRail: take(popularMovieItems, 'movie'),
      popularTVRail: take(popularTVItems, 'tv'),
    };
  }, [featured, featuredType, trendingMovieItems, trendingTVItems, popularMovieItems, popularTVItems]);

  const isDiscoverLoading =
    trendingMovies.isLoading || trendingTV.isLoading || popularMovies.isLoading || popularTV.isLoading;
  const isDiscoverError =
    trendingMovies.isError && trendingTV.isError && popularMovies.isError && popularTV.isError;

  const refetchAll = () => {
    trendingMovies.refetch();
    trendingTV.refetch();
    popularMovies.refetch();
    popularTV.refetch();
  };

  return (
    <Layout>
      <Seo
        title="Reel — Track Movies & TV Shows"
        description="Discover trending movies and TV shows, build your list, and never miss what to watch next."
        path="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Reel",
          url: "https://wat.lovable.app/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://wat.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center gap-3 px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold tracking-tight">Discover</h1>
          <SearchLink className="ml-auto" />
        </div>
      </header>

      <div className="flex-1 py-4 pb-8 space-y-8">
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
              <DiscoverHero media={featured} mediaType={featuredType} onOpen={openTitle} />
            ) : isDiscoverLoading ? (
              <div className="mx-3 sm:mx-5 lg:mx-8 mt-4 aspect-[16/10] sm:aspect-[21/9] lg:aspect-[24/9] rounded-3xl bg-secondary/60 animate-pulse" />
            ) : null}

            <MediaRail
              title="Trending movies"
              subtitle="What everyone's watching this week"
              items={trendingMoviesRail}
              mediaType="movie"
              onItemClick={openTitle}
              loading={trendingMovies.isLoading}
            />
            <MediaRail
              title="Trending TV"
              subtitle="Series with buzz right now"
              items={trendingTVRail}
              mediaType="tv"
              onItemClick={openTitle}
              loading={trendingTV.isLoading}
            />
            <MediaRail
              title="Popular movies"
              subtitle="All-time favourites"
              items={popularMovieItems}
              mediaType="movie"
              onItemClick={openTitle}
              loading={popularMovies.isLoading}
            />
            <MediaRail
              title="Popular TV"
              subtitle="Long-running hits"
              items={popularTVItems}
              mediaType="tv"
              onItemClick={openTitle}
              loading={popularTV.isLoading}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
