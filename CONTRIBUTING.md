# Contributing to Reel

Thanks for helping out! This guide covers getting set up and what a good pull request looks like.
Please also read the [Code of Conduct](CODE_OF_CONDUCT.md).

## Development setup

Requirements: Node 18.18+ and either [Bun](https://bun.sh) (what the lockfile is for) or npm.

```bash
git clone https://github.com/omsingh02/reel.git
cd reel

bun install            # or: npm install
cp .env.example .env   # fill in your Supabase project values
bun run dev            # or: npm run dev  -> http://localhost:8080
```

You need your own Supabase project for sign-in, sync, and the edge functions. The app also works
without an account: guests store their list in the browser and it's merged on sign-in. The TMDB
data comes from the `tmdb` edge function, which needs a `TMDB_API_KEY` secret
(`supabase secrets set TMDB_API_KEY=...`). Never put that key in client code.

## Repository layout

| Path | What lives there |
| --- | --- |
| `src/pages/` | Route-level screens (Discover, Movies, Shows, My List, Upcoming, Stats, Hidden, Auth, …) |
| `src/components/` | Feature components; `components/ui/` is shadcn-ui |
| `src/hooks/` | Data hooks (watchlist, episode progress, hidden titles, show sync) |
| `src/lib/` | Pure helpers: TMDB client, dates, show/episode logic, guest storage, MCP tool sources |
| `src/contexts/` | Auth context |
| `supabase/migrations/` | SQL migrations, including RLS policies |
| `supabase/functions/` | Edge functions: `tmdb` (catalogue proxy) and `mcp` (MCP server) |
| `scripts/` | Build-time scripts (sitemap) |

## Workflow

1. Open or find an issue first for anything bigger than a small fix.
2. Branch from `main`: `feat/short-name`, `fix/short-name`, `docs/short-name`, `chore/short-name`.
3. Commit with [Conventional Commits](https://www.conventionalcommits.org): `feat: …`, `fix: …`,
   `docs: …`, `refactor: …`, `test: …`, `chore: …`.
4. Before opening a pull request, run all of these:

   ```bash
   bun run typecheck
   bun run lint        # no new errors, please (a few old ones are known)
   bun run test
   bun run build
   ```

5. Open the PR using the template. Include screenshots for UI changes and keep it focused on one
   thing. CI runs the same checks.

## Code guidelines

- **UI:** shadcn-ui and Tailwind. Reuse components in `src/components/ui/` and the existing design
  tokens rather than adding one-off colors.
- **Imports:** use the `@/…` alias, not long relative paths.
- **Dates:** TMDB dates are calendar dates like `2026-10-12`. Always go through `src/lib/dates.ts`.
  Never call `new Date('YYYY-MM-DD')` — it parses as UTC and shows the wrong day west of UTC.
- **Tests:** put them next to the code as `src/**/*.test.ts` (Vitest). Add tests for new logic in
  `src/lib/`.
- **Copy:** the product is called **Reel**. Don't make claims in the UI the code can't back up.

## Supabase

- **Migrations** live in `supabase/migrations/`. Every table needs Row Level Security and policies;
  the publishable key ships to browsers, so RLS is the security boundary.
- **Edge functions** live in `supabase/functions/` and need redeploying after changes.
- **The MCP server** is written in `src/lib/mcp/`. The bundle at `supabase/functions/mcp/index.ts`
  is **auto-generated** from those sources — edit the sources, not the bundle. If you can't
  regenerate it, mirror your change in both and say so in the PR.

## Reporting security issues

Please don't open a public issue. See [SECURITY.md](SECURITY.md).

## License

By contributing you agree that your contributions are licensed under the project's license — see
[LICENSE](LICENSE).
