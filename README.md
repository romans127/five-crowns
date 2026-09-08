# Family Game Night

A mobile-first React PWA for keeping score at the table. Pick a game, play in its theme, and keep history plus leaderboards for each one.

Live: https://family-game-night-hazel.vercel.app

(`family-game-night.vercel.app` is already taken by another app, so this project ships on the `family-game-night` Vercel project at the hazel production URL.)

## Games

- **Five Crowns** — eleven hands, climbing wilds, leftover-card scoring
- **Phase 10** — ten phases in order, leftover points, first to finish Phase 10
- **Yahtzee** — thirteen boxes, 63-for-35 upper bonus, highest grand total
- **UNO** — leftover cards, first to 500
- **Cribbage** — pegging, crib, and the show; race to 121
- **Hearts** — hearts and the Queen of Spades; lowest wins at 100
- **Gin Rummy** — knock or gin, leftover deadwood, first to 100
- **Farkle** — bank scoring dice or bust; first to 10,000
- **Qwixx** — colored rows and penalty marks; highest pad wins
- **Monopoly Deal** — complete property sets; first to 3 (not the Monopoly board)
- **Sorry!** — four pawns racing Home; first to get all 4 in
- **Ticket to Ride** — routes + destination tickets + longest-route bonus
- **Sequence** — sequences of five; 2 for 3–6 players, 1 for teams/2p

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

Cloud rows are keyed by `household_id`. That value is the **Family table** pin stored in `localStorage` (`game-night:household`). Open **Family table** from the Game Night picker to copy, create, or join a table.

- New phones get a 6-character share code (for example `K7M3PQ`) that you can text.
- Phones that already have a UUID household keep that ID so existing `game_night_records` stay attached — copy the full ID to join from another device.
- Switching tables changes which cloud history and leaderboards you sync. Past games saved in this browser stay on this device; local history is not keyed by table.

## iOS 27 theme

Chrome (lists, sheets, buttons, search, segmented controls) uses [`@ios27_design_system/react`](https://www.npmjs.com/package/@ios27_design_system/react) plus [`@ios27_design_system/tokens`](https://www.npmjs.com/package/@ios27_design_system/tokens) — Liquid Glass materials, darkened edges, and specular rims from the iOS 27 kit. Each game sets accents on `data-game-theme` so they do not collide with the library’s `data-theme="dark"`. Playing cards, score pads, and picker tile marks stay custom.

## PWA

The production build registers a service worker, ships a web app manifest, and precaches the app shell so Game Night still works after you install it or lose signal.
