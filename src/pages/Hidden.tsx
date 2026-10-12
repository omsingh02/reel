import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { PageContainer, PageHeader } from '@/components/PageHeader';
import { Poster } from '@/components/reel';
import { PosterGridSkeleton } from '@/components/library/Skeletons';
import { Button } from '@/components/ui/button';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import { getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
import { yearOf } from '@/lib/dates';
import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';

const MAX_TITLES = 100;

/** Titles marked "Not interested", with a way to bring each one back. */
export default function Hidden() {
  const { items, unhide } = useHidden();
  const openTitle = useOpenTitle();

  const shown = useMemo(() => items.slice(0, MAX_TITLES), [items]);

  const queries = useQueries({
    queries: shown.map(item => ({
      queryKey: ['upcoming-details', item.mediaType, item.id],
      queryFn: () =>
        item.mediaType === 'movie'
          ? getMovieDetails(item.id, { slim: true })
          : getTVShowDetails(item.id, { slim: true }),
      staleTime: 24 * 60 * 60 * 1000,
      retry: 1,
    })),
  });

  const loading = queries.length > 0 && queries.every(q => q.isLoading);

  return (
    <Layout>
      <Seo title="Hidden titles — Reel" description="Titles you marked as not interested." path="/hidden" noindex />
      <PageHeader
        eyebrow="Library"
        title="Hidden titles"
        description={
          items.length > 0
            ? `${items.length} ${items.length === 1 ? 'title is' : 'titles are'} kept out of Discover, Movies, Shows and search until you bring ${items.length === 1 ? 'it' : 'them'} back.`
            : 'Titles you mark "Not interested" are kept out of your feeds.'
        }
      />

      <PageContainer className="pb-6">
        {items.length === 0 ? (
          <EmptyState
            art="hidden"
            title="Nothing hidden"
            description='Titles you mark "Not interested" disappear from Discover, Movies, Shows and search. They show up here so you can bring them back.'
          >
            <Button asChild variant="secondary"><Link to="/">Back to Discover</Link></Button>
          </EmptyState>
        ) : loading ? (
          <PosterGridSkeleton count={Math.min(shown.length, 12)} />
        ) : (
          <>
            {items.length > shown.length && (
              <p className="numeral mb-6 font-mono text-xs text-muted-foreground">Showing the first {MAX_TITLES} of {items.length}.</p>
            )}
            <h2 className="sr-only">Your hidden titles</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {shown.map((item, i) => {
                const data = queries[i]?.data as TMDBMovieDetails | TMDBTVShowDetails | undefined;
                const title = data
                  ? item.mediaType === 'movie'
                    ? (data as TMDBMovieDetails).title
                    : (data as TMDBTVShowDetails).name
                  : `Title ${item.id}`;
                const date = data
                  ? item.mediaType === 'movie'
                    ? (data as TMDBMovieDetails).release_date
                    : (data as TMDBTVShowDetails).first_air_date
                  : null;
                const year = yearOf(date);
                return (
                  <li key={`${item.mediaType}-${item.id}`} className="group relative">
                    <Poster
                      path={data?.poster_path ?? null}
                      title={title}
                      year={year}
                      className="group-hover:shadow-poster group-hover:ring-foreground/30"
                    />
                    <div className="mt-2.5 space-y-1">
                      <h3 className="line-clamp-2 text-[0.9375rem] font-semibold leading-snug">
                        <button type="button" onClick={() => openTitle(item.id, item.mediaType)} className="stretched-link text-left">
                          {title}
                        </button>
                      </h3>
                      <p className="numeral font-mono text-xs text-muted-foreground">
                        {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                        {year ? ` · ${year}` : ''}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="relative z-10 mt-3 w-full"
                      onClick={() => unhide(item.id, item.mediaType)}
                    >
                      <Eye /> Unhide
                    </Button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </PageContainer>
    </Layout>
  );
}
