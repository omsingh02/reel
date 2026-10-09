## Summary

<!-- What does this change and why? Link the issue it closes: "Closes #123". -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Docs
- [ ] CI / tooling

## Checklist

- [ ] `tsc -p tsconfig.app.json --noEmit` passes
- [ ] `eslint .` shows no new errors
- [ ] `vitest run` passes, with tests added or updated for new logic
- [ ] `vite build` succeeds
- [ ] UI changes include screenshots (light and dark if relevant)
- [ ] Dates use `src/lib/dates.ts`, never `new Date('YYYY-MM-DD')`

## Backend notes

<!-- Delete if not applicable. -->

- [ ] Database change: migration added under `supabase/migrations/` with RLS policies
- [ ] Edge function change (`tmdb` or `mcp`): needs redeploying, noted here
- [ ] MCP tools changed in `src/lib/mcp/` (the generated bundle in `supabase/functions/mcp/` is updated too)
