import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCheck, ChevronDown } from 'lucide-react';
import { getSeason } from '@/lib/tmdb';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { hasAired, yearOf, formatCalendarDate } from '@/lib/dates';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { episodeCode } from '@/components/title/format';
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
  /** How many of the season's episodes have aired (from the show's next-episode date). */
  airedCount?: number;
  /** Called after the user ticks or unticks episodes, so the show's status can follow. */
  onProgress?: (change: ProgressChange) => void;
}

/** One frame per episode: watched = filled, not yet watched = outlined, unaired = dashed. */
function FrameStrip({ total, aired, isWatched }: { total: number; aired: number; isWatched: (episode: number) => boolean }) {
  return (
    <div aria-hidden className="mt-2.5 flex h-3 gap-[3px] overflow-hidden">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const state = n > aired ? 'unaired' : isWatched(n) ? 'watched' : 'open';
        return (
          <span
            key={n}
            className={cn(
              'h-full min-w-[3px] max-w-[1.125rem] flex-1 rounded-[2px] border transition-colors duration-base',
              state === 'watched' && 'border-primary bg-primary',
              state === 'open' && 'border-border-strong bg-surface-2',
              state === 'unaired' && 'border-dashed border-border bg-transparent',
            )}
          />
        );
      })}
    </div>
  );
}

/** A tick that draws itself when you check an episode. */
function Tick() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8.5l3.2 3.2L13 4.5" strokeDasharray="24" strokeDashoffset="24" className="animate-check-draw" />
    </svg>
  );
}

export function SeasonEpisodes({ tvId, season, airedCount, onProgress }: Props) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
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
  const totalEpisodes = airedNumbers ? airedNumbers.length : (airedCount ?? season.episode_count);
  const watchedInSeason = forShow(tvId).filter(
    p => p.season === season.season_number && (!airedNumbers || airedNumbers.includes(p.episode))
  ).length;
  const allWatched = totalEpisodes > 0 && watchedInSeason >= totalEpisodes;
  const year = yearOf(season.air_date);

  const toggleSeason = () => {
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
    <section className="rounded-lg border border-border bg-card shadow-panel">
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-4 py-3.5 text-left transition-colors duration-fast hover:bg-accent/60"
        >
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-[0.9375rem] font-semibold">{season.name}</span>
              {/* Keeps the name and the count apart in the accessible name ("Season 1, 0/8 watched"). */}
              <span className="sr-only">, </span>
              <span className="numeral font-mono text-xs text-muted-foreground">
                {watchedInSeason}/{totalEpisodes} watched{year ? ` · ${year}` : ''}
              </span>
            </span>
            <FrameStrip
              total={season.episode_count}
              aired={airedCount ?? season.episode_count}
              isWatched={n => isWatched(tvId, season.season_number, n)}
            />
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-base', open && 'rotate-180')} aria-hidden />
        </button>

        <Button
          variant="ghost"
          size="icon-lg"
          onClick={toggleSeason}
          aria-label={allWatched ? `Mark ${season.name} unwatched` : `Mark all of ${season.name} watched`}
          title={allWatched ? 'Mark season unwatched' : 'Mark whole season watched'}
          className={cn('h-11 w-11', allWatched ? 'text-primary-text' : 'text-muted-foreground')}
        >
          <CheckCheck />
        </Button>
      </div>

      {open && (
        <div id={panelId} className="max-h-[28rem] overflow-y-auto border-t border-border p-2">
          {isLoading && (
            <div className="space-y-1.5 p-1">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          )}
          {error && <p className="p-3 text-sm text-muted-foreground">Couldn't load episodes. Close and reopen the season to try again.</p>}
          <ul>
            {data?.episodes?.map(ep => {
              const watched = isWatched(tvId, season.season_number, ep.episode_number);
              const aired = hasAired(ep.air_date);
              const code = episodeCode(season.season_number, ep.episode_number);
              return (
                <li key={ep.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={watched}
                    aria-label={`Mark S${season.season_number}E${ep.episode_number} watched`}
                    onClick={() => {
                      if (watched) {
                        unmark(tvId, season.season_number, ep.episode_number);
                        onProgress?.({ kind: 'unmark', season: season.season_number, episodes: [ep.episode_number] });
                      } else {
                        mark(tvId, season.season_number, ep.episode_number);
                        onProgress?.({ kind: 'mark', season: season.season_number, episodes: [ep.episode_number] });
                      }
                    }}
                    className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors duration-fast hover:bg-accent"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-sm border-2 transition-colors duration-fast',
                        watched ? 'border-primary bg-primary text-primary-foreground' : 'border-border-strong bg-surface-2',
                      )}
                    >
                      {watched && <Tick />}
                    </span>
                    <span className={cn('min-w-0 flex-1', watched && 'opacity-65')}>
                      <span className="flex items-baseline gap-2.5">
                        <span className="numeral shrink-0 font-mono text-xs text-muted-foreground">{code}</span>
                        <span className="truncate text-sm font-medium">{ep.name}</span>
                      </span>
                      {(ep.air_date || ep.runtime) && (
                        <span className="numeral mt-0.5 block font-mono text-xs text-muted-foreground">
                          {ep.air_date && (aired ? '' : 'Airs ')}
                          {ep.air_date && formatCalendarDate(ep.air_date, { year: 'numeric', month: 'short', day: 'numeric' })}
                          {ep.runtime ? `${ep.air_date ? ' · ' : ''}${ep.runtime}m` : ''}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
