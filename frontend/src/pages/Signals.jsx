import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge, ImpactBadge, formatDate } from '../components/ui'

export default function Signals() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [params, setParams] = useSearchParams()
  const impact = params.get('impact') || ''
  const q = params.get('q') || ''

  useEffect(() => {
    const query = {}
    if (impact) query.impact = impact
    if (q) query.q = q
    api.signals(query).then(setData).catch((e) => setError(e.message))
  }, [impact, q])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Continuous public ingest</p>
          <h1>Signal feed</h1>
          <p className="lede">Job posts, patents, blogs, press, funding, case studies, and conference talks—with confidence scores.</p>
        </div>
        <div className="filters filters--wrap">
          <input
            className="search"
            placeholder="Search signals…"
            defaultValue={q}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const next = new URLSearchParams(params)
                if (e.target.value) next.set('q', e.target.value)
                else next.delete('q')
                setParams(next)
              }
            }}
          />
          {['', 'high', 'medium', 'low'].map((i) => (
            <button
              key={i || 'all'}
              type="button"
              className={`chip ${impact === i ? 'is-active' : ''}`}
              onClick={() => {
                const next = new URLSearchParams(params)
                if (i) next.set('impact', i)
                else next.delete('impact')
                setParams(next)
              }}
            >
              {i ? `${i} impact` : 'All'}
            </button>
          ))}
        </div>
      </header>

      <p className="muted count-line">{data.count} signals</p>

      <div className="signal-table panel">
        {data.signals.map((s) => (
          <article key={s.id} className="signal-row">
            <div className="signal-row__main">
              <div className="signal-row__tags">
                <ImpactBadge impact={s.impactOnKargo} />
                <span className="pill pill--soft">{s.category.replace(/_/g, ' ')}</span>
                <span className="muted">{s.competitorName}</span>
              </div>
              <h3>{s.title}</h3>
              <p>{s.summary}</p>
              <div className="tag-row">
                {s.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="signal-row__side">
              <ConfidenceBadge value={s.confidence} />
              <span className="source-label">{s.sourceName}</span>
              <time className="muted">{formatDate(s.publishedAt)}</time>
              <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
                Open source ↗
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
