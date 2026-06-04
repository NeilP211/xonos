import Thumb from './Thumb'
import Empty from './Empty'

// Ranked list of albums with their cover art, derived from the window's top tracks.
export default function TopAlbums({ albums }) {
  const list = albums || []
  return (
    <div className="card col-4">
      <h2>Top Albums</h2>
      <div className="ranklist">
        {list.map((a, i) => (
          <div className="rankrow" key={`${a.album}-${i}`}>
            <div className="rank">{i + 1}</div>
            <Thumb name={a.album} image={a.image} />
            <div className="meta">
              <div className="name">{a.album}</div>
              <div className="sub">{a.artist}</div>
            </div>
          </div>
        ))}
        {!list.length && <Empty />}
      </div>
    </div>
  )
}
