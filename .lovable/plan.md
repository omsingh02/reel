
Issue restated from your feedback: the details drawer is still clipping on the right across all routes and all screen sizes; some entries produce wider content that escapes the panel width.

Plan

1) Lock the drawer to a strict, responsive width envelope
- File: `src/components/MediaDetails.tsx`
- Keep right-side drawer behavior, but replace the current width classes with a clamp-style responsive width (mobile-friendly, half-screen feel on desktop).
- Add explicit `box-border`, `max-w-[calc(100vw-...)]`, and `overflow-x-hidden` on the drawer shell so no child can visually push past the right edge.

2) Prevent inner content from defining a wider layout than the drawer
- File: `src/components/MediaDetails.tsx`
- On ScrollArea content wrappers, enforce `w-full min-w-0`.
- Add `min-w-0` to all major flex children (top meta column, TV network row, cast/seasons text blocks).
- Ensure long text always wraps safely (`break-words`, `overflow-wrap:anywhere`-style utility where needed).

3) Make all “2-column” sections responsive to narrow widths
- File: `src/components/MediaDetails.tsx`
- Change fixed `grid-cols-2` blocks to `grid-cols-1 sm:grid-cols-2` for:
  - Budget/Box Office
  - Director/Writers
  - Cast cards (where needed)
- This removes edge cases where one wide child forces horizontal overflow and clips the second card.

4) Harden action/meta rows against overflow
- File: `src/components/MediaDetails.tsx`
- Update action row so the main CTA takes full row on tighter widths (`basis-full sm:flex-1`) and icon actions remain `shrink-0`.
- Ensure TV meta row and badge clusters use wrapping + `min-w-0` consistently.

5) Clean up remaining ref warnings that can destabilize composed UI behavior
- Files: `src/components/MediaGrid.tsx`, `src/components/MediaCard.tsx`
- Convert both memoized components to `forwardRef`-compatible exports (while preserving memoization) to remove “Function components cannot be given refs” warnings shown in console.
- This is secondary to the layout bug but prevents runtime composition issues.

Technical details (implementation specifics)
- Prefer classes like:
  - Drawer shell: `w-[min(92vw,48rem)] sm:w-[min(82vw,48rem)] lg:w-[min(56vw,48rem)] max-w-[calc(100vw-0.5rem)] overflow-x-hidden box-border`
  - Content wrappers: `w-full min-w-0`
  - Text safety: `break-words` + `min-w-0`
  - Responsive grids: `grid-cols-1 sm:grid-cols-2`
- Keep vertical scrolling inside drawer only; no horizontal scrollbar on page or panel.

Validation checklist
- Routes: `/`, `/movies`, `/tv`, `/trending`, `/watchlist`
- Screen sizes: mobile, tablet, desktop
- Data cases: short titles and long metadata entries
- Expected result: drawer stays right-side panel, no right-edge clipping, no horizontal overflow, and no ref warnings in console.
