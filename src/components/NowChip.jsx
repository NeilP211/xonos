import { timeAgo } from '../lib/format'

export default function NowChip({ now }) {
  if (!now || !now.track) return null
  const t = now.track
  const live = !!now.is_playing
  const suffix = !live && now.played_at ? ` · ${timeAgo(now.played_at)}` : ''
  return (
    <div className={`nowchip ${live ? '' : 'idle'}`} title={`${t.name} - ${(t.artists || []).join(', ')}`}>
      <span className="pulse" />
      <div style={{ minWidth: 0 }}>
        <div className="label">{live ? 'Now playing' : 'Last spun'}</div>
        <div className="track">
          {t.name} · {(t.artists || []).join(', ')}
          {suffix}
        </div>
      </div>
    </div>
  )
}
