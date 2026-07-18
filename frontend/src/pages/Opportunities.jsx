import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge, PriorityBadge } from '../components/ui'

export default function Opportunities() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [params, setParams] = useSearchParams()
  const priority = params.get('priority') || ''

  useEffect(() => {
    const q = {}
    if (priority) q.priority = priority
    api.opportunities(q).then(setData).catch((e) => setError(e.message))
  }, [priority])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Public evidence → move</p>
          <h1>Recommended moves</h1>
          <p className="lede lede--short">Priority · confidence · effort/impact. Sources on every card.</p>
        </div>
        <div className="filters">
          {['', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p || 'all'}
              type="button"
              className={`chip ${priority === p ? 'is-active' : ''}`}
              onClick={() => setParams(p ? { priority: p } : {})}
            >
              {p || 'All'}
            </button>
          ))}
        </div>
      </header>

      <div className="opp-grid">
        {data.opportunities.map((o, i) => (
          <Link key={o.id} to={`/opportunities/${o.id}`} className={`opp-card animate-in animate-in--${Math.min(i + 1, 4)}`}>
            <div className="opp-card__top">
              <PriorityBadge priority={o.priority} />
              <ConfidenceBadge value={o.confidence} />
            </div>
            <h2>{o.title}</h2>
            <p className="move-card__action">{o.move}</p>
            <div className="move-card__meta">
              <span className="pill">{o.effort} effort</span>
              <span className="pill">{o.impact} impact</span>
            </div>
            <div className="opp-card__foot">
              <span>{o.horizon}</span>
              <span>{o.evidenceIds.length} sources</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
