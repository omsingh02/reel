import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { PageContainer } from '@/components/PageHeader';
import { MediaRail } from '@/components/MediaRail';
import { DiscoverHero } from '@/components/DiscoverHero';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { getTrending, getPopular, cleanMediaList } from '@/lib/tmdb';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import type { MediaType, TMDBMovie, TMDBTVShow } from '@/types/tmdb';
import { SITE_URL } from '@/lib/site';

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
          url: `${SITE_URL}/`,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <PageContainer className="pb-4 pt-5 sm:pt-8">
        <h1 className="sr-only">Discover</h1>

        {isDiscoverError ? (
          <EmptyState
            art="error"
            title="Couldn't load discovery"
            description="Check your connection and try again."
          >
            <Button onClick={refetchAll}>Try again</Button>
          </EmptyState>
        ) : featured ? (
          <DiscoverHero media={featured} mediaType={featuredType} onOpen={openTitle} />
        ) : isDiscoverLoading ? (
          <div role="status" aria-busy="true" className="skeleton aspect-[4/5] w-full rounded-lg sm:aspect-[16/9] md:aspect-[2.39/1]">
            <span className="sr-only">Loading featured title</span>
          </div>
        ) : null}
      </PageContainer>

      {!isDiscoverError && (
        <div className="space-y-10 pb-8 pt-6 sm:space-y-14 sm:pt-10">
          <MediaRail
            title="Trending movies"
            subtitle="Trending this week"
            items={trendingMoviesRail}
            mediaType="movie"
            onItemClick={openTitle}
            loading={trendingMovies.isLoading}
          />
          <MediaRail
            title="Trending TV"
            subtitle="Series getting attention right now"
            items={trendingTVRail}
            mediaType="tv"
            onItemClick={openTitle}
            loading={trendingTV.isLoading}
          />
          <MediaRail
            title="Popular movies"
            subtitle="Popular on TMDB right now"
            items={popularMoviesRail}
            mediaType="movie"
            onItemClick={openTitle}
            loading={popularMovies.isLoading}
          />
          <MediaRail
            title="Popular TV"
            subtitle="Popular series on TMDB"
            items={popularTVRail}
            mediaType="tv"
            onItemClick={openTitle}
            loading={popularTV.isLoading}
          />
        </div>
      )}
    </Layout>
  );
}
