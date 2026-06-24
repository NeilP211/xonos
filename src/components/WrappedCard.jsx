import { useEffect, useRef, useState } from 'react'
import { commas } from '../lib/format'

const SIZE = 1080

function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

// Load an image for canvas use. crossOrigin='anonymous' keeps the canvas
// untainted (Spotify's CDN sends Access-Control-Allow-Origin: *). On any
// failure we resolve null and the card simply draws a fallback tile.
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

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

function fallbackTile(ctx, x, y, w, h, label, accent) {
  ctx.fillStyle = accent
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#000'
  ctx.font = `700 ${Math.round(h * 0.4)}px "Space Grotesk", system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText((label || '?').slice(0, 2).toUpperCase(), x + w / 2, y + h / 2)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
}

function circleImage(ctx, img, cx, cy, r, label, accent) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (img) {
    ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2)
  } else {
    fallbackTile(ctx, cx - r, cy - r, r * 2, r * 2, label, accent)
  }
  ctx.restore()
}

// Centered composition that fills the square: wordmark, large album hero,
// track title, then a two-up stat footer (plays + top artist). No dead space.
function draw(canvas, data, images) {
  const ctx = canvas.getContext('2d')
  const accent = cssVar('--accent', '#1ed760')
  const cx = SIZE / 2

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Centered wordmark (accent square + XONOS)
  ctx.font = '700 42px "Space Grotesk", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  const markW = 32 + 18 + ctx.measureText('XONOS').width
  const markX = cx - markW / 2
  ctx.fillStyle = accent
  ctx.fillRect(markX, 78, 32, 32)
  ctx.fillStyle = '#e8e8e8'
  ctx.textAlign = 'left'
  ctx.fillText('XONOS', markX + 50, 95)
  ctx.textBaseline = 'alphabetic'

  // Album hero, centered
  const art = 440
  const artX = cx - art / 2
  const artY = 160
  if (images.album) ctx.drawImage(images.album, artX, artY, art, art)
  else fallbackTile(ctx, artX, artY, art, art, data.topTrack.name, accent)

  // Track title block, centered
  ctx.textAlign = 'center'
  ctx.fillStyle = '#707070'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillText('TOP TRACK', cx, artY + art + 56)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 52px "Space Grotesk", system-ui, sans-serif'
  const lines = wrapText(ctx, data.topTrack.name, cx, artY + art + 118, SIZE - 160, 58, 2)
  ctx.fillStyle = '#9a9a9a'
  ctx.font = '400 32px Inter, system-ui, sans-serif'
  ctx.fillText(data.topTrack.artist, cx, artY + art + 118 + lines * 58 + 2)

  // Two-up stat footer
  const footY = 980
  const xPlays = cx - 220
  const xArtist = cx + 220

  // Plays stat
  ctx.fillStyle = accent
  ctx.font = '700 92px "JetBrains Mono", monospace'
  ctx.fillText(String(data.headline), xPlays, footY)
  ctx.fillStyle = '#707070'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillText(data.headlineLabel.toUpperCase(), xPlays, footY + 34)

  // Top artist stat (avatar + name)
  circleImage(ctx, images.artist, xArtist, footY - 96, 46, data.topArtist, accent)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 38px "Space Grotesk", system-ui, sans-serif'
  ctx.fillText(data.topArtist || '-', xArtist, footY - 4)
  ctx.fillStyle = '#707070'
  ctx.font = '600 22px "JetBrains Mono", monospace'
  ctx.fillText('TOP ARTIST', xArtist, footY + 34)

  ctx.textAlign = 'left'
}

export default function WrappedCard({ top, recent, range }) {
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)

  const tracks = top?.ranges?.[range]?.tracks || []
  const artists = top?.ranges?.[range]?.artists || []
  const plays = recent?.plays || []
  const topTrack = tracks[0]
  const topArtist = artists[0]

  const data = {
    topTrack: topTrack
      ? { name: topTrack.name, artist: (topTrack.artists || []).join(', ') }
      : { name: 'No data yet', artist: '' },
    topArtist: topArtist?.name || '',
    headline: commas(plays.length),
    headlineLabel: 'plays logged',
  }

  useEffect(() => {
    let alive = true
    setReady(false)
    Promise.all([loadImage(topTrack?.image), loadImage(topArtist?.image)]).then(([album, artist]) => {
      if (!alive || !canvasRef.current) return
      draw(canvasRef.current, data, { album, artist })
      setReady(true)
    })
    return () => {
      alive = false
    }
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
      <button className="wrapped-btn" onClick={download} disabled={!ready}>
        Download PNG
      </button>
    </div>
  )
}
