

## Mobile UI Optimization

After inspecting the app at 390px, here are the issues and fixes:

### Issues Found

1. **Header controls cramped** -- Search bar, sort select, and media type filter all compete for space in a 390px-wide h-16 header. The search bar gets squished.
2. **Search bar too tall** -- `h-12` is oversized for mobile header. Should be `h-10`.
3. **MediaCard watchlist button invisible on mobile** -- `opacity-0 group-hover:opacity-100` doesn't work on touch devices. No hover state means users can't add to watchlist from cards.
4. **Media details modal `inset-2` wastes no space but title/meta area is cramped** -- The poster + title layout at `-mt-20` with `pt-20 sm:pt-24` on the title column creates an odd gap on small screens.
5. **Bottom nav overlaps content** -- `pb-16` on main is correct, but the media details modal doesn't account for it, so bottom content can be hidden behind the nav.
6. **WatchlistCard remove button invisible on mobile** -- Same `opacity-0 group-hover:opacity-100` touch problem. Users can't remove items.
7. **MediaTypeFilter text takes too much space** -- "Movies" and "TV Shows" labels with icons eat header space. On mobile, icons-only would be better.
8. **SortSelect overlaps on mobile** -- The sort dropdown in the content area (sm:hidden) is fine, but its label "Popularity" is wide.

### Plan

**1) MediaCard -- always show watchlist button on mobile** (`src/components/MediaCard.tsx`)
- Change opacity class to `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` so the button is always visible on touch devices

**2) WatchlistCard -- always show remove button on mobile** (`src/components/WatchlistCard.tsx`)
- Same touch-friendly fix: `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`

**3) Header layout -- stack search and controls better** (`src/pages/Index.tsx`)
- Reduce search bar height to `h-10` on mobile
- Reduce header horizontal padding to `px-3` on mobile (`px-3 sm:px-5 lg:px-8`)

**4) SearchBar -- smaller on mobile** (`src/components/SearchBar.tsx`)
- `h-10 sm:h-12` for the input
- Reduce left padding for icon: `pl-10 sm:pl-12`

**5) MediaTypeFilter -- compact on mobile** (`src/components/MediaTypeFilter.tsx`)
- Hide text labels below `sm`, show only icons
- Use `<span className="hidden sm:inline">` for label text

**6) MediaDetails modal -- better mobile layout** (`src/components/MediaDetails.tsx`)
- Use `inset-0 sm:inset-2` so it's truly full-screen on mobile (no rounded corners wasted)
- Reduce poster width on mobile: `w-24 sm:w-28`
- Add `pb-20 sm:pb-8` to bottom of scrollable content so it clears the bottom nav
- Reduce hero height on mobile: `h-44 sm:h-56 lg:h-72`
- Title text: `text-xl sm:text-2xl lg:text-3xl`

**7) Content padding consistency** (all page files)
- Standardize to `px-3 sm:px-5 lg:px-8` for tighter mobile padding

**8) MobileNav -- ensure safe area** (`src/components/MobileNav.tsx`)
- Add `pb-safe` / `padding-bottom: env(safe-area-inset-bottom)` for notched phones

**9) MediaGrid -- tighter gap on mobile** (`src/components/MediaGrid.tsx`)
- `gap-2 sm:gap-4` for tighter card spacing on small screens

### Files changed (10 files)

| File | Change |
|---|---|
| `src/components/MediaCard.tsx` | Always-visible watchlist button on touch |
| `src/components/WatchlistCard.tsx` | Always-visible remove button on touch |
| `src/components/SearchBar.tsx` | Smaller height on mobile |
| `src/components/MediaTypeFilter.tsx` | Icons-only on mobile |
| `src/components/MediaDetails.tsx` | Full-screen modal, smaller poster, safe padding |
| `src/components/MediaGrid.tsx` | Tighter gap on mobile |
| `src/components/MobileNav.tsx` | Safe area bottom padding |
| `src/pages/Index.tsx` | Tighter mobile padding |
| `src/pages/Movies.tsx` | Tighter mobile padding |
| `src/pages/TVShows.tsx` | Tighter mobile padding |
| `src/pages/Trending.tsx` | Tighter mobile padding |
| `src/pages/Watchlist.tsx` | Tighter mobile padding |

