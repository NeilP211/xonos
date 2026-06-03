import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { colorForKey } from '../lib/palette'
import Empty from './Empty'

export default function GenreChart({ genres }) {
  const data = (genres || []).map((g) => ({ name: g.genre, pct: Math.round((g.weight || 0) * 100) }))
  return (
    <div className="card col-4">
      <h2>Top Genres</h2>
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
