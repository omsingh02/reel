# Tier S + A Feature Build

Adds 7 features inspired by Letterboxd / Trakt / Reelgood / JustWatch, scoped sanely for a 100-user app.

## Tier S — quick wins

### 1. Where to watch (streaming providers)
- New TMDB call: `/{type}/{id}/watch/providers` (already proxied, just add a function).
- In `MediaDetails`, render provider logos (flatrate / rent / buy) for the user's region.
- Region: default to browser locale country, persisted in `localStorage` with a tiny dropdown of top ~15 regions.

### 2. Watchlist filters & sort
- In `Watchlist.tsx`, add a filter bar: media type, genre (multi), year range, min rating, status (all / unwatched / watched), and a sort select (added date, title, release, rating).
- Pure client-side over already-fetched items. No new queries.

### 3. Hide / Not interested
- New `hidden_items` storage (DB table for signed-in users, localStorage for guests) — same hybrid pattern as watchlist.
- "Hide" action on `MediaCard` overflow (long-press on mobile, hover menu on desktop).
- Discover / Movies / TV / Recommendations filter out hidden IDs before render.
- Settings link in user menu: "Hidden items (N) — Restore".

### 4. Mark as watched + rating + watched date
- Extend `watchlist_items` with `status` ('watchlist' | 'watched'), `rating` (1–10 nullable), `watched_at` (timestamptz nullable).
- Update guest storage shape with the same fields, with a one-time migration on read.
- In `MediaDetails`: "Mark watched" button → opens a small inline rater (1–10 stars or 0.5 increments) + date (defaults to today).
- `WatchlistCard` shows a small "Watched · ★8" badge.

## Tier A — higher value, more surface

### 5. TV "Up Next" episode tracking
- New table `episode_progress`: `user_id`, `tmdb_id`, `season`, `episode`, `watched_at`. Guest equivalent in localStorage.
- New TMDB call: `/tv/{id}/season/{n}` for episode lists.
- In `MediaDetails` for TV: an "Episodes" tab — season selector + episode list with one-tap "Watched" toggle.
- Watchlist TV cards show "Next: S2E4 · Title" computed from progress + season data.

### 6. Upcoming releases calendar
- New page `/upcoming`: for items in the user's watchlist, list:
  - TV: next unaired episode air date (from `next_episode_to_air` we already fetch).
  - Movies: theatrical → streaming/digital release window (TMDB `/movie/{id}/release_dates`).
- Grouped by month, sorted ascending. Empty state if watchlist is empty.

### 7. Year-in-review / stats
- New page `/stats`: aggregations over `watched` items.
  - Total watched, total hours (sum of runtimes / 22min episode estimates).
  - Top 5 genres, top decade, average rating, watched-per-month sparkline for current year.
- Pure client-side over watchlist + cached TMDB details (fetch missing runtimes lazily).

## Technical details

### Schema migration
```sql
ALTER TABLE public.watchlist_items
  ADD COLUMN status text NOT NULL DEFAULT 'watchlist',
  ADD COLUMN rating numeric,
  ADD COLUMN watched_at timestamptz,
  ADD COLUMN runtime integer;

CREATE TABLE public.hidden_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tmdb_id integer NOT NULL,
  tmdb_type text NOT NULL,
  hidden_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, tmdb_type)
);
GRANT SELECT, INSERT, DELETE ON public.hidden_items TO authenticated;
GRANT ALL ON public.hidden_items TO service_role;
ALTER TABLE public.hidden_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hidden read"   ON public.hidden_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own hidden insert" ON public.hidden_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own hidden delete" ON public.hidden_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.episode_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tmdb_id integer NOT NULL,
  season integer NOT NULL,
  episode integer NOT NULL,
  watched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, season, episode)
);
GRANT SELECT, INSERT, DELETE ON public.episode_progress TO authenticated;
GRANT ALL ON public.episode_progress TO service_role;
ALTER TABLE public.episode_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ep read"   ON public.episode_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own ep insert" ON public.episode_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own ep delete" ON public.episode_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### Code surface
- `src/lib/tmdb.ts` — add `getWatchProviders`, `getSeason`, `getReleaseDates`.
- `src/lib/watchlist.ts` — extend item shape, add status/rating/watched_at; migration on read.
- `src/lib/hidden.ts` — new (mirrors watchlist hybrid storage + pub/sub).
- `src/lib/progress.ts` — new (episode progress hybrid storage).
- `src/hooks/useHidden.ts`, `useHiddenDB.ts`, `useEpisodeProgress.ts`, `useEpisodeProgressDB.ts` — same pattern as watchlist hooks.
- `src/components/MediaDetails.tsx` — providers section, watched/rating UI, episodes tab for TV.
- `src/components/MediaCard.tsx` — overflow menu with "Hide".
- `src/components/WatchlistCard.tsx` — watched badge + "Next: SxEy" for TV.
- `src/pages/Watchlist.tsx` — filter/sort bar.
- `src/pages/Upcoming.tsx`, `src/pages/Stats.tsx` — new pages.
- `src/App.tsx` + `AppSidebar.tsx` + `MobileNav.tsx` — wire new routes.

### Deliberate non-goals
- No notifications, no friends/social, no custom lists, no CSV import/export — out of scope per previous decisions.
- No new edge functions beyond the existing TMDB proxy (the new endpoints reuse it).

### Validation
- Manual smoke via Playwright: add → mark watched → rate, hide → restore, episode toggle → "next episode" badge updates, upcoming page renders, stats page renders.
- Build clean; no new lint warnings.

Approve and I'll ship it end-to-end.
