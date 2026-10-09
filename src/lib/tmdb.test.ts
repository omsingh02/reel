import { describe, expect, it } from 'vitest';
import { cleanMediaList, computeRuntime } from './tmdb';
import type { TMDBMovieDetails, TMDBTVShowDetails } from '@/types/tmdb';

describe('computeRuntime', () => {
  it('uses the film runtime for movies', () => {
    expect(computeRuntime({ runtime: 120 } as TMDBMovieDetails, 'movie')).toBe(120);
    expect(computeRuntime({ runtime: 0 } as TMDBMovieDetails, 'movie')).toBeNull();
  });

  it('multiplies episode length by episode count for shows', () => {
    const show = { episode_run_time: [45], number_of_episodes: 10 } as TMDBTVShowDetails;
    expect(computeRuntime(show, 'tv')).toBe(450);
  });

  it('falls back to the last aired episode when episode_run_time is empty', () => {
    const show = {
      episode_run_time: [],
      number_of_episodes: 8,
      last_episode_to_air: { runtime: 50 },
    } as unknown as TMDBTVShowDetails;
    expect(computeRuntime(show, 'tv')).toBe(400);
  });

  it('returns null when no episode length is known', () => {
    const show = { episode_run_time: [], number_of_episodes: 8 } as unknown as TMDBTVShowDetails;
    expect(computeRuntime(show, 'tv')).toBeNull();
  });
});

describe('cleanMediaList', () => {
  const items = [
    { id: 1, poster_path: '/a.jpg' },
    { id: 1, poster_path: '/a.jpg' },
    { id: 2, poster_path: null },
    { id: 3, poster_path: '/c.jpg', adult: true },
  ];

  it('dedupes, drops posterless and adult entries by default', () => {
    expect(cleanMediaList(items).map(i => i.id)).toEqual([1]);
  });

  it('keeps posterless entries when asked (search)', () => {
    expect(cleanMediaList(items, { requirePoster: false }).map(i => i.id)).toEqual([1, 2]);
  });
});
