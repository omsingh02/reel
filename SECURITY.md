# Security Policy

## Supported versions

Only the latest commit on `main` is supported. Fixes are made there and are not backported.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them privately with GitHub's
[private vulnerability reporting](https://github.com/omsingh02/reel/security/advisories/new).

Include what you found, how to reproduce it, and the impact you think it has. A proof of concept
helps, but is not required.

I will acknowledge your report within **7 days** and keep you updated as I investigate. This is a
best-effort, volunteer-maintained project, so I can't promise fix timelines, but I'll tell you
what I plan to do and credit you in the advisory if you'd like.

## Scope

In scope:

- Authentication and session handling (sign-in, sign-up, password reset)
- Row Level Security (RLS) policies and anything that could expose or change another user's data
  (`watchlist_items`, `hidden_items`, `episode_progress`, `profiles`)
- The `tmdb` and `mcp` Supabase Edge Functions (`supabase/functions/`)
- The OAuth consent flow used by the MCP server (`/oauth/consent`)

Out of scope:

- Findings that need a compromised device or browser extension
- Rate limiting and denial-of-service against third-party services (TMDB, Supabase)
- Content served by third-party embeds or providers
- Missing security headers on static hosting without a demonstrated exploit

## How secrets are handled

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are shipped to every browser **by design**.
  They are public identifiers; the database is protected by RLS, not by hiding these values.
  If you can read or write another user's rows with them, that is a vulnerability — please report it.
- The TMDB API key exists only as an Edge Function secret (`TMDB_API_KEY`) and must never be
  committed or exposed to the client.
