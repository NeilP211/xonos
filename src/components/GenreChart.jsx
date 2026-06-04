import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { colorForKey } from '../lib/palette'
import Empty from './Empty'

export default function GenreChart({ genres, albums }) {
  // Prefer genres; fall back to albums when Spotify returns no genres (it strips
  // them for development-mode apps).
  const useGenres = genres && genres.length > 0
  const rows = useGenres ? genres : albums || []
  const title = useGenres ? 'Top Genres' : 'Top Albums'
  const data = rows.map((r) => ({ name: useGenres ? r.genre : r.album, pct: Math.round((r.weight || 0) * 100) }))
  return (
    <div className="card col-4">
      <h2>{title}</h2>
      {data.length ? (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 36)}>
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 36, top: 4, bottom: 4 }}>
            <XAxis type="number" hide domain={[0, 'dataMax']} />
            <YAxis
              type="category"
              dataKey="name"
              width={108}
              tick={{ fill: '#9a9ab0', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{ background: '#15151f', border: '1px solid #262633', borderRadius: 10, color: '#f4f4f8' }}
              formatter={(v) => [`${v}%`, 'share']}
            />
            <Bar dataKey="pct" radius={[0, 6, 6, 0]} label={{ position: 'right', fill: '#9a9ab0', fontSize: 11, formatter: (v) => `${v}%` }}>
              {data.map((d) => (
                <Cell key={d.name} fill={colorForKey(d.name)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Empty />
      )}
    </div>
  )
}
