# Reel brand guide

A short reference so the product, README, social cards and store listings all look like the same thing.

## Name and voice

- **Name:** Reel (always capitalised, never "REEL" or "reel"). The repository is `omsingh02/reel` (it was originally called `wat`, and the live demo still lives at `wat.lovable.app`).
- **Tagline:** *Track what you watch. Never miss what's next.*
- **Description (one line):** A fast, private-first watchlist for movies and TV, with episode progress, viewing stats and an MCP server for your AI assistant.
- **Voice:** plain, quick, a little warm. Say "My List", "Mark watched", "Up next". Avoid hype and avoid claims the app can't back up (for example "most watched": TMDB data measures popularity on TMDB, not viewing).

## Logo

The mark is a bold white **R** in a rounded blue square (corner radius ≈ 29% of the width). Both files are outlined, so they render identically without any font installed.

| Asset | File | Use |
| --- | --- | --- |
| Mark | [`assets/logo.svg`](assets/logo.svg) | App icon, avatars, favicons |
| Wordmark for dark backgrounds | [`assets/logo-wordmark-dark.svg`](assets/logo-wordmark-dark.svg) | Dark UI, banners |
| Wordmark for light backgrounds | [`assets/logo-wordmark-light.svg`](assets/logo-wordmark-light.svg) | Light pages, documents |
| Banner | [`assets/banner.png`](assets/banner.png) | README header (1280×640) |
| Social preview | [`assets/social-preview.png`](assets/social-preview.png) | GitHub "Social preview" image (1280×640) |
| Architecture diagram | [`assets/architecture.png`](assets/architecture.png) | README "How it fits together" (rendered from [`architecture.svg`](assets/architecture.svg)) |

Rules of thumb: keep clear space around the mark equal to a quarter of its width, don't recolour it, don't stretch it, and don't place it on a busy photo without a dark scrim.

App icons live in `public/`: `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (full-bleed, for Android adaptive icons) and `apple-touch-icon.png` (180×180). `public/og-image.jpg` is the 1200×630 link-preview card.

## Colour

The palette is the app's own theme (see `src/index.css`), so what you see in the docs is what ships.

| Role | Light | Dark |
| --- | --- | --- |
| **Reel Blue** (primary) | `#1D64C9` | `#367EE2` |
| Background | `#FAFAFA` | `#121316` |
| Rating amber | `#E7B008` | `#F7C42B` |

Banner and social artwork use the dark palette with a Reel Blue glow.

## Typography

**Inter** (weights 400, 600, 700, 800). Headlines are 800 with slightly tight letter-spacing; body copy is 400. The web app asks for `Inter` and falls back to the system UI font, so install Inter locally if you want pixel-accurate screenshots.

## Screenshots

Captured at 1440×900 (desktop) and 390×844 @2x (mobile), dark theme by default, with a seeded guest list so pages are not empty. Movie and TV artwork and metadata come from TMDB; see the attribution in the README.
