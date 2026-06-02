# @fromforgesoftware/vue-kit — Vue 3 component + composable library

Built on @fromforgesoftware/ts-kit. Used by the forge console and app plugins.

## Commands
- Install: `npm install --legacy-peer-deps`
- Build: `npm run build` (vite lib + vue-tsc)
- Test: `npm test` (vitest) · Storybook: `npm run storybook`

## Stack
Vue 3.5 · Vite · Tailwind · reka-ui · @tanstack/vue-table · chart.js · ts-kit (peer).

## Gotchas
- Depends on @fromforgesoftware/ts-kit (peer). CI checks out ts-kit as a SIBLING
  (`../ts-kit`), builds it first; the tsconfig/vite aliases resolve there. Locally,
  keep ts-kit checked out alongside this repo (or `npm link`).
- Chart-illustration SVGs live in `src/assets/chart-illustrations` (folded in from
  the old monorepo `libs/shared`).
- Icons: `@lucide/vue` (NOT lucide-vue-next).

## Conventions / Boundaries
- One-line conventional commits, ≤72 chars, no body/footer.
- NEVER edit `dist/`. NEVER commit secrets. Don't add dependabot.
