import { colorForKey } from '../lib/palette'
import { initials } from '../lib/format'

// Album/artist art with a colored initials fallback when no image is available.
export default function Thumb({ name, image, round = false }) {
  const cls = `thumb ${round ? 'round' : ''}`
  if (image) {
    return (
      <div className={cls}>
        <img src={image} alt={name || ''} loading="lazy" />
      </div>
    )
  }
  const c = colorForKey(name || '?')
  return (
    <div className={cls} style={{ background: `linear-gradient(135deg, ${c}, ${c}88)` }}>
      {initials(name)}
    </div>
  )
}
