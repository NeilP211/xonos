import { useEffect, useRef } from 'react'
import { commas } from '../lib/format'

const SIZE = 1080

function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// Wrap text to a max width, returning the lines drawn (so callers can advance y).
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = (text || '').split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  const shown = lines.slice(0, maxLines)
  if (lines.length > maxLines) shown[maxLines - 1] = `${shown[maxLines - 1].slice(0, -1)}...`
  shown.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight))
  return shown.length
}

// Minimal, pure-canvas share card: no external images so the canvas never taints
// and the PNG download always works. Accent comes from the live theme.
function draw(canvas, { topTrack, topArtist, headline, headlineLabel }) {
  const ctx = canvas.getContext('2d')
  const accent = cssVar('--accent', '#1ed760')
  const pad = 90

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Wordmark + accent square
  ctx.fillStyle = accent
  ctx.fillRect(pad, pad, 34, 34)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 44px "Space Grotesk", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('XONOS', pad + 52, pad + 17)

  // Headline number
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = accent
  ctx.font = '700 200px "JetBrains Mono", monospace'
  ctx.fillText(String(headline), pad, 480)
  ctx.fillStyle = '#9a9a9a'
  ctx.font = '600 32px "JetBrains Mono", monospace'
  ctx.fillText(headlineLabel.toUpperCase(), pad, 540)

  // Top track
  ctx.fillStyle = '#707070'
  ctx.font = '600 28px "JetBrains Mono", monospace'
  ctx.fillText('TOP TRACK', pad, 660)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 56px "Space Grotesk", system-ui, sans-serif'
  const usedLines = wrapText(ctx, topTrack.name, pad, 720, SIZE - pad * 2, 64, 2)
  ctx.fillStyle = '#9a9a9a'
  ctx.font = '400 36px Inter, system-ui, sans-serif'
  ctx.fillText(topTrack.artist, pad, 720 + usedLines * 64 + 8)

  // Top artist
  ctx.fillStyle = '#707070'
  ctx.font = '600 28px "JetBrains Mono", monospace'
  ctx.fillText('TOP ARTIST', pad, 940)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 56px "Space Grotesk", system-ui, sans-serif'
  ctx.fillText(topArtist || '-', pad, 1000)
}

export default function WrappedCard({ top, recent, range }) {
  const canvasRef = useRef(null)

  const tracks = top?.ranges?.[range]?.tracks || []
  const artists = top?.ranges?.[range]?.artists || []
  const plays = recent?.plays || []
  const data = {
    topTrack: tracks[0]
      ? { name: tracks[0].name, artist: (tracks[0].artists || []).join(', ') }
      : { name: 'No data yet', artist: '' },
    topArtist: artists[0]?.name || '',
    headline: commas(plays.length),
    headlineLabel: 'plays logged',
  }

  useEffect(() => {
    if (canvasRef.current) draw(canvasRef.current, data)
  }, [top, recent, range]) // eslint-disable-line react-hooks/exhaustive-deps

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'xonos-card.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div className="card col-6 wrapped">
      <h2>Share Card</h2>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} className="wrapped-canvas" />
      <button className="wrapped-btn" onClick={download}>
        Download PNG
      </button>
    </div>
  )
}
