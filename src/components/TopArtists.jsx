import Thumb from './Thumb'
import Empty from './Empty'

export default function TopArtists({ artists }) {
  const list = artists || []
  return (
    <div className="card col-4">
      <h2>Top Artists</h2>
      {list.length ? (
        <div className="artistgrid">
          {list.map((a) => (
            <div className="artist" key={`${a.rank}-${a.name}`}>
              <Thumb name={a.name} image={a.image} round />
              <div className="name">{a.name}</div>
              <div className="rk">#{a.rank}</div>
            </div>
          ))}
        </div>
      ) : (
        <Empty />
      )}
    </div>
  )
}
