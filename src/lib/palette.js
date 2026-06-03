// Vivid categorical palette for the dark data-viz theme. Each genre/artist/series
// gets a stable color by index.
export const PALETTE = [
  '#22d3ee', // cyan
  '#a78bfa', // violet
  '#f472b6', // pink
  '#34d399', // emerald
  '#fbbf24', // amber
  '#fb7185', // rose
  '#60a5fa', // blue
  '#c084fc', // purple
  '#4ade80', // green
  '#f59e0b', // orange
  '#2dd4bf', // teal
  '#e879f9', // fuchsia
  '#818cf8', // indigo
  '#facc15', // yellow
  '#fca5a5', // light red
  '#5eead4', // light teal
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
