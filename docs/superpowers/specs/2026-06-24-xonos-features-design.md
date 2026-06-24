# Xonos Feature Pack Design (2026-06-24)

Five new features for the Xonos dashboard. Built on the original `xonos` repo first so Neil
can iterate to a version he likes, then propagated to the clones (`xonos-claire`, `xonos-marwa`).

## Constraints / context

- Fully client-side React + Vite SPA on GitHub Pages. No backend. No router.
- Data files in `public/data/`:
  - `top.json`: `{ generated_at, ranges: {short_term, medium_term, long_term: {tracks, artists}}, genres }`
  - `recent.json`: `{ updated_at, plays: [{played_at, name, artists, album, image, uri, duration_ms}] }`
    accumulating play log, currently ~3 weeks deep (started 2026-06-03), grows daily via the 3h cron.
  - `now.json`: `{ updated_at, is_playing, track, played_at }`
- Clones publish their own `data/*.json` at their GH Pages URL. GitHub Pages returns
  `access-control-allow-origin: *`, so cross-site fetch for compare works (verified 2026-06-24).
- All times use the viewer's local timezone (consistent with existing Listening Pulse).

## New shared libs (pure, unit-tested with vitest like the existing suite)

- `src/lib/stats.js` - `playsInRange(plays, start, end)`, `topTrackByPlays(plays)`,
  `monthsWithData(plays)`, `cellPlays(plays, dow, hour)`. Pure functions over the plays log.
- `src/lib/compare.js` - `compareTaste(mine, theirs)` returning `{ overlapPct, sharedArtists, sharedTracks }`
  from two `{tracks, artists}` top-lists.
- `src/lib/compareConfig.js` - THE one per-clone file. Original exports targets `[Claire, Marwa]`;
  each clone's copy exports only `[Neil]`. Enforces the asymmetry: clones compare only with Neil;
  the original picks any clone. Shape: `{ self: 'Neil', targets: [{ id, name, base }] }`.

## Features

### #8 Time scope (month/year picker)
- `TimeScope` control in the header: "All time" + one entry per year/month that the data spans.
  Months with no plays render greyed with `(0)`; affected cards show an empty state for empty scopes.
- Scope state lifts to `App`, passed to the plays-log cards: Recently Played, Listening Pulse,
  Fun Stats, Track of the Week. Cards filter via `playsInRange`.
- Top Tracks / Top Artists keep their existing 4wk/6mo/1yr `RangeToggle` (Spotify precomputes those
  aggregates; they cannot be sliced by month). UI labels make the two controls distinct.
- Note: only ~3 weeks of data exists today, so most months are empty until history accrues.

### #4 Track of the Week
- `TrackOfWeek.jsx` hero card at the top of the grid. Most-played track in the rolling last 7 days
  (by `uri`) from the plays log: large album art, name, artist, play count, Spotify link.
- Always last-7-days, independent of the time scope selector (that is the concept).

### #6 Heatmap drill-down
- Extend `ListeningPulse`: clicking a cell opens a panel listing tracks played in that
  weekday+hour bucket (honors scope), with per-track counts. Close on Esc / click-away.

### #7 Wrapped card (minimal PNG)
- `WrappedCard.jsx` + a "Share" button. Renders a pure-canvas branded card - top track, top artist,
  one headline number - and triggers a PNG download. Pure canvas (no external images) so the canvas
  never taints and the download always works. Uses the site accent color.

### #9 Compare (asymmetric)
- `Compare.jsx` card with a target picker driven by `compareConfig`. On select, fetch the target's
  `top.json` cross-site, compute `compareTaste`, render overlap % + shared artists + shared tracks.
  Graceful "couldn't reach <name>" fallback on fetch failure.

## Testing
- Unit tests for `stats.js` and `compare.js`. Full `npm run build` + `npm test` after.

## Propagation (after Neil approves the live original)
- Copy components + libs + styles to `xonos-claire` and `xonos-marwa`.
- Swap only each clone's `compareConfig` (Neil-only target); keep their accent colors.
- Build + test + push all three.
