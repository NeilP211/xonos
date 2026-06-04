import { useEffect, useState } from 'react'
import { loadJSON } from './lib/data'
import { timeAgo } from './lib/format'
import RangeToggle from './components/RangeToggle'
import NowChip from './components/NowChip'
import TopTracks from './components/TopTracks'
import TopArtists from './components/TopArtists'
import TopAlbums from './components/TopAlbums'
import ListeningPulse from './components/ListeningPulse'
import RecentlyPlayed from './components/RecentlyPlayed'
import FunStats from './components/FunStats'

export default function App() {
  const [top, setTop] = useState(null)
  const [recent, setRecent] = useState(null)
  const [now, setNow] = useState(null)
  const [range, setRange] = useState('short_term')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    Promise.all([loadJSON('top.json'), loadJSON('recent.json'), loadJSON('now.json')]).then(([t, r, n]) => {
      if (!alive) return
      setTop(t)
      setRecent(r)
      setNow(n)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading SwanSite...</div>
      </div>
    )
  }

  const isSample = !!top?._note
  const rangeData = top?.ranges?.[range]

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="dot" />
          SwanSite
        </div>
        <RangeToggle value={range} onChange={setRange} />
        <div className="spacer" />
        <NowChip now={now} />
        {top?.generated_at && <div className="updated">updated {timeAgo(top.generated_at)}</div>}
      </header>

      {isSample && (
        <div className="sample-banner">
          Showing placeholder sample data. Wire up your Spotify credentials (see README) and the first
          fetch replaces this with your real listening.
        </div>
      )}

      <div className="grid">
        <TopTracks tracks={rangeData?.tracks} />
        <TopArtists artists={rangeData?.artists} />
        <TopAlbums albums={top?.albums?.[range]} />
        <ListeningPulse recent={recent} />
        <RecentlyPlayed recent={recent} />
        <FunStats top={top} range={range} recent={recent} />
      </div>

      <div className="footnote">
        SwanSite · built with the Spotify Web API · data updates automatically
      </div>
    </div>
  )
}
