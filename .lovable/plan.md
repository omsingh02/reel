

## Redesign MediaDetails: Material 3 Expressive Centered Modal

### Problem
The right-side drawer persistently clips content at the right edge. The layout model is fundamentally fragile.

### Solution
Replace the right-side drawer with a **centered dialog modal** using Material 3 Expressive design language. This eliminates the clipping issue entirely since a centered modal is constrained by its own box model, not edge-anchored.

### Changes

**1) Rewrite `src/components/MediaDetails.tsx` — Centered Modal + M3 Expressive**

- **Shell**: Replace `fixed inset-y-0 right-0` drawer with a centered overlay modal:
  - Scrim: `fixed inset-0 bg-black/60 backdrop-blur-sm`
  - Modal: `fixed inset-4 sm:inset-8 lg:inset-y-[5vh] lg:inset-x-[15vw] rounded-3xl bg-background overflow-hidden`
  - Internal scroll via `overflow-y-auto` (drop `ScrollArea` dependency)
  - Entry animation: `animate-in fade-in zoom-in-95 duration-200`

- **Hero section**: Full-width backdrop image with large gradient overlay. Poster overlaps the bottom of the hero. Play button is a large M3-style filled tonal pill (`rounded-full px-6 py-3 bg-primary/90`).

- **Close button**: Filled tonal circle (`rounded-full bg-secondary/80 hover:bg-secondary`) in top-right corner.

- **Genres & status**: Pill-shaped chips (`rounded-full`) with soft tonal backgrounds instead of bordered badges.

- **Action buttons**: Rounded-full pill buttons. Watchlist uses filled primary style, Trailer uses filled tonal (secondary). External links use tonal icon circles.

- **Section cards**: Budget/revenue, cast, seasons wrapped in `rounded-2xl bg-secondary/30 p-4` surface containers instead of inline blocks.

- **Typography**: Title bumped to `text-3xl font-bold`, section headers use `text-sm font-medium` (no uppercase tracking), tagline uses a subtle left-border accent.

- **Mobile**: On mobile the modal goes nearly full-screen (`inset-2 rounded-2xl`) with a drag-handle pill indicator at the top.

**2) Update `src/index.css` — Add M3-inspired tokens**

- Add `zoom-in-95` / `zoom-out-95` keyframes if not already provided by tailwindcss-animate.
- No other CSS changes needed; M3 styling is achieved entirely with Tailwind utility classes.

**3) No changes to parent pages** — The props interface (`id`, `mediaType`, `onClose`, `onNavigate`) stays identical.

### Technical summary
- Centered `fixed` modal with `inset-*` constraints → no edge clipping possible
- `overflow-y-auto` on content div → reliable vertical scroll
- `overflow-hidden` on modal shell → no horizontal overflow
- All M3 styling via Tailwind utilities (rounded-full pills, tonal surfaces, large radii)

