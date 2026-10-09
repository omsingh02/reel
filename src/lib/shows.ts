import { hasAired } from '@/lib/dates';
import type { TMDBTVShowDetails } from '@/types/tmdb';

type ShowSeasons = Pick<TMDBTVShowDetails, 'seasons' | 'next_episode_to_air'>;

export interface EpisodeRef {
  season: number;
  episode: number;
  seasonName: string;
}

/**
 * How many episodes of each regular season have actually aired. TMDB's
 * `episode_count` includes announced-but-unaired episodes, so everything at or
 * after `next_episode_to_air` is cut off.
 */
export function airedEpisodeCounts(tv: ShowSeasons): Map<number, number> {
  const next = tv.next_episode_to_air;
  const counts = new Map<number, number>();
  for (const s of tv.seasons ?? []) {
    if (s.season_number <= 0 || s.episode_count <= 0) continue;
    let aired = s.episode_count;
    if (s.air_date && !hasAired(s.air_date)) aired = 0;
    else if (next && s.season_number > next.season_number) aired = 0;
    else if (next && s.season_number === next.season_number) {
      aired = Math.max(0, Math.min(s.episode_count, next.episode_number - 1));
    }
    counts.set(s.season_number, aired);
  }
  return counts;
}

/** First aired episode that isn't watched yet, in season order. */
export function firstUnwatchedAired(
  tv: ShowSeasons,
  isWatched: (season: number, episode: number) => boolean
): EpisodeRef | null {
  const counts = airedEpisodeCounts(tv);
  for (const s of tv.seasons ?? []) {
    const aired = counts.get(s.season_number) ?? 0;
    for (let e = 1; e <= aired; e++) {
      if (!isWatched(s.season_number, e)) return { season: s.season_number, episode: e, seasonName: s.name };
    }
  }
  return null;
}

/** True when the show has aired episodes and every one of them is watched. */
export function isCaughtUp(
  tv: ShowSeasons,
  isWatched: (season: number, episode: number) => boolean
): boolean {
  const total = [...airedEpisodeCounts(tv).values()].reduce((a, b) => a + b, 0);
  return total > 0 && firstUnwatchedAired(tv, isWatched) === null;
}
