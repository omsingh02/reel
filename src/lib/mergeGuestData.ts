import { supabase } from '@/integrations/supabase/client';
import { getWatchlist, clearWatchlist } from '@/lib/watchlist';
import { getHidden, clearHidden } from '@/lib/hidden';
import { getProgress, clearProgress } from '@/lib/progress';

/** True when anything saved while signed out is still waiting to be moved. */
export function hasGuestData(): boolean {
  return getWatchlist().length > 0 || getHidden().length > 0 || getProgress().length > 0;
}

/**
 * Moves anything saved while signed out into the user's account on sign-in.
 * Duplicates are ignored, so re-running is harmless. Local copies are only
 * cleared once their rows are safely in the database.
 *
 * Returns the number of watchlist titles actually inserted (titles already in
 * the account are skipped and not counted).
 */
export async function mergeGuestData(userId: string): Promise<number> {
  let moved = 0;

  const watchlist = getWatchlist();
  if (watchlist.length) {
    // With ignoreDuplicates the representation only contains rows that were
    // really inserted, so its length is the true count.
    const { data, error } = await supabase.from('watchlist_items').upsert(
      watchlist.map(i => ({
        user_id: userId,
        tmdb_id: i.id,
        tmdb_type: i.mediaType,
        title: i.title,
        poster_path: i.posterPath,
        release_date: i.releaseDate || null,
        vote_average: i.voteAverage,
        status: i.status ?? 'watchlist',
        rating: i.rating ?? null,
        watched_at: i.watchedAt ?? null,
        runtime: i.runtime ?? null,
      })),
      { onConflict: 'user_id,tmdb_id,tmdb_type', ignoreDuplicates: true }
    ).select();
    if (!error) {
      moved += data?.length ?? 0;
      clearWatchlist();
    }
  }

  const hidden = getHidden();
  if (hidden.length) {
    const { error } = await supabase.from('hidden_items').upsert(
      hidden.map(i => ({ user_id: userId, tmdb_id: i.id, tmdb_type: i.mediaType })),
      { onConflict: 'user_id,tmdb_id,tmdb_type', ignoreDuplicates: true }
    ).select();
    if (!error) clearHidden();
  }

  const progress = getProgress();
  if (progress.length) {
    const { error } = await supabase.from('episode_progress').upsert(
      progress.map(p => ({ user_id: userId, tmdb_id: p.tmdbId, season: p.season, episode: p.episode })),
      { onConflict: 'user_id,tmdb_id,season,episode', ignoreDuplicates: true }
    ).select();
    if (!error) clearProgress();
  }

  return moved;
}
