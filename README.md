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
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-1D64C9"></a>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white">
  <img alt="React" src="https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white">
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen"></a>
</p>

<p align="center">
  <a href="https://wat.lovable.app"><b>Live demo</b></a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#mcp-server">MCP server</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

## Screenshots

<p align="center">
  <img src="docs/screenshots/discover.webp" alt="Discover page with a featured title and trending rails" width="49%">
  <img src="docs/screenshots/title-details.webp" alt="Title page with rating, watched date and trailer" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/my-list.png" alt="My List with watched titles and ratings" width="49%">
  <img src="docs/screenshots/episode-tracking.png" alt="Per-episode progress for a TV show" width="49%">
</p>
<p align="center">
  <img src="docs/screenshots/stats.png" alt="Viewing stats" width="49%">
  <img src="docs/screenshots/upcoming.png" alt="Upcoming releases and new episodes for your list" width="49%">
</p>

<details>
<summary><b>Mobile and light theme</b></summary>
<br>
<p align="center">
  <img src="docs/screenshots/mobile-discover.webp" alt="Mobile Discover" width="24%">
  <img src="docs/screenshots/mobile-my-list.png" alt="Mobile My List" width="24%">
  <img src="docs/screenshots/mobile-stats.png" alt="Mobile Stats" width="24%">
</p>
<p align="center">
  <img src="docs/screenshots/light-mode.webp" alt="Movies catalogue in the light theme" width="80%">
</p>
</details>

## Features

**Discover**
- Featured title plus trending and popular rails for movies and TV.
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
- Dark and light themes, a responsive layout with a mobile bottom bar, and a web app manifest so it can be added to your home screen.
- Catalogue responses are cached locally for a few hours so the app feels instant.

**For AI assistants**
- An OAuth-protected [MCP server](#mcp-server) lets compatible assistants search titles and manage your list on your behalf.

## Tech stack

| Layer | What it uses |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), React Router, TanStack Query, Zod |
| Backend | Supabase: Postgres with RLS, Auth, Edge Functions (Deno) |
| Data | [TMDB](https://www.themoviedb.org/) catalogue, reached through a server-side proxy so the API key never ships to the browser |
| AI access | MCP server built with `@lovable.dev/mcp-js`, authenticated by Supabase OAuth |
| Quality | Vitest, ESLint, `tsc`, GitHub Actions CI |

### How it fits together

```mermaid
flowchart LR
  subgraph Browser
    SPA["React SPA"]
    LS[("localStorage<br/>guest data")]
  end
  SPA --- LS
  SPA -- "auth + RLS queries" --> SB[("Supabase<br/>Postgres + Auth")]
  SPA -- "catalogue requests" --> TMDBFN["Edge Function: tmdb"]
  TMDBFN --> TMDB[("TMDB API")]
  AI["AI assistant<br/>(MCP client)"] -- "OAuth + MCP" --> MCPFN["Edge Function: mcp"]
  MCPFN --> SB
  MCPFN --> TMDB
```

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

supabase db push                                  # tables, RLS policies, triggers
supabase secrets set TMDB_API_KEY=<your-tmdb-key> # server-side only, never a VITE_ variable
supabase functions deploy tmdb                    # TMDB proxy (public, config in supabase/config.toml)
supabase functions deploy mcp --no-verify-jwt     # MCP server: it validates OAuth tokens itself
```

In the Supabase dashboard, add `http://localhost:8080/**` (and your production URL) to **Authentication → URL Configuration → Redirect URLs** so email verification and password-reset links work.

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
| `typecheck` | Type-check with `tsc` |
| `lint` | Run ESLint |
| `test` / `test:watch` | Run the Vitest suite once / in watch mode |

### Deploying

Reel is a static SPA plus two Supabase functions. Build with `npm run build`, host `dist/` anywhere that can serve a single-page app (every route must fall back to `index.html`), and set the three `VITE_SUPABASE_*` variables at build time. The live demo runs on [Lovable](https://lovable.dev).

## MCP server

Reel exposes a [Model Context Protocol](https://modelcontextprotocol.io) server at:

```
https://<your-project-ref>.supabase.co/functions/v1/mcp
```

It uses Supabase's OAuth server, so an assistant sends you to Reel's consent screen (`/.lovable/oauth/consent`) the first time it connects. Enable the OAuth server in **Authentication** and point its authorization path at that route. Tokens are scoped to you; Row Level Security still applies to every query.

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

> `supabase/functions/mcp/index.ts` is generated from `src/lib/mcp/`. Edit the sources, not the bundle, and refresh the snapshot in `.lovable/mcp/manifest.json` with `npx lovable-mcp-extract-manifest`.

## Project structure

```
src/
  components/      UI building blocks (shadcn/ui primitives live in components/ui)
  contexts/        Auth context
  hooks/           Data hooks: watchlist, episode progress, hidden titles, show sync
  integrations/    Generated Supabase client and types
  lib/             TMDB client, date helpers, local stores, episode logic, MCP tools
  pages/           Route components
supabase/
  functions/       tmdb (catalogue proxy) and mcp (generated MCP server)
  migrations/      SQL schema and RLS policies
docs/              Brand guide, banner, screenshots
```

A few conventions worth knowing: TMDB dates are plain calendar dates, so always go through `src/lib/dates.ts` instead of `new Date("YYYY-MM-DD")` (which shifts a day west of UTC), and guest and signed-in users share the same hooks, switching storage behind the scenes.

## Contributing

Bug reports, ideas and pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, and please follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Roadmap ideas

Not promises, just where it could go next: import from Letterboxd and Trakt exports, export to CSV/JSON, custom lists, new-episode notifications, genre stats, and a service worker for true offline use.

## License

[MIT](LICENSE) © 2026 omsingh02

## Acknowledgements and attribution

- Movie and TV metadata, images and streaming-availability data come from [TMDB](https://www.themoviedb.org/); availability data is provided by JustWatch via TMDB. **This product uses the TMDB API but is not endorsed or certified by TMDB.**
- UI built with [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com), [Lucide](https://lucide.dev) icons and the [Inter](https://rsms.me/inter/) typeface.
- Posters and artwork in the screenshots belong to their respective owners.
