import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Thumb from './Thumb'
import { commas, minutesToHuman, DOW } from '../lib/format'

function LockedAllTime() {
  return (
    <div className="card col-12">
      <h2>All-Time</h2>
      <div className="locked">
        <div className="lock">🔒</div>
        <h3>Unlock your lifetime stats</h3>
        <p>
          The Spotify API only goes back about a year. Your true all-time history comes from your
          downloaded data export. Here is how to light this up:
        </p>
        <ol>
          <li>
            Go to your <strong>Spotify Account Privacy</strong> page and request your{' '}
            <strong>Extended streaming history</strong> (it can take a few days to arrive).
          </li>
          <li>Unzip the download somewhere on your machine.</li>
          <li>
            Run <code>npm run ingest -- /path/to/your_spotify_data</code> to build{' '}
            <code>public/data/alltime.json</code>.
          </li>
          <li>Commit and push. This panel fills in with your lifetime stats.</li>
        </ol>
      </div>
    </div>
  )
}

function Totals({ totals, since }) {
  const t = totals || {}
  const items = [
    { big: minutesToHuman(t.minutes), lbl: 'total listening time' },
    { big: commas(t.streams), lbl: 'streams' },
    { big: commas(t.distinct_tracks), lbl: 'distinct tracks' },
    { big: commas(t.distinct_artists), lbl: 'distinct artists' },
  ]
  return (
    <div className="card col-12">
      <h2>Lifetime{since ? ` · since ${since}` : ''}</h2>
      <div className="stats">
        {items.map((it) => (
          <div className="stat" key={it.lbl}>
            <div className="big grad">{it.big}</div>
            <div className="lbl">{it.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TopByMinutes({ title, rows, round }) {
  return (
    <div className="card col-4">
      <h2>{title}</h2>
      <div className="ranklist">
        {(rows || []).map((r, i) => (
          <div className="rankrow" key={`${r.name}-${i}`}>
            <div className="rank">{i + 1}</div>
            <Thumb name={r.name} image={r.image} round={round} />
            <div className="meta">
              <div className="name">{r.name}</div>
              <div className="sub">
                {r.artist ? `${r.artist} · ` : ''}
                {minutesToHuman(r.minutes)}
                {r.plays != null ? ` · ${commas(r.plays)} plays` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function YearTrend({ byMonth, byYear }) {
  const data = (byMonth && byMonth.length ? byMonth : byYear || []).map((d) => ({
    label: d.month || String(d.year),
    minutes: d.minutes,
  }))
  return (
    <div className="card col-12">
      <h2>Minutes over time</h2>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#262633" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#6c6c84', fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={{ fill: '#6c6c84', fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={{ background: '#15151f', border: '1px solid #262633', borderRadius: 10, color: '#f4f4f8' }}
            formatter={(v) => [commas(v), 'minutes']}
          />
          <Area type="monotone" dataKey="minutes" stroke="#22d3ee" strokeWidth={2} fill="url(#g1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function Behavior({ behavior }) {
  const b = behavior || {}
  const pct = (x) => `${Math.round((x || 0) * 100)}%`
  return (
    <div className="card col-4">
      <h2>How you listen</h2>
      <div className="stats">
        <div className="stat">
          <div className="big grad">{pct(b.skip_rate)}</div>
          <div className="lbl">skip rate</div>
        </div>
        <div className="stat">
          <div className="big grad">{pct(b.shuffle_rate)}</div>
          <div className="lbl">shuffle rate</div>
        </div>
      </div>
    </div>
  )
}

function LifetimeHeat({ heatmap }) {
  if (!heatmap || !heatmap.length) return null
  const grid = Array.from({ length: 7 }, () => new Array(24).fill(0))
  for (const c of heatmap) grid[c.dow][c.hour] = c.minutes
  const max = Math.max(1, ...grid.flat())
  const color = (m) => (m ? `rgba(167, 139, 250, ${(0.12 + 0.88 * (m / max)).toFixed(3)})` : 'var(--bg-2)')
  return (
    <div className="card col-12">
      <h2>Lifetime listening clock</h2>
      <div className="heatmap">
        {grid.map((row, dow) => (
          <span key={`l-${dow}`} style={{ display: 'contents' }}>
            <span className="hlabel">{DOW[dow]}</span>
            {row.map((m, hour) => (
              <div className="cell" key={hour} style={{ background: color(m) }} title={`${DOW[dow]} ${hour}:00 - ${minutesToHuman(m)}`} />
            ))}
          </span>
        ))}
        <div className="axis">
          <span>12a</span>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>11p</span>
        </div>
      </div>
    </div>
  )
}

export default function AllTime({ data }) {
  if (!data) return <LockedAllTime />
  return (
    <>
      <Totals totals={data.totals} since={data.since} />
      <TopByMinutes title="All-Time Tracks" rows={data.top_tracks_by_minutes} />
      <TopByMinutes title="All-Time Artists" rows={data.top_artists_by_minutes} round />
      <Behavior behavior={data.behavior} />
      <YearTrend byMonth={data.by_month} byYear={data.by_year} />
      <LifetimeHeat heatmap={data.heatmap} />
    </>
  )
}
