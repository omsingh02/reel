<p align="center">
  <img src="docs/assets/banner.png" alt="Reel: track what you watch, never miss what's next" width="100%">
</p>

<h1 align="center">Reel</h1>

<p align="center">
  <b>Track what you watch. Never miss what's next.</b><br>
  A fast, private-first watchlist for movies and TV, with episode progress, viewing stats<br>
  and an MCP server so your AI assistant can manage your list too.
</p>

<p align="center">
  <a href="https://github.com/omsingh02/reel/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/omsingh02/reel/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-F25B31"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white">
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen"></a>
</p>

<p align="center">
  <a href="https://reel.omsingh.me"><b>Live demo</b></a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#mcp-server">MCP server</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/discover.webp" alt="Discover with a cinemascope featured title and trending rails" width="49%">
  <img src="docs/screenshots/title-details.webp" alt="Title page with your rating, watched date and where to watch" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/my-list.webp" alt="My List with watched titles and ratings" width="49%">
  <img src="docs/screenshots/episode-tracking.webp" alt="Per-episode progress for a TV show" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/stats.webp" alt="Viewing stats as a credits sheet" width="49%">
  <img src="docs/screenshots/upcoming.webp" alt="Upcoming releases and new episodes as ticket stubs" width="49%">
</p>

<details>
<summary><b>Mobile, light theme and account screens</b></summary>
<br>
<p align="center">
  <img src="docs/screenshots/mobile-discover.webp" alt="Mobile Discover" width="24%">
  <img src="docs/screenshots/mobile-my-list.webp" alt="Mobile My List" width="24%">
  <img src="docs/screenshots/mobile-stats.webp" alt="Mobile Stats" width="24%">
  <img src="docs/screenshots/mobile-title.webp" alt="Mobile title page" width="24%">
</p>
<p align="center">
  <img src="docs/screenshots/light-mode.webp" alt="Movies catalogue in the light theme" width="49%">
  <img src="docs/screenshots/settings.webp" alt="Settings with appearance, account and data export" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/auth.webp" alt="Sign in and create account" width="80%">
</p>
</details>

## Features

**Discover**
- A cinemascope hero for the featured title, then trending and popular rails for movies and TV.
- Browse **Movies** and **TV Shows** by genre, year, minimum rating and sort order. Filters live in the URL, so a filtered view is shareable.
- Search with infinite scroll. If the Movies tab has no hits but TV does, it switches for you.
- Title pages with cast and crew, trailer, recommendations, similar titles, and **where to watch** by region (streaming, rent, buy).

**Track**
- **My List** with *to watch* / *watched* status, 1–10 ratings, a "watched on" date you can set to the past, filters, sorting (including *my rating*) and one-tap undo.
- **Per-episode progress** for shows, with whole-season toggles. Finish the last aired episode and the show is marked watched; mark a show watched and every aired episode is ticked.
- **Upcoming**: release dates and next-episode air dates for the titles in your list.
- **Stats**: titles watched, hours, movies vs shows, average rating and top decades.
- **Hidden titles**: "Not interested" removes a title from feeds and search, and a dedicated page brings it back.

**Yours, wherever you are**
- **Guest first.** Everything works without an account and is stored in your browser. Sign in later and your list, hidden titles and episode progress are merged into your account.
- Email and password accounts with verification and password reset. Per-user data is protected by Postgres Row Level Security.
- **Settings**: switch theme, change your password, **export everything as JSON**, clear this device's data, or **delete your account** (a typed confirmation, then everything you saved goes with it).
- Dark ("projection room") and light ("programme paper") themes, a top navigation bar on desktop and a bottom tab bar on phones, and a web app manifest so it can be added to your home screen.
- Accessible by design: keyboard-friendly dialogs with focus management, labelled controls, and colour pairs checked against WCAG AA in both themes.
- Catalogue responses are cached locally for a few hours so the app feels instant.
- Plain-language [About](src/pages/About.tsx), [Privacy](src/pages/Privacy.tsx) and [Terms](src/pages/Terms.tsx) pages that say what is stored and who it is shared with.

**For AI assistants**
- An OAuth-protected [MCP server](#mcp-server) lets compatible assistants search titles and manage your list on your behalf.

## Tech stack

| Layer | What it uses |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI primitives with the in-house "Projection Room" design system ([docs/DESIGN.md](docs/DESIGN.md)), React Router, TanStack Query, Zod, Sonner |
| Backend | Supabase: Postgres with RLS, Auth, Edge Functions (Deno) |
| Data | [TMDB](https://www.themoviedb.org/) catalogue, reached through a server-side proxy so the API key never ships to the browser |
| AI access | MCP server built with the open-source `@lovable.dev/mcp-js` SDK, authenticated by Supabase OAuth |
| Quality | Vitest, ESLint, `tsc`, a WCAG contrast check for the colour tokens, GitHub Actions CI |

### How it fits together

<p align="center">
  <img src="docs/assets/architecture.png" alt="Architecture: the React SPA talks to Supabase for auth and row-level-security queries and to the tmdb edge function for catalogue data (which calls the TMDB API); guest data stays in localStorage. AI assistants reach Supabase and TMDB through the OAuth-protected mcp edge function." width="100%">
</p>

Data model (see [`supabase/migrations`](supabase/migrations)): `profiles`, `watchlist_items` (status, rating, watched date, runtime), `episode_progress` and `hidden_items`. Every table has Row Level Security so users can only read and write their own rows.

## Quick start

**Prerequisites:** Node 18.18+ (or [Bun](https://bun.sh)), a free [Supabase](https://supabase.com) project, a free [TMDB API key](https://www.themoviedb.org/settings/api) (the v3 key) and the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
git clone https://github.com/omsingh02/reel.git
cd reel

bun install            # or: npm install
cp .env.example .env   # then fill in your Supabase values
```

Set up the backend once:

```bash
supabase login
supabase link --project-ref <your-project-ref>

supabase db push                                  # tables, RLS policies, constraints
supabase config push                              # auth URLs, email confirmation, MCP OAuth server
supabase secrets set TMDB_API_KEY=<your-tmdb-key> # server-side only, never a VITE_ variable
supabase functions deploy tmdb                    # TMDB proxy
supabase functions deploy delete-account          # lets a signed-in user delete their own account
bun run deploy:mcp                                # MCP server: bundles src/lib/mcp, then deploys it
```

`supabase/config.toml` is the source of truth for the auth settings (site URL, redirect URLs, the OAuth server for the MCP flow, which sends users to `/oauth/consent`). Change `site_url` and `additional_redirect_urls` to your own domain before running `supabase config push`.

Then start the app:

```bash
bun run dev            # or: npm run dev   →  http://localhost:8080
```

Guest mode works as soon as the `tmdb` function is deployed; sign-in, sync and the MCP server need the rest.

### Scripts

| Command | What it does |
| --- | --- |
| `dev` | Start the Vite dev server on port 8080 |
| `build` | Production build to `dist/` (regenerates the sitemap first) |
| `preview` | Serve the production build locally |
| `build:mcp` / `deploy:mcp` | Bundle the MCP server from `src/lib/mcp/` / bundle it and deploy it |
| `typecheck` | Type-check with `tsc` |
| `lint` | Run ESLint |
| `test` / `test:watch` | Run the Vitest suite once / in watch mode |
| `node scripts/check-contrast.mjs` | Check every text/background colour pair in `src/index.css` against WCAG AA, in both themes |

### Deploying

Reel is a static SPA plus three small Supabase edge functions, so it fits the free tiers of [Vercel](https://vercel.com) and [Supabase](https://supabase.com).

1. **Backend:** run the Supabase commands above against your project.
2. **Frontend:** import the repo into Vercel (the Vite preset is detected; [`vercel.json`](vercel.json) adds the SPA rewrite, cache headers and security headers) and set these environment variables for Production and Preview:

   | Variable | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | the project's publishable (anon) key |
   | `VITE_SUPABASE_PROJECT_ID` | `<project-ref>` (the MCP bundle uses it as the OAuth issuer) |
   | `VITE_SITE_URL` | your public origin, e.g. `https://reel.omsingh.me` |

3. **Domain:** add your domain in Vercel and create the DNS record it asks for, then keep `site_url` in `supabase/config.toml` in step with it.
4. **MCP function:** `bun run deploy:mcp` reads `VITE_SUPABASE_PROJECT_ID` (environment or `.env`) at build time, because the project's OAuth issuer is baked into the bundle. Re-run it whenever you change that value or anything in `src/lib/mcp/`.

## MCP server

Reel exposes a [Model Context Protocol](https://modelcontextprotocol.io) server at:

```
https://<your-project-ref>.supabase.co/functions/v1/mcp
```

It uses Supabase's OAuth server, so an assistant sends you to Reel's consent screen (`/oauth/consent`) the first time it connects. `supabase config push` turns the OAuth server on and points it at that route (see `[auth.oauth_server]` in `supabase/config.toml`). Tokens are scoped to you; Row Level Security still applies to every query.

| Tool | What it does |
| --- | --- |
| `search_media` | Search TMDB for movies and TV shows by title |
| `get_watchlist` | List your items, optionally filtered by status |
| `add_to_watchlist` | Add a title by TMDB id (never overwrites an existing item) |
| `update_watchlist_item` | Change status (`watchlist` or `watched`) and/or your 1–10 rating |
| `remove_from_watchlist` | Remove a title |

Example with Claude Code:

```bash
claude mcp add --transport http reel https://<your-project-ref>.supabase.co/functions/v1/mcp
```

Then ask things like *"add Dune: Part Two to my list"* or *"mark Severance as watched and rate it 9"*.

> The deployed function is a self-contained bundle built by [`scripts/build-mcp.mjs`](scripts/build-mcp.mjs) from `src/lib/mcp/` (about 650 KB; Supabase's own bundler turns the SDK's dependency tree into ~26 MB, over the upload limit). `supabase/functions/mcp/index.ts` is a file the SDK's Vite plugin regenerates, and is not what gets deployed. Edit the sources in `src/lib/mcp/`, then run `bun run deploy:mcp`.

## Project structure

```
src/
  components/
    ui/            Design-system primitives on Radix: button, dialog, select, tabs, ...
    reel/          Film-specific pieces: poster, rating scale, details slate, stats, empty-state art
    browse/ title/ library/ account/   Pieces owned by one area of the app
  contexts/        Auth context
  hooks/           Data hooks: watchlist, episode progress, hidden titles, show sync
  integrations/    Generated Supabase client and types
  lib/             TMDB client, date helpers, local stores, episode logic, MCP tools
  pages/           Route components (src/pages/Design.tsx is a dev-only style guide at /design)
supabase/
  functions/       tmdb (catalogue proxy), delete-account, and mcp (MCP server)
  migrations/      SQL schema and RLS policies
scripts/           Sitemap, MCP bundle and colour-contrast tooling
docs/              Design system, brand guide, banner, screenshots
```

The visual language lives in [`docs/DESIGN.md`](docs/DESIGN.md) (tokens, type, components and rules) and [`docs/BRAND.md`](docs/BRAND.md) (logo and assets). Run `bun run dev` and open `/design` to see every token and component in both themes.

A few conventions worth knowing: TMDB dates are plain calendar dates, so always go through `src/lib/dates.ts` instead of `new Date("YYYY-MM-DD")` (which shifts a day west of UTC), and guest and signed-in users share the same hooks, switching storage behind the scenes.

## Contributing

Bug reports, ideas and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and please follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Roadmap ideas

Not promises, just where it could go next: import from Letterboxd and Trakt exports, CSV export (JSON export is in Settings), custom lists, new-episode notifications, genre stats, and a service worker for true offline use.

## License

[MIT](LICENSE) © 2026 omsingh02

## Acknowledgements and attribution

- Movie and TV metadata, images and streaming-availability data come from [TMDB](https://www.themoviedb.org/); availability data is provided by JustWatch via TMDB. **This product uses the TMDB API but is not endorsed or certified by TMDB.**
- UI built on [Radix UI](https://www.radix-ui.com) primitives and [Lucide](https://lucide.dev) icons, with [Sonner](https://sonner.emilkowal.ski) for toasts. Type is set in [Fraunces](https://github.com/undercasetype/Fraunces), [Instrument Sans](https://github.com/Instrument/instrument-sans) and [IBM Plex Mono](https://github.com/IBM/plex), self-hosted via [Fontsource](https://fontsource.org) under the SIL Open Font License.
- Posters and artwork in the screenshots belong to their respective owners.
