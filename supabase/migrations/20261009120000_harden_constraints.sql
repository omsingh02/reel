-- Harden data constraints.
--
-- Until now the database trusted every client. Anything that could write a row (the web app,
-- the MCP server, a future import) could store an unknown status, a rating of 42, a negative
-- runtime or an episode number below zero, and deleting an account left orphaned rows in two
-- tables. This migration cleans existing data and then makes the database enforce the rules.
--
-- What changes
--   1. watchlist_items.status   must be 'watchlist' or 'watched'
--        NOTE: the MCP server used to accept a third status, 'watching'. Any such rows are
--        mapped to 'watchlist' ("to watch"), because the app has no "watching" state.
--   2. watchlist_items.rating   must be NULL or between 1 and 10
--      watchlist_items.runtime  must be NULL or >= 0
--        Out-of-range values are set to NULL (the title stays, only the bad value is dropped).
--   3. hidden_items.tmdb_type   must be 'movie' or 'tv'
--      episode_progress.season / .episode must be >= 0
--        Rows that violate this are deleted; they could never match a real title.
--   4. hidden_items.user_id and episode_progress.user_id now reference auth.users(id) with
--      ON DELETE CASCADE (watchlist_items and profiles already did). Orphaned rows left behind by
--      earlier account deletions are removed first.
--
-- Notes
--   * No new index is needed for the foreign keys: the existing UNIQUE constraints on both tables
--     lead with user_id, so cascading deletes and joins already use an index.
--   * Constraints are added NOT VALID and then VALIDATEd, so the table is only locked briefly
--     while validation scans run with the weaker SHARE UPDATE EXCLUSIVE lock.
--   * Every step is safe to re-run.

-- Fail fast instead of queueing behind long transactions: adding a foreign key briefly locks
-- auth.users, and a waiting lock request would otherwise block sign-ins behind it.
SET lock_timeout = '5s';

-- ---------------------------------------------------------------------------
-- 1. Clean existing data so every constraint below can be validated
-- ---------------------------------------------------------------------------
UPDATE public.watchlist_items SET status = 'watchlist'
  WHERE status NOT IN ('watchlist', 'watched');
UPDATE public.watchlist_items SET rating = NULL
  WHERE rating IS NOT NULL AND (rating < 1 OR rating > 10);
UPDATE public.watchlist_items SET runtime = NULL
  WHERE runtime IS NOT NULL AND runtime < 0;

DELETE FROM public.hidden_items WHERE tmdb_type NOT IN ('movie', 'tv');
DELETE FROM public.episode_progress WHERE season < 0 OR episode < 0;

DELETE FROM public.hidden_items h
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = h.user_id);
DELETE FROM public.episode_progress e
  WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = e.user_id);

-- ---------------------------------------------------------------------------
-- 2. CHECK constraints (guarded: ADD CONSTRAINT has no IF NOT EXISTS)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'watchlist_items_status_check'
                   AND conrelid = 'public.watchlist_items'::regclass) THEN
    ALTER TABLE public.watchlist_items
      ADD CONSTRAINT watchlist_items_status_check
      CHECK (status IN ('watchlist', 'watched')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'watchlist_items_rating_check'
                   AND conrelid = 'public.watchlist_items'::regclass) THEN
    ALTER TABLE public.watchlist_items
      ADD CONSTRAINT watchlist_items_rating_check
      CHECK (rating IS NULL OR (rating >= 1 AND rating <= 10)) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'watchlist_items_runtime_check'
                   AND conrelid = 'public.watchlist_items'::regclass) THEN
    ALTER TABLE public.watchlist_items
      ADD CONSTRAINT watchlist_items_runtime_check
      CHECK (runtime IS NULL OR runtime >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'hidden_items_tmdb_type_check'
                   AND conrelid = 'public.hidden_items'::regclass) THEN
    ALTER TABLE public.hidden_items
      ADD CONSTRAINT hidden_items_tmdb_type_check
      CHECK (tmdb_type IN ('movie', 'tv')) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'episode_progress_season_check'
                   AND conrelid = 'public.episode_progress'::regclass) THEN
    ALTER TABLE public.episode_progress
      ADD CONSTRAINT episode_progress_season_check
      CHECK (season >= 0) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'episode_progress_episode_check'
                   AND conrelid = 'public.episode_progress'::regclass) THEN
    ALTER TABLE public.episode_progress
      ADD CONSTRAINT episode_progress_episode_check
      CHECK (episode >= 0) NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Foreign keys to auth.users so deleting an account removes its rows
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'hidden_items_user_id_fkey'
                   AND conrelid = 'public.hidden_items'::regclass) THEN
    ALTER TABLE public.hidden_items
      ADD CONSTRAINT hidden_items_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint
                 WHERE conname = 'episode_progress_user_id_fkey'
                   AND conrelid = 'public.episode_progress'::regclass) THEN
    ALTER TABLE public.episode_progress
      ADD CONSTRAINT episode_progress_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE NOT VALID;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Validate (a no-op for constraints that are already validated)
-- ---------------------------------------------------------------------------
ALTER TABLE public.watchlist_items VALIDATE CONSTRAINT watchlist_items_status_check;
ALTER TABLE public.watchlist_items VALIDATE CONSTRAINT watchlist_items_rating_check;
ALTER TABLE public.watchlist_items VALIDATE CONSTRAINT watchlist_items_runtime_check;
ALTER TABLE public.hidden_items VALIDATE CONSTRAINT hidden_items_tmdb_type_check;
ALTER TABLE public.hidden_items VALIDATE CONSTRAINT hidden_items_user_id_fkey;
ALTER TABLE public.episode_progress VALIDATE CONSTRAINT episode_progress_season_check;
ALTER TABLE public.episode_progress VALIDATE CONSTRAINT episode_progress_episode_check;
ALTER TABLE public.episode_progress VALIDATE CONSTRAINT episode_progress_user_id_fkey;

RESET lock_timeout;
