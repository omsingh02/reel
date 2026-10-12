# Reel brand guide

How Reel presents itself outside the app: the repo, social cards, store listings. For the interface itself, see [DESIGN.md](DESIGN.md).

## Name and voice

- **Name:** Reel (capitalised, never "REEL" or "reel"). The repository is `omsingh02/reel` (it was originally called `wat`) and the site lives at `reel.omsingh.me`.
- **Tagline:** *Track what you watch. Never miss what's next.*
- **One line:** A watchlist for movies and TV, with episode progress, viewing stats and an assistant that can manage your list.
- **Voice:** plain, warm, a little cinematic. "Add to list", "Mark watched", "Up next". No hype, no exclamation marks, no claims the data can't back up.

## Idea

Reel is a projection room and a printed festival programme: warm black with ivory text, or warm paper with ink. Colour comes from the posters. One signal colour, vermilion (the red-orange of a ticket stub and a curtain), marks the next action. Film is present as texture, not decoration: sprocket perforations, a frame, grain.

It is not a SaaS template: no blue, no purple, no gradients-on-everything.

## Logo

A film frame with edge perforations and a heavy serif **R**. The R is outlined from Fraunces ExtraBold, so every file renders identically without any font installed.

| Asset | File | Use |
| --- | --- | --- |
| Mark (for dark or neutral backgrounds) | [`assets/logo.svg`](assets/logo.svg) | App icon, avatars, favicons |
| Mark (deep vermilion, for light backgrounds) | [`assets/logo-light.svg`](assets/logo-light.svg) | Light pages and documents |
| Wordmark for dark backgrounds | [`assets/logo-wordmark-dark.svg`](assets/logo-wordmark-dark.svg) | Dark UI, banners |
| Wordmark for light backgrounds | [`assets/logo-wordmark-light.svg`](assets/logo-wordmark-light.svg) | Light pages and documents |
| Banner | [`assets/banner.png`](assets/banner.png) | README header (1280×640) |
| Social preview | [`assets/social-preview.png`](assets/social-preview.png) | GitHub "Social preview" image (1280×640) |
| Architecture diagram | [`assets/architecture.png`](assets/architecture.png) | README "How it fits together" (source: [`architecture.svg`](assets/architecture.svg)) |

App icons live in `public/`: `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (full-bleed R for Android adaptive icons), `apple-touch-icon.png` (180×180) and `og-image.jpg` (1200×630 link preview).

Clear space around the mark equals a quarter of its width. Don't recolour it, stretch it, or put it on busy artwork without a dark scrim.

## Colour

Defined once, in `src/index.css`. The hex values below are what the static assets use.

| Name | Hex | Where |
| --- | --- | --- |
| Signal (dark theme primary) | `#F25B31` | Mark, buttons and links on dark |
| Signal deep (light theme primary) | `#C83814` | Mark and buttons on light |
| Projection black (dark canvas) | `#13100E` | Dark backgrounds, banners |
| Programme paper (light canvas) | `#F7F5F0` | Light backgrounds |
| Ivory (text on dark) | `#F2EEE8` | |
| Ink (text on light) | `#1C1612` | |
| Gold (ratings only) | `#F7C245` | Stars and scores |

## Typography

- **Fraunces** (display serif, optical size axis): titles, the wordmark, large numerals.
- **Instrument Sans**: the interface and body copy.
- **IBM Plex Mono**: film-credit data: labels, runtimes, dates, episode codes.

All three are self-hosted in the app (`@fontsource`); none are loaded from a third party.

## Screenshots

README screenshots use a seeded guest list built from live TMDB data, captured at 1440×900 (desktop) and 390×844 @2x (mobile), dark theme by default. Movie and TV artwork and metadata come from TMDB; see the attribution in the README.
