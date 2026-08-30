# Five Crowns Scorekeeper

A mobile-first React PWA for keeping score at a live Five Crowns table.

- Tap leftover cards instead of doing mental math
- Eleven-hand track with the rotating wild on every screen
- Official-style rules lookup
- Installable, offline-capable, and safe-area aware for phones

## Scripts

```bash
bun install
bun test
bun run dev
bun run build
```

## Play

Open the app, deal a new game with 2–8 names, then tap a player as they count leftovers. Current wilds are 20, jokers are 50, and going out is a one-tap zero. After Kings go wild, lowest total wears the crown.

## PWA

The production build registers a service worker, ships a web app manifest, and precaches the app shell so the scorekeeper still works after you install it or lose signal.
