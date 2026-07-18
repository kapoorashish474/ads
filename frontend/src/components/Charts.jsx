/**
 * Capability radar + compare charts — visual first, minimal text.
 */
import { SUBJECT_LABEL } from '../brand'

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

export function CapabilityRadar({ series = [], size = 280 }) {
  const dims = series[0]?.points?.map((p) => p.label) || []
  if (!dims.length) return null

  const cx = size / 2
  const cy = size / 2
  const maxR = size * 0.36
  const step = 360 / dims.length

  const rings = [0.25, 0.5, 0.75, 1]

  function pathFor(points) {
    return points
      .map((p, i) => {
        const [x, y] = polar(cx, cy, (p.value / 100) * maxR, i * step)
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(' ') + ' Z'
  }

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-svg" role="img" aria-label="Capability radar">
        {rings.map((r) => (
          <polygon
            key={r}
            className="radar-ring"
            points={dims
              .map((_, i) => polar(cx, cy, maxR * r, i * step).join(','))
              .join(' ')}
          />
        ))}
        {dims.map((label, i) => {
          const [x1, y1] = polar(cx, cy, maxR, i * step)
          const [lx, ly] = polar(cx, cy, maxR + 18, i * step)
          return (
            <g key={label}>
              <line className="radar-axis" x1={cx} y1={cy} x2={x1} y2={y1} />
              <text className="radar-label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            </g>
          )
        })}
        {series.map((s) => (
          <path key={s.id} className={`radar-fill radar-fill--${s.tone || 'peer'}`} d={pathFor(s.points)} />
        ))}
      </svg>
      <div className="chart-legend">
        {series.map((s) => (
          <span key={s.id} className={`legend-dot legend-dot--${s.tone || 'peer'}`}>
            {s.name}
          </span>
        ))}
      </div>
    </div>
  )
}

export function ScopeBars({ rows = [], onSelect }) {
  return (
    <ul className="scope-bars">
      {rows.map((row) => {
        const scope = Math.max(0, -row.gapToLeader)
        const lead = row.leaderScore
        const kargo = row.kargo
        return (
          <li key={row.dimension}>
            <button type="button" className="scope-bar-row" onClick={() => onSelect?.(row)}>
              <div className="scope-bar-row__head">
                <strong>{row.label}</strong>
                <span className="scope-pill">
                  {scope === 0 ? 'Leading' : `Scope +${scope}`}
                </span>
              </div>
              <div className="scope-dual">
                <div className="scope-dual__col">
                  <span>{SUBJECT_LABEL}</span>
                  <div className="bar__track">
                    <i style={{ width: `${kargo}%` }} className="bar__fill bar__fill--baseline" />
                  </div>
                  <em>{kargo}</em>
                </div>
                <div className="scope-dual__col">
                  <span>{row.leaderName?.split(' ')[0] || 'Peer'}</span>
                  <div className="bar__track">
                    <i style={{ width: `${lead}%` }} className="bar__fill bar__fill--peer" />
                  </div>
                  <em>{lead}</em>
                </div>
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function QuarterBars({ moves = [] }) {
  const byType = moves.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1
    return acc
  }, {})
  const entries = Object.entries(byType).sort((a, b) => b[1] - a[1])
  const max = Math.max(...entries.map(([, n]) => n), 1)

  if (!entries.length) return null

  return (
    <div className="q-bars" aria-label="Moves by type">
      {entries.map(([type, n]) => (
        <div key={type} className="q-bar">
          <span className="q-bar__label">{type.replace(/_/g, ' ')}</span>
          <div className="q-bar__track">
            <i style={{ width: `${(n / max) * 100}%` }} />
          </div>
          <em>{n}</em>
        </div>
      ))}
    </div>
  )
}

export function RankList({ items = [], valueKey = 'value', labelKey = 'label', max }) {
  const top = max || Math.max(...items.map((i) => i[valueKey] || 0), 1)
  return (
    <ol className="rank-list">
      {items.map((item, idx) => (
        <li key={item.id || item[labelKey]}>
          <span className="rank-list__n">{idx + 1}</span>
          <div className="rank-list__body">
            <div className="rank-list__head">
              <strong>{item[labelKey]}</strong>
              <em>{item[valueKey]}</em>
            </div>
            <div className="bar__track">
              <i
                style={{ width: `${((item[valueKey] || 0) / top) * 100}%` }}
                className="bar__fill bar__fill--baseline"
              />
            </div>
            {item.hint && <span className="muted">{item.hint}</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}
