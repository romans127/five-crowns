# Family Game Night

A mobile-first React PWA for keeping score at the table. Pick a game, play in its theme, and keep history plus leaderboards for each one.

Live: https://family-game-night-hazel.vercel.app

(`family-game-night.vercel.app` is already taken by another app, so this project ships on the `family-game-night` Vercel project at the hazel production URL.)

## Games

- **Five Crowns** — eleven hands, climbing wilds, leftover-card scoring
- **Phase 10** — ten phases in order, leftover points, first to finish Phase 10

## Scripts

```bash
bun install
bun test
bun run dev
bun run build
```

## Supabase

Game Night syncs completed and in-progress tables to Supabase (`game_night_records` on the stats-hub project) so history can live beyond one browser tab.

Copy `.env.example` to `.env` and set:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

A temporary **Import Five Crowns games** button on the landing page copies any older localStorage Five Crowns tables into Game Night.

## iOS 27 theme

Chrome (lists, sheets, buttons, search, segmented controls) uses [`@ios27_design_system/react`](https://www.npmjs.com/package/@ios27_design_system/react) plus [`@ios27_design_system/tokens`](https://www.npmjs.com/package/@ios27_design_system/tokens) — Liquid Glass materials, darkened edges, and specular rims from the iOS 27 kit. Game-specific gold / pink accents sit on `data-game-theme` so they do not collide with the library’s `data-theme="dark"`. Playing cards and score pads stay custom.

## PWA

The production build registers a service worker, ships a web app manifest, and precaches the app shell so Game Night still works after you install it or lose signal.
