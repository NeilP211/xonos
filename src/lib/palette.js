// Restrained mono + Spotify-green ramp for the terminal/brutalist theme. Each
// fallback thumbnail gets a stable, on-brand shade by index (no rainbow).
export const PALETTE = [
  '#1ed760', // spotify green
  '#2b2b2b', // graphite
  '#169c46', // dim green
  '#3a3a3a', // slate
  '#4ae07f', // light green
  '#1f1f1f', // near-black
  '#0f6e30', // dark green
  '#4a4a4a', // ash
]

export function colorFor(index) {
  return PALETTE[((index % PALETTE.length) + PALETTE.length) % PALETTE.length]
}

// Deterministic color from a string key (used for genres so the same genre keeps
// its color across ranges).
export function colorForKey(key) {
  let h = 0
  for (let i = 0; i < (key?.length ?? 0); i++) h = (h * 31 + key.charCodeAt(i)) | 0
  return colorFor(Math.abs(h))
}
