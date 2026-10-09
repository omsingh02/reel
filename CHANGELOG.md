# Changelog

All notable changes to Reel are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Hidden titles page (`/hidden`) to review and unhide anything marked "Not interested", plus an
  Undo toast when hiding a title.
- "Watched on" date picker, so past viewings can be logged on the right day.
- Show and episode progress now stay in sync: marking a show watched ticks every aired episode,
  finishing the last aired episode marks the show watched, and unticking an episode of a watched
  show moves it back to your to-watch list.
- "Mark watched" works on titles that aren't in your list yet.
- Forgot-password and reset-password flow (`/reset-password`).
- Mobile "More" menu (Upcoming, Stats, Hidden titles, theme, account) and a Movies tab in the bottom bar.
- "My rating" sort on My List.
- TMDB and JustWatch attribution in the sidebar and mobile menu.
- Per-title page titles and descriptions; share links now use `/movie/:id` and `/show/:id`.
- Search switches to the other tab when only that tab has results, and keeps results without a poster.
- Default "Available on" region now comes from the browser locale.
- `slim=1` option on the `tmdb` edge function for lightweight details.
- Unit tests for dates, runtime calculation, episode logic and list cleaning; CI workflow,
  issue and PR templates, Dependabot, and contributor docs.
- Brand kit: path-based logo and wordmarks, banner, GitHub social preview, README screenshots and
  a brand guide (`docs/`), plus the MIT `LICENSE`.

### Changed

- **Standalone deployment.** Reel no longer depends on the Lovable platform: the Supabase client is
  plain (no preview-auth broker), the `.lovable/` folder is gone, the MCP consent screen moved from
  `/.lovable/oauth/consent` to `/oauth/consent`, `.env` is no longer tracked, and the Supabase auth
  and OAuth-server settings now live in `supabase/config.toml` (`supabase config push`). Added
  `vercel.json` (SPA rewrite, cache and security headers). The default site origin is now
  `https://reel.omsingh.me`. Bun's `bun.lock` is the only lockfile (Dependabot follows it).
  The MCP server still uses the MIT-licensed `@lovable.dev/mcp-js` SDK, which runs on Supabase.
- Upcoming now includes shows you follow even after marking them watched, loads lightweight data,
  shows results as they arrive, reports failures and the 80-title cap, and is no longer indexed.
- Discover: "Top rated" requires 300 votes, "Newest" excludes unreleased titles and no longer hides
  fresh releases, and the year filter reaches back to 1930.
- "Highest rated" on My List is now "TMDB score" (your own ratings use "My rating").
- The home hero button is labelled "View details"; "Most watched"/"What everyone's watching"
  copy now says what the data is (TMDB popularity).
- The list card shows how many episodes you've watched instead of guessing a next episode.
- The app is called Reel everywhere, including auth, sharing, OAuth consent and MCP tools.
- The offline banner and the end-of-results message now say what is actually true.
- TMDB requests no longer refresh the user session first; client errors (4xx) are no longer retried.
- The site origin lives in one place (`VITE_SITE_URL`, default unchanged) and feeds the pages,
  `index.html`, the sitemap and `robots.txt`.
- README rewritten; build-analysis output (`stats.json`) is no longer tracked.
- App icons and the link-preview image were regenerated: the social card still said "Watchlist",
  and `icon-512.png` was 816px / 569 KB. Added 192px, maskable and Apple touch icons and a correct manifest.
- `npm run dev` / `build` no longer require Bun (the sitemap script is plain Node); ESLint is clean
  and CI lint is blocking.

### Fixed

- The `tmdb` function times out after 8 s, forwards upstream 404/429 (with `Retry-After`) instead
  of a generic 500, returns a JSON 502 for unreadable replies, and sends cache headers for
  successful reads only.
- Database constraints (migration `20261009120000_harden_constraints`): `status` must be
  `watchlist` or `watched`, `rating` 1–10, `runtime` ≥ 0, and `hidden_items` / `episode_progress`
  now cascade-delete with the account. The migration first maps any `watching` rows to
  `watchlist`, nulls out-of-range values and removes invalid or orphaned rows.
- MCP `add_to_watchlist` no longer resets an already-watched title to "to watch" and never
  overwrites an existing rating; `update_watchlist_item` keeps the original watched date and
  clears it when moving back to "to watch". The unsupported `watching` status was removed.
- Undo after removing a title restores its full state in one write (status, rating, runtime, added date).
- Titles saved as a guest now appear right after signing in, and the merge count is accurate.
- Dates no longer shift by a day (or into the wrong decade) for users west of UTC.
- Stats hours: shows count all episodes, and runtime is saved from every "watched" action, with
  existing watched titles backfilled when Stats opens.
- "Up Next" and "mark whole season" ignore episodes that haven't aired.
- Episode ticks update instantly and roll back with an error message if saving fails; unticking
  and unhiding no longer fail silently.
- Arrow keys scroll the title modal again.
- Corrupt, hand-edited or outdated browser data (guest list, hidden titles, episode progress) can
  no longer crash the app on load or silently wipe the list: bad entries are skipped, duplicates
  dropped, and the original text is kept under `<key>:corrupt`.
- Quick successive actions (add then remove, tick then untick) now reach the server in order, so
  they can't leave the wrong state behind.
- A trailer that can't play (blocked script, non-embeddable video) shows a fallback with a YouTube
  link instead of an endless spinner; fullscreen errors no longer throw.
- Missing Supabase settings show setup instructions instead of a blank page.
- Empty placeholder seasons ("Season 5 — 0/0 watched") no longer show on show pages, and the
  Movie/TV badge no longer sits under the action buttons on phones.

### Security

- TMDB request errors can contain the full request URL, including the API key. The `tmdb` function
  now redacts it from logs, and the MCP tools return a generic "TMDB is unreachable or timed out"
  message instead of the raw error.
- The OAuth consent screen no longer claims that signing out revokes an app's access; it now
  advises approving only apps you trust.

## [1.0.0]

Initial public version.
