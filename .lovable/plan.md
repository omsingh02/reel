

## Mobile & UX Polish Pass

After thorough inspection at both 390px and 1280px viewports, here are the remaining issues preventing a seamless experience:

### Issues Found

1. **Page title says "Lovable App"** -- Generic placeholder in `index.html`. Should be "Watchlist" to match branding.

2. **Carousel navigation arrows invisible on touch** -- `RecommendationCarousel` uses `opacity-0 group-hover:opacity-100` on prev/next buttons. Touch devices have no hover, so users can't scroll carousels except by dragging.

3. **Auth page has no navigation on mobile** -- `/auth` doesn't use `Layout`, so there's no bottom nav or back button. Users are stranded unless they use browser back.

4. **Vite missing React dedupe** -- No `resolve.dedupe` configured, which can cause subtle context-sharing bugs with certain library combinations.

5. **MediaDetails modal not swipe-dismissible on mobile** -- The drag handle is visual-only. No gesture to close. Users must find and tap the small X button on the hero image.

6. **Recommendation/Similar carousel items too small on mobile** -- Fixed `w-28` cards are cramped at 390px. Should be slightly wider.

7. **Video player not mobile-friendly** -- Controls overlay uses hover to show. On mobile, tapping toggles play but controls never appear unless you move the mouse (which doesn't exist on touch).

8. **Auth page doesn't fill mobile screen properly** -- `min-h-screen flex items-center` with a card causes the card to float in the middle with no way back.

---

### Plan

**1) Fix page title and meta** -- `index.html`
- Change `<title>` to "Watchlist"
- Update og:title to match

**2) Carousel arrows always visible on mobile** -- `src/components/RecommendationCarousel.tsx`
- Change arrow buttons to `opacity-100 sm:opacity-0 sm:group-hover:opacity-100`

**3) Auth page mobile navigation** -- `src/pages/Auth.tsx`
- Add a back button (arrow-left) at the top that navigates to `/`
- Or wrap in `Layout` so the bottom nav is available

**4) Vite React dedupe** -- `vite.config.ts`
- Add `resolve.dedupe: ["react", "react-dom"]`

**5) Video player touch support** -- `src/components/VideoPlayer.tsx`
- Show controls on tap (not just mousemove)
- Add `onTouchStart` handler to trigger controls visibility

**6) Carousel card width responsive** -- `src/components/RecommendationCarousel.tsx`
- Change `w-28` to `w-32 sm:w-28` (slightly wider on mobile for better tap targets)

**7) MediaDetails close button more prominent on mobile** -- `src/components/MediaDetails.tsx`
- Move close button outside the hero image area on mobile, or make it larger/more visible
- Add a "swipe down" area at the top or a visible close bar

### Files changed (6 files)

| File | Change |
|---|---|
| `index.html` | Fix title and meta |
| `vite.config.ts` | Add React dedupe |
| `src/components/RecommendationCarousel.tsx` | Touch-friendly carousel arrows |
| `src/pages/Auth.tsx` | Add back navigation for mobile |
| `src/components/VideoPlayer.tsx` | Touch-friendly controls |
| `src/components/MediaDetails.tsx` | More prominent close button on mobile |

