# SwanSite

A public, always-updating Spotify stats dashboard. It shows my listening: top
tracks, artists, and genres across 4 weeks / 6 months / 1 year, a listening-pulse
heatmap built from a recently-played log that grows over time, and an All-Time
tier that unlocks from my downloaded streaming history.

Only I authenticate (once). Friends just open the page and view the data. No
visitor logs in, and no secrets ever reach the browser.

Live: https://neilp211.github.io/swansite/

## How it works

- A scheduled GitHub Action refreshes a 1-hour Spotify access token from a stored
  refresh token, fetches the data, and writes JSON into `public/data/`.
- The static React site (Vite + Recharts) reads those JSON files. The Action also
  commits the data, so the recently-played log accumulates real history that the
  API alone will not return.
- True all-time stats come from the Spotify data export, processed offline into
  aggregate-only JSON (no raw rows, IPs, or account info are published).

## Local development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm test         # unit tests for genre weighting and export aggregation
```

The site ships with placeholder sample data so it renders before any credentials
are wired up. A banner makes clear when sample data is showing.

## One-time setup (the parts only the owner can do)

1. Create a Spotify app at https://developer.spotify.com/dashboard
   - Copy the Client ID and Client Secret.
   - Add the redirect URI: `http://127.0.0.1:8888/callback`
   - Under "Users and Access", add your own Spotify account (development mode).
     Development mode in 2026 requires the app owner to have Spotify Premium.

2. Get a refresh token locally:
   ```bash
   # create a .env file (gitignored) with:
   #   SPOTIFY_CLIENT_ID=...
   #   SPOTIFY_CLIENT_SECRET=...
   npm run auth
   ```
   Authorize in the browser, then copy the refresh token it prints.

3. Add three repository secrets (Settings > Secrets and variables > Actions, or
   the commands below):
   ```bash
   gh secret set SPOTIFY_CLIENT_ID
   gh secret set SPOTIFY_CLIENT_SECRET
   gh secret set SPOTIFY_REFRESH_TOKEN
   ```

4. Enable GitHub Pages: Settings > Pages > Build and deployment > Source:
   "GitHub Actions".

5. Trigger a run: Actions > update > Run workflow (or wait for the schedule). The
   first authenticated run replaces the sample data with your real listening.

## Unlock All-Time stats

The Spotify API only goes back about a year. For true lifetime stats:

1. Request your "Extended streaming history" from your Spotify Account Privacy
   page (it can take a few days to arrive).
2. Unzip the download.
3. Build the summary and publish:
   ```bash
   npm run ingest -- /path/to/unzipped/export
   git add public/data/alltime.json && git commit -m "all-time history" && git push
   ```

## Notes and limitations

- "All Time" from the live API is really the past ~1 year; the export tier is the
  true lifetime view.
- Spotify deprecated audio-features/recommendations for new apps, so there are no
  mood or "danceability" stats here, by design.
- "Now playing" is best-effort. On a cron-driven static site it usually shows the
  last played track ("last spun").
- Reading data does not require Premium, but 2026 development mode does require the
  app owner to hold Premium and caps the app at 5 authorized users (only the owner
  needs access here).
