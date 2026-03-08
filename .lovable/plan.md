

## Fix: Complete UI Quality Pass

After reviewing all components, I've identified several root causes making the UI look bad:

### Issues Found

1. **No web font loaded** -- Inter font is specified in Tailwind config but never loaded. The browser falls back to system fonts, making everything look generic.

2. **Near-zero contrast between surfaces** -- In light mode: background `98%`, card `100%`, surface-container-low `97%`. In dark mode: background `8%`, card `11%`, surface-container `14%`. These differences are barely perceptible, making cards and sections blend into the background.

3. **Overly muted color palette** -- Primary blue `hsl(215 75% 45%)` is decent, but secondary/muted/surface colors are all clustered in the same narrow gray band. No visual hierarchy.

4. **Cards lack depth** -- `shadow-sm` is nearly invisible. Combined with low surface contrast, cards appear flat and indistinguishable from the background.

5. **`App.css` leftover** -- Contains Vite boilerplate (`#root { max-width: 1280px; padding: 2rem; text-align: center }`). While not imported, it's dead code that should be cleaned up.

6. **Missing hover/interaction feedback** -- Many interactive elements only change text color on hover. No background shift or elevation change gives the app a static, unresponsive feel.

7. **Sidebar indistinguishable from content** -- Same effective background color as main content area.

---

### Plan

**1) Load Inter + JetBrains Mono fonts -- `index.html`**
- Add Google Fonts `<link>` for Inter (400, 500, 600, 700) and JetBrains Mono

**2) Rework color tokens for proper contrast -- `src/index.css`**

Light mode adjustments:
- `--background`: keep `0 0% 98%`
- `--card`: `0 0% 100%` (keep, but cards will get shadows)
- `--secondary`: darken to `220 14% 91%` (from 94%) for visible chip/pill backgrounds
- `--surface-container-low`: `220 14% 95%` (sidebar clearly distinct)
- `--surface-container`: `220 14% 92%`
- `--surface-container-high`: `220 14% 88%`
- `--border`: lighten to `220 13% 88%` for more visible borders

Dark mode adjustments:
- `--card`: `225 10% 13%` (from 11%) for more visible card lift
- `--secondary`: `225 10% 18%` (from 16%) for clearer chips/buttons
- `--surface-container-low`: `225 10% 11%` (sidebar distinct from `8%` background)
- `--surface-container`: `225 10% 15%`
- `--surface-container-high`: `225 10% 20%`
- `--muted-foreground`: bump to `220 9% 60%` (from 56%) for better readability

**3) Improve card depth and hover states -- `src/components/MediaCard.tsx`**
- Increase shadow to `shadow-md` default, `hover:shadow-lg` on hover
- Add `border border-border/50` for subtle edge definition in light mode
- Keep `hover:scale-[1.02]`

**4) Improve sidebar distinction -- `src/components/AppSidebar.tsx`**
- Add a subtle right border that's actually visible
- Active nav items get a slightly stronger tonal fill

**5) Improve header bar -- all page files**
- Add a thin `border-b border-border/50` back to sticky headers so they're visually separated from scrolling content

**6) Improve WatchlistCard contrast -- `src/components/WatchlistCard.tsx`**
- Use `bg-card` with `border border-border/40` instead of `bg-surface-container` for clearer item separation

**7) Delete `src/App.css`** -- dead Vite boilerplate

**8) Improve SearchBar contrast -- `src/components/SearchBar.tsx`**
- Use `bg-secondary` (now darker) instead of `bg-secondary/60` so the search field is clearly visible

**9) Improve MediaDetails modal contrast -- `src/components/MediaDetails.tsx`**
- Surface cards (`bg-secondary/30`) bump to `bg-secondary/50` for visibility
- Cast and season cards get subtle borders

---

### Files changed (11 files)

| File | Change |
|---|---|
| `index.html` | Add Google Fonts link |
| `src/index.css` | Rework color token values for contrast |
| `src/App.css` | Delete file |
| `src/components/MediaCard.tsx` | Better shadows and border |
| `src/components/AppSidebar.tsx` | Stronger sidebar distinction |
| `src/components/WatchlistCard.tsx` | Better card contrast |
| `src/components/SearchBar.tsx` | Stronger input background |
| `src/components/MediaDetails.tsx` | Better surface card contrast |
| `src/pages/Index.tsx` | Header border |
| `src/pages/Trending.tsx` | Header border |
| `src/pages/Movies.tsx` | Header border |
| `src/pages/TVShows.tsx` | Header border |
| `src/pages/Watchlist.tsx` | Header border |

