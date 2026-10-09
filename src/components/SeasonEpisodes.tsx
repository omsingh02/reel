import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Check, CheckCheck } from 'lucide-react';
import { getSeason, getImageUrl } from '@/lib/tmdb';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { hasAired, yearOf, formatCalendarDate } from '@/lib/dates';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
}

export interface ProgressChange {
  kind: 'mark' | 'unmark';
  season: number;
  episodes: number[] | 'all';
}

interface Props {
  tvId: number;
  season: Season;
  /** Called after the user ticks or unticks episodes, so the show's status can follow. */
  onProgress?: (change: ProgressChange) => void;
}

export function SeasonEpisodes({ tvId, season, onProgress }: Props) {
  const [open, setOpen] = useState(false);
  const { mark, unmark, markSeason, unmarkSeason, isWatched, forShow } = useEpisodeProgress();

  const { data, isLoading, error } = useQuery({
    queryKey: ['season', tvId, season.season_number],
    queryFn: () => getSeason(tvId, season.season_number),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  // Unaired episodes can't be watched yet, so they don't count toward
  // "x/y" or "mark whole season" once we know which ones they are.
  const airedNumbers = data?.episodes?.filter(ep => hasAired(ep.air_date)).map(ep => ep.episode_number);
  const totalEpisodes = airedNumbers ? airedNumbers.length : season.episode_count;
  const watchedInSeason = forShow(tvId).filter(
    p => p.season === season.season_number && (!airedNumbers || airedNumbers.includes(p.episode))
  ).length;
  const allWatched = totalEpisodes > 0 && watchedInSeason >= totalEpisodes;

  const toggleSeason = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allWatched) {
      unmarkSeason(tvId, season.season_number);
      onProgress?.({ kind: 'unmark', season: season.season_number, episodes: 'all' });
      return;
    }
    const numbers = airedNumbers ?? Array.from({ length: season.episode_count }, (_, i) => i + 1);
    markSeason(tvId, season.season_number, numbers);
    onProgress?.({ kind: 'mark', season: season.season_number, episodes: numbers });
  };

  return (
    <div className="rounded-2xl bg-secondary/50 border border-border/30 overflow-hidden">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex-1 min-w-0 flex items-center gap-3 p-2.5 text-left hover:bg-secondary/70 transition-colors"
        >
          <div className="w-12 h-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
            {season.poster_path ? (
              <img src={getImageUrl(season.poster_path, 'w92') || ''} alt={season.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                S{season.season_number}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{season.name}</p>
            <p className="text-xs text-muted-foreground">
              {watchedInSeason}/{totalEpisodes} watched
              {yearOf(season.air_date) && ` • ${yearOf(season.air_date)}`}
            </p>
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        <button
          type="button"
          onClick={toggleSeason}
          aria-label={allWatched ? `Mark ${season.name} unwatched` : `Mark all of ${season.name} watched`}
          title={allWatched ? 'Mark season unwatched' : 'Mark whole season watched'}
          className={cn(
            "mr-2 h-11 w-11 flex items-center justify-center rounded-full transition-colors flex-shrink-0",
            allWatched ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary"
          )}
        >
          <CheckCheck className="h-5 w-5" />
        </button>
      </div>


      {open && (
        <div className="border-t border-border/30 p-2 space-y-1 max-h-72 overflow-y-auto">
          {isLoading && (
            <>
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </>
          )}
          {error && (
            <p className="text-xs text-muted-foreground p-2">Couldn't load episodes.</p>
          )}
          {data?.episodes?.map(ep => {
            const watched = isWatched(tvId, season.season_number, ep.episode_number);
            return (
              <button
                key={ep.id}
                type="button"
                onClick={() => {
                  if (watched) {
                    unmark(tvId, season.season_number, ep.episode_number);
                    onProgress?.({ kind: 'unmark', season: season.season_number, episodes: [ep.episode_number] });
                  } else {
                    mark(tvId, season.season_number, ep.episode_number);
                    onProgress?.({ kind: 'mark', season: season.season_number, episodes: [ep.episode_number] });
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-secondary transition-colors",
                  watched && "opacity-60"
                )}
              >
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0",
                    watched ? "bg-primary border-primary" : "border-border"
                  )}
                >
                  {watched && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    <span className="text-muted-foreground mr-1.5">E{ep.episode_number}</span>
                    {ep.name}
                  </p>
                  {ep.air_date && (
                    <p className="text-[11px] text-muted-foreground">
                      {formatCalendarDate(ep.air_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
