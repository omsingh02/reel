
Goal: keep the MediaDetails panel as a right-side drawer (not full-screen feeling) and eliminate the “some titles overflow/cut off to the right” glitch.

1) Confirm the real overflow source (already identified)
- The issue is content-dependent: some movie/show detail payloads have long text that forces horizontal overflow.
- In `MediaDetails`, the top flex row (`poster + title/meta`) is missing critical shrink constraints (`min-w-0`) on the text column, so long content can push past drawer bounds.
- There are additional no-wrap zones (status/network badges, long production names) that can cause the same behavior on specific entries.

2) Fix drawer layout constraints in `src/components/MediaDetails.tsx`
- Keep the panel as a right drawer, but make width responsive so it feels like a panel in the preview/editor split:
  - Replace hard “almost-full on medium screens” behavior with viewport-aware sizing (responsive width + max width).
- Add hard horizontal clipping on the drawer shell and content viewport to prevent any child from expanding visual width.
- Ensure internal scrolling remains vertical only.

3) Fix content-level overflow in `MediaDetails` (core glitch fix)
- Add `min-w-0` to flex children that hold dynamic text (especially title/meta column).
- Add safe wrapping utilities to long text fields:
  - title/headline
  - production companies / any joined text blocks
- Allow badge rows and metadata clusters to wrap consistently when strings are long (status/networks/genres blocks).

4) Clean up React ref warnings (related stability fix)
- Console shows `Function components cannot be given refs` for `Badge` and `RecommendationCarousel`.
- Update those components to support ref forwarding where needed:
  - `src/components/ui/badge.tsx`: convert to `React.forwardRef` and keep current API.
  - `src/components/RecommendationCarousel.tsx`: either forward ref on root wrapper or ensure no parent path attempts to attach refs to a plain function component.
- This removes noisy runtime warnings and avoids subtle UI edge behavior around composed primitives.

5) Validate across the routes where user sees the issue
- Test matrix:
  - `/`, `/movies`, `/tv`, `/trending`, `/watchlist`
  - Open details for short and very long titles
  - Verify drawer remains right-side panel, no right-edge clipping, no horizontal page scroll
  - Verify recommendations still clickable and deep-navigation still works
  - Confirm console no longer logs the two ref warnings

Implementation scope/files:
- `src/components/MediaDetails.tsx` (primary overflow/layout fixes)
- `src/components/ui/badge.tsx` (ref-forwarding fix)
- `src/components/RecommendationCarousel.tsx` (ref-forwarding/ref-safety fix)
