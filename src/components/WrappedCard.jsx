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

function draw(canvas, data, images) {
  const ctx = canvas.getContext('2d')
  const accent = cssVar('--accent', '#1ed760')
  const pad = 80

  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Header wordmark
  ctx.fillStyle = accent
  ctx.fillRect(pad, pad, 32, 32)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 42px "Space Grotesk", system-ui, sans-serif'
  ctx.textBaseline = 'middle'
  ctx.fillText('XONOS', pad + 50, pad + 16)
  ctx.textBaseline = 'alphabetic'

  // Hero: album art + top track info
  const artSize = 360
  const artX = pad
  const artY = 160
  if (images.album) {
    ctx.drawImage(images.album, artX, artY, artSize, artSize)
  } else {
    fallbackTile(ctx, artX, artY, artSize, artSize, data.topTrack.name, accent)
  }

  const rx = artX + artSize + 44
  const rw = SIZE - rx - pad
  ctx.fillStyle = '#707070'
  ctx.font = '600 26px "JetBrains Mono", monospace'
  ctx.fillText('TOP TRACK', rx, artY + 36)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 52px "Space Grotesk", system-ui, sans-serif'
  const nameLines = wrapText(ctx, data.topTrack.name, rx, artY + 100, rw, 60, 3)
  ctx.fillStyle = '#9a9a9a'
  ctx.font = '400 34px Inter, system-ui, sans-serif'
  ctx.fillText(data.topTrack.artist, rx, artY + 100 + nameLines * 60 + 4)

  // Headline number
  const hy = artY + artSize + 150
  ctx.fillStyle = accent
  ctx.font = '700 180px "JetBrains Mono", monospace'
  ctx.fillText(String(data.headline), pad, hy)
  ctx.fillStyle = '#9a9a9a'
  ctx.font = '600 30px "JetBrains Mono", monospace'
  ctx.fillText(data.headlineLabel.toUpperCase(), pad, hy + 48)

  // Top artist row with circular avatar
  const ar = 70
  const acx = pad + ar
  const acy = 920
  ctx.save()
  ctx.beginPath()
  ctx.arc(acx, acy, ar, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (images.artist) {
    ctx.drawImage(images.artist, acx - ar, acy - ar, ar * 2, ar * 2)
  } else {
    fallbackTile(ctx, acx - ar, acy - ar, ar * 2, ar * 2, data.topArtist, accent)
  }
  ctx.restore()

  const tx = acx + ar + 30
  ctx.fillStyle = '#707070'
  ctx.font = '600 26px "JetBrains Mono", monospace'
  ctx.fillText('TOP ARTIST', tx, acy - 18)
  ctx.fillStyle = '#e8e8e8'
  ctx.font = '700 48px "Space Grotesk", system-ui, sans-serif'
  ctx.fillText(data.topArtist || '-', tx, acy + 30)
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
