import { describe, expect, it } from 'vitest';
import { airedEpisodeCounts, firstUnwatchedAired, isCaughtUp } from './shows';

const season = (n: number, count: number, air_date: string | null = '2020-01-01') => ({
  id: n, season_number: n, name: `Season ${n}`, episode_count: count, air_date, poster_path: null, overview: '',
});

const show = (seasons: ReturnType<typeof season>[], next: { season_number: number; episode_number: number } | null = null) =>
  ({ seasons, next_episode_to_air: next } as never);

describe('airedEpisodeCounts', () => {
  it('counts every episode of a finished show and ignores specials', () => {
    const tv = show([season(0, 5), season(1, 10), season(2, 8)]);
    expect([...airedEpisodeCounts(tv)]).toEqual([[1, 10], [2, 8]]);
  });

  it('cuts off at the next scheduled episode', () => {
    const tv = show([season(1, 10), season(2, 10), season(3, 10, '2999-01-01')], { season_number: 2, episode_number: 4 });
    expect(airedEpisodeCounts(tv).get(1)).toBe(10);
    expect(airedEpisodeCounts(tv).get(2)).toBe(3);
    expect(airedEpisodeCounts(tv).get(3)).toBe(0);
  });
});

describe('firstUnwatchedAired / isCaughtUp', () => {
  const tv = show([season(1, 3), season(2, 3)], { season_number: 2, episode_number: 2 });

  it('finds the next unwatched aired episode', () => {
    const watched = new Set(['1:1', '1:2']);
    expect(firstUnwatchedAired(tv, (s, e) => watched.has(`${s}:${e}`))).toMatchObject({ season: 1, episode: 3 });
  });

  it('reports caught up when only unaired episodes remain', () => {
    const watched = new Set(['1:1', '1:2', '1:3', '2:1']);
    const isWatched = (s: number, e: number) => watched.has(`${s}:${e}`);
    expect(firstUnwatchedAired(tv, isWatched)).toBeNull();
    expect(isCaughtUp(tv, isWatched)).toBe(true);
  });

  it('is not caught up with nothing watched, or nothing aired', () => {
    expect(isCaughtUp(tv, () => false)).toBe(false);
    expect(isCaughtUp(show([season(1, 3, '2999-01-01')]), () => true)).toBe(false);
  });
});
