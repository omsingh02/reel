# Reel design system: "Projection Room"

Reel is a place to keep track of films and shows. The interface should feel like the thing it is about:
a dark room with the picture lit, or a printed festival programme on warm paper. It is deliberately **not**
a dashboard template: no blue-and-purple gradients, no card-in-card chrome, no pill buttons everywhere.

> Open `/design` in development (`bun run dev`) to see every token and component in both themes.
> `node scripts/check-contrast.mjs` verifies the colour pairs (WCAG AA) whenever tokens change.

## Principles

1. **The artwork is the colour.** Posters and stills carry the colour; the interface stays warm-neutral and quiet.
2. **One signal.** Vermilion (`primary`) marks the one thing to do next, plus focus and selection. Gold (`rating`) is only for scores. Green (`success`) is only for "watched". Red (`destructive`) is only for irreversible actions.
3. **Poster first.** Browsing is a wall of posters with a plain title beneath. Chrome appears on hover, focus, or touch, and never covers the picture.
4. **Credits, not clutter.** Facts are set like film credits: a small mono label above a plain value (`RUNTIME` / `2h 25m`), episode codes in mono (`S01E04`). Numbers that matter are big and serif.
5. **Fast to act.** Everything you do many times (add, mark watched, rate) is one tap from the poster or the row.
6. **Honest states.** Every view has loading, empty and error states, written like a person would say them.

## Colour

Two themes, both warm. Tokens are HSL channel triplets in `src/index.css` (`:root` is light, `.dark` is dark; dark is the default).
Use semantic classes (`bg-card`, `text-muted-foreground`, `border-border`), never raw colours. Opacity modifiers work (`bg-primary/10`).

| Token | Role | Dark | Light |
| --- | --- | --- | --- |
| `background` | page canvas | projection black | programme paper |
| `card` (`surface-1`) | panels, fields | graphite | paper white |
| `surface-2`, `surface-3` | hover/fill, pressed/track | lifted graphite | deeper paper |
| `border`, `border-strong`, `input` | hairlines, controls, field outlines | | |
| `foreground` | text | ivory | ink |
| `muted-foreground` | secondary text (AA on every surface) | | |
| `subtle` | placeholders and decoration only (AA on background and card) | | |
| `primary` / `primary-hover` / `primary-foreground` | signal vermilion: the primary action | bright, ink text | deep, ivory text |
| `primary-text`, `primary-subtle` | signal as text/icon, and as a tinted fill | | |
| `rating` | gold, scores only | | |
| `success`, `warning`, `destructive` (+ `-text`, `-subtle`) | status | | |
| `scrim` | dark overlay for text on artwork | | |

**Never use blue or purple**, raw hex values, or Tailwind palette colours (`bg-blue-500`, `text-gray-600`).
Text on artwork always sits on a `scrim-b` / `scrim-r` gradient.

## Typography

| Family | Class | Used for |
| --- | --- | --- |
| Fraunces (variable, optical size) | `font-display` | page titles (`h1`, `h2` default to it), titles over artwork, big numerals |
| Instrument Sans (variable) | `font-sans` (default) | the interface: buttons, menus, body copy, item titles |
| IBM Plex Mono | `font-mono` / `.label-mono` | labels, runtimes, dates, ratings, episode codes, tags |

Scale: `text-display-lg` (hero) · `text-display` / `text-display-sm` (page title) · `text-2xl`/`text-xl` (section) · `text-base`/`text-[0.9375rem]` (body and item titles) · `text-sm` (UI) · `text-xs` (captions, mono data).
Use `.numeral` on any number that should line up. Keep long text to `max-w-prose`. Titles use `text-balance`.
Fonts are self-hosted (`@fontsource`), loaded in `src/main.tsx`.

## Shape, depth, spacing, motion

- **Radii:** `rounded-poster` (posters), `rounded-md` (controls), `rounded-lg` (cards, menus, panels), `rounded-xl` (dialogs, sheets), `rounded-sm` (tags). `rounded-full` is for avatars and circular icon buttons only. Never `rounded-2xl`/`3xl`.
- **Depth:** hairline borders first. `shadow-panel` for resting cards in light mode, `shadow-float` for anything that floats (menus, dialogs, toasts), `shadow-poster` on poster hover.
- **Layout:** `PageContainer` (max `88rem`, gutters 16/24/40). Vertical rhythm in multiples of 4: sections `py-8`, page header `pt-8 sm:pt-12`. Poster grids: `grid-cols-2 sm:3 md:4 lg:5 xl:6`, `gap-x-4 gap-y-8`.
- **Motion:** 120/180/320 ms (`duration-fast/base/slow`) with `ease-snap`. Motion explains a change (a frame pops when you rate, a check draws); it never decorates. `prefers-reduced-motion` turns it off globally.
- **Film motifs** (use sparingly, one or two per screen): `.sprocket-x` / `.sprocket-y` perforations, `SprocketRule` dividers, `.grain` on hero and brand surfaces, the film-frame logo.

## Components

### Primitives: `src/components/ui`
`Button` (default · secondary · outline · ghost · destructive · link · overlay; sizes xs–lg and icon) ·
`Input`, `Label`, `FormField` (label, hint, inline error, aria wiring) · `Select` · `DropdownMenu` · `Popover` ·
`Dialog`, `Sheet` (Radix: focus trap, scroll lock, Escape) · `Tabs` (underlined) · `Segmented` (2–4 exclusive options) ·
`Tag` (mono label) · `Card` · `Callout` (info/success/warning/destructive) · `Tooltip` · `Skeleton` · `Avatar` · `Slider` · toasts (`sonner`, the only toast system).

### Product components: `src/components/reel`, plus shared pieces in `src/components`
| Component | What it is |
| --- | --- |
| `Poster` | 2:3 poster with hairline edge, shimmer while loading, and a typeset film-edge fallback when there is no image |
| `MediaCard` | poster + plain title + mono year/score. One real button via a stretched link; quick actions (add/remove, hide) on hover, focus and touch; a corner flag shows "in your list" or "watched" |
| `RatingScale` | 1–10 as ten film frames that fill gold. Radio group: click, arrows, Home/End, Backspace to clear. Hover previews. `sm` variant for popovers and rows |
| `SectionHeader` | serif section title with optional subtitle and action |
| `Slate` | production details as a hairline grid, like a clapperboard's info panel |
| `Stat` | one big serif number with a mono label |
| `SprocketRule` | decorative perforation divider |
| `Art`, `EmptyState` | monoline film illustrations and the empty/error layout |
| `PageHeader`, `PageContainer` | the single `h1`, eyebrow, description and actions; shared width and gutters |
| `Logo`, `LogoLockup` | the film-frame "R" mark, theme-aware |
| `TopNav`, `MobileTabBar`, `AccountMenu`, `ThemeToggle`, `ThemeSwitcher`, `SiteFooter`, `Layout` | the app frame |

Feature-specific pieces (episode strip, ticket stub, list row...) live in a folder per feature (`components/title`, `components/library`...) and are built from the above.

## Patterns

- **Page anatomy:** `Layout` → `PageHeader` (eyebrow, title, description, actions) → content in `PageContainer` → `SectionHeader`s. The top bar already holds search, theme and account; pages do not add their own sticky headers.
- **Primary action:** at most one `default` button per view region. Secondary actions are `secondary`/`outline`; toolbars use `outline`/`ghost`.
- **Quick actions on posters** use `overlay` buttons (they sit on artwork), 32px, `aria-label`ed.
- **Forms:** `FormField` for every field; validate inline and keep the toast for outcomes. Buttons say what they do ("Create account", "Update password").
- **Destructive actions** need a `Dialog` with the consequence spelled out, or an Undo toast when reversible. Only the confirm button is `destructive`.
- **Loading:** skeletons shaped like the final content (poster grids, rows); the reel `LoadingSpinner` only for page-level waits.
- **Empty states:** illustration, one clear sentence, then the next step as a button.
- **Toasts:** short, past tense, with an action when it helps ("Removed. Undo").
- **Dates:** always through `src/lib/dates.ts`. Show air dates as `Sat 12 Oct`; data in mono.

## Accessibility

- Text contrast is AA in both themes (`scripts/check-contrast.mjs`). Do not put `subtle` text on `surface-2`/`surface-3`.
- One `h1` per page (`PageHeader`); headings in order. Landmarks: skip link, `header`, `nav` (labelled), `main#main`, `footer`.
- Every control has an accessible name; icon-only buttons need `aria-label`. Keyboard: visible focus ring everywhere (global `:focus-visible`), menus and radio groups follow ARIA keyboard patterns.
- Touch targets are at least 40px (44px preferred) on phones. Hover-only controls are always visible on touch (`[@media(hover:none)]`).
- Colour is never the only signal: watched/in-list flags carry an icon and text for screen readers.
- Respect `prefers-reduced-motion` and `prefers-color-scheme` (theme defaults to dark, with a System option).

## Voice

Plain and warm, a little cinematic, never cute. "Add to list", "Mark watched", "Up next". Say what happened and what to do:
"Couldn't load this title. Check your connection and try again." Avoid "Oops", exclamation marks, and claims the data cannot back up.

## Changing the system

1. Edit tokens in `src/index.css` / `tailwind.config.ts`, then run `node scripts/check-contrast.mjs`.
2. Add or change a component in `ui/` or `reel/`, and show it on `src/pages/Design.tsx`.
3. Check `/design` and a real page in both themes at 390, 768 and 1440 px.
4. Update this document.
