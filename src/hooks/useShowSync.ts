import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEpisodeProgress } from '@/hooks/useEpisodeProgress';
import { getSeason, getTVShowDetails } from '@/lib/tmdb';
import { airedEpisodeCounts } from '@/lib/shows';
import { hasAired } from '@/lib/dates';
import type { TMDBTVShowDetails } from '@/types/tmdb';

type KnownShow = Pick<TMDBTVShowDetails, 'seasons' | 'next_episode_to_air'>;

/**
 * Keeps a show's "watched" flag and its per-episode progress consistent:
 * marking a whole show watched ticks every episode that has aired.
 */
export function useShowSync() {
  const queryClient = useQueryClient();
  const { markSeason } = useEpisodeProgress();

  const markAllAired = useCallback(
    async (tvId: number, known?: KnownShow) => {
      try {
        const tv: KnownShow =
          known ??
          (await queryClient.fetchQuery<TMDBTVShowDetails>({
            queryKey: ['runtime-details', 'tv', tvId],
            queryFn: () => getTVShowDetails(tvId, { slim: true }),
            staleTime: 24 * 60 * 60 * 1000,
          }));

        const seasonNumbers = [...airedEpisodeCounts(tv)].filter(([, aired]) => aired > 0).map(([n]) => n);
        await Promise.all(
          seasonNumbers.map(async seasonNumber => {
            const data = await queryClient.fetchQuery({
              queryKey: ['season', tvId, seasonNumber],
              queryFn: () => getSeason(tvId, seasonNumber),
              staleTime: 5 * 60 * 1000,
            });
            // Real episode numbers from TMDB (not always 1..N), aired ones only.
            const aired = data.episodes.filter(ep => hasAired(ep.air_date)).map(ep => ep.episode_number);
            if (aired.length) markSeason(tvId, seasonNumber, aired);
          })
        );
      } catch {
        // Best effort: the show is still marked watched; episodes can be ticked by hand.
      }
    },
    [queryClient, markSeason]
  );

  return { markAllAired };
}
