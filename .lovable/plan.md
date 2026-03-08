

## Complete Material 3 Expressive UI Overhaul

Transform every component from the current enterprise/Linear aesthetic to Material 3 Expressive: larger radii, tonal surfaces, pill-shaped controls, generous spacing, and warmer visual hierarchy.

---

### 1) Color System & CSS Tokens — `src/index.css`

- Increase `--radius` from `0.375rem` to `0.75rem` (M3 uses larger radii globally)
- Add M3 surface-level tokens: `--surface-container`, `--surface-container-high`, `--surface-container-low` for tonal layering
- Add `--on-surface-variant` for secondary text
- Update dark mode values to match M3 dark tonal palette (slightly warmer grays, e.g. `225 10%` instead of `220 16%`)

### 2) Sidebar — `src/components/AppSidebar.tsx`

- **Logo area**: Rounded-full icon instead of rounded square; larger spacing
- **Nav items**: `rounded-full` pill shape with tonal fill on active (`bg-primary/12 text-primary`), icon + label centered vertically with generous `py-2.5 px-4`
- **Section headers**: Remove uppercase tracking; use `text-xs font-medium text-muted-foreground`
- **Overall**: Increase width from `w-56` to `w-60`, use `bg-surface-container-low` tonal background

### 3) Mobile Nav — `src/components/MobileNav.tsx`

- Increase height from `h-14` to `h-16`
- Active indicator: pill-shaped background behind icon (`rounded-full bg-primary/12`) instead of just color change
- Icons slightly larger (`h-5.5 w-5.5`)

### 4) Search Bar — `src/components/SearchBar.tsx`

- `rounded-full` pill shape
- Tonal surface fill (`bg-secondary/60`) instead of bordered input
- Remove visible border; use subtle tonal contrast
- Larger height `h-12` with `pl-12 pr-12`

### 5) Media Type Filter — `src/components/MediaTypeFilter.tsx`

- Container: `rounded-full` pill with `bg-secondary/40`
- Buttons: `rounded-full` with filled tonal active state (`bg-primary text-primary-foreground`)
- Smooth transition on active state

### 6) Sort Select — `src/components/SortSelect.tsx`

- Trigger: `rounded-full` with tonal fill
- Content dropdown: `rounded-2xl` with elevated shadow

### 7) Media Cards — `src/components/MediaCard.tsx`

- **Container**: `rounded-2xl` instead of `rounded-md`, remove border, use `bg-card` with subtle `shadow-sm`
- **Poster**: `rounded-xl` with `overflow-hidden`
- **Badge**: `rounded-full` pill with tonal fill
- **Watchlist button**: `rounded-full` tonal circle
- **Hover**: Subtle scale (`hover:scale-[1.02]`) + shadow elevation instead of border color change
- **Info area**: Increase padding to `p-4`, title to `text-sm font-semibold`

### 8) Watchlist Card — `src/components/WatchlistCard.tsx`

- Container: `rounded-2xl` with tonal surface, remove border
- Badge: `rounded-full` pill
- Remove button: `rounded-full` tonal circle
- Poster thumbnail: `rounded-xl`

### 9) Page Headers (Index, Trending, Movies, TVShows, Watchlist)

- Increase header height from `h-14` to `h-16`
- Remove `border-b`; use subtle tonal surface (`bg-background/80`) with `backdrop-blur-lg`
- Page titles: `text-xl font-semibold`
- Add horizontal padding to `px-5 lg:px-8`

### 10) Empty State — `src/components/EmptyState.tsx`

- Icon container: `rounded-3xl` with larger padding, tonal surface fill
- Title: `text-base font-semibold`
- Description: `text-sm`

### 11) Auth Page — `src/pages/Auth.tsx`

- Card: `rounded-3xl` with no visible border, use `shadow-lg`
- Logo: `rounded-2xl` instead of `rounded-lg`
- Tabs: `rounded-full` pill segmented control
- Inputs: `rounded-xl` with tonal fill
- Submit button: `rounded-full` pill

### 12) Recommendation Carousel — `src/components/RecommendationCarousel.tsx`

- Card posters: `rounded-xl`
- Nav buttons: `rounded-full` tonal circles
- Section header: Remove uppercase, use `text-sm font-medium`

### 13) Share Button — `src/components/ShareButton.tsx`

- Button: `rounded-full`
- Dropdown: `rounded-2xl`

### 14) User Menu — `src/components/UserMenu.tsx`

- Dropdown content: `rounded-2xl`
- Menu items: `rounded-xl`

### 15) Theme Toggle — `src/components/ThemeToggle.tsx`

- Button: `rounded-full` with tonal fill on hover

### 16) Layout — `src/components/Layout.tsx`

- No structural changes needed; M3 styling flows from child components

### 17) Tailwind Config — `tailwind.config.ts`

- Update default `borderRadius.lg` to use new `--radius` value
- Add `3xl: '1.5rem'` radius if not present
- Add surface-container color tokens

---

### Files changed (17 files)

| File | Change scope |
|---|---|
| `src/index.css` | CSS tokens, radius, surface colors |
| `tailwind.config.ts` | New color tokens, radius values |
| `src/components/AppSidebar.tsx` | Pill nav items, tonal surfaces |
| `src/components/MobileNav.tsx` | Pill active indicator, taller bar |
| `src/components/SearchBar.tsx` | Pill shape, tonal fill |
| `src/components/MediaTypeFilter.tsx` | Pill segmented control |
| `src/components/SortSelect.tsx` | Pill trigger, rounded dropdown |
| `src/components/MediaCard.tsx` | Rounded-2xl card, hover scale |
| `src/components/WatchlistCard.tsx` | Rounded-2xl, tonal surface |
| `src/components/EmptyState.tsx` | Larger icon container, rounded-3xl |
| `src/components/RecommendationCarousel.tsx` | Rounded-xl posters, pill nav |
| `src/components/ShareButton.tsx` | Rounded-full button |
| `src/components/UserMenu.tsx` | Rounded-2xl dropdown |
| `src/components/ThemeToggle.tsx` | Rounded-full |
| `src/pages/Auth.tsx` | Rounded-3xl card, pill tabs/buttons |
| `src/pages/Index.tsx` | Header styling updates |
| `src/pages/Trending.tsx` | Header styling updates |
| `src/pages/Movies.tsx` | Header styling updates |
| `src/pages/TVShows.tsx` | Header styling updates |
| `src/pages/Watchlist.tsx` | Header styling updates |

