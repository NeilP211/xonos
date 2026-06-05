// Restrained mono + signal-orange ramp for the terminal/brutalist theme. Each
// fallback thumbnail gets a stable, on-brand shade by index (no rainbow).
export const PALETTE = [
  '#ff5c00', // signal orange
  '#2b2b2b', // graphite
  '#cc4a00', // dim orange
  '#3a3a3a', // slate
  '#ff7a33', // light orange
  '#1f1f1f', // near-black
  '#a33b00', // rust
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
