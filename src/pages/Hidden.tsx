import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { EyeOff, Eye } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { useHidden } from '@/hooks/useHidden';
import { useOpenTitle } from '@/hooks/useOpenTitle';
import { getImageUrl, getMovieDetails, getTVShowDetails } from '@/lib/tmdb';
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
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center px-3 sm:px-5 lg:px-8 h-16">
          <h1 className="text-xl font-semibold">Hidden titles</h1>
          {items.length > 0 && <span className="ml-3 text-sm text-muted-foreground">({items.length})</span>}
        </div>
      </header>

      <div className="flex-1 px-3 sm:px-5 lg:px-8 py-6 max-w-2xl">
        {items.length === 0 ? (
          <EmptyState
            icon={EyeOff}
            title="Nothing hidden"
            description='Titles you mark "Not interested" disappear from Discover, Movies, Shows and search. They show up here so you can bring them back.'
          />
        ) : loading ? (
          <LoadingSpinner className="py-20" size="lg" />
        ) : (
          <div className="space-y-2">
            {items.length > shown.length && (
              <p className="text-xs text-muted-foreground">Showing the first {MAX_TITLES} of {items.length}.</p>
            )}
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
              const poster = getImageUrl(data?.poster_path ?? null, 'w154');
              return (
                <div
                  key={`${item.mediaType}-${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border/40 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => openTitle(item.id, item.mediaType)}
                >
                  <div className="flex-shrink-0 w-12 aspect-[2/3] rounded-xl overflow-hidden bg-secondary">
                    {poster && <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate" title={title}>{title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                      {yearOf(date) ? ` · ${yearOf(date)}` : ''}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5 shrink-0"
                    onClick={e => { e.stopPropagation(); unhide(item.id, item.mediaType); }}
                  >
                    <Eye className="h-4 w-4" /> Unhide
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
