import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SUBJECT_LABEL } from '../brand'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge, PriorityBadge, ImpactBadge, formatDate } from '../components/ui'

export default function CompetitorDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.competitor(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  const { competitor: c, comparison, signals, opportunities, llmBrief } = data

  return (
    <div className="page">
      <Link to="/competitors" className="back-link">
        ← Peers
      </Link>

      <header className="detail-hero animate-in">
        <div className="detail-hero__badges">
          <span className="pill capitalize">{c.tier}</span>
          <span className={`pill pill--watch-${c.watchLevel}`}>
            {c.watchLevel === 'focus' ? 'Priority focus' : c.watchLevel === 'watch' ? 'Worth watching' : 'On the radar'}
          </span>
          <span className="pill">{c.category}</span>
        </div>
        <h1>{c.name}</h1>
        <p className="lede lede--short">{c.summary}</p>
        <p className="muted">
          {c.hq} · {c.employees} · Focus: {c.focus.join(' · ')}
        </p>
      </header>

      <section className="panel llm-brief animate-in animate-in--2">
        <header className="panel__head">
          <h2>Public brief</h2>
          <ConfidenceBadge value={llmBrief.confidence} />
        </header>
        <p>{llmBrief.summary}</p>
        <div className="tag-row">
          {llmBrief.watchFor.map((w) => (
            <span key={w} className="tag">
              {w}
            </span>
          ))}
        </div>
      </section>

      <section className="panel animate-in animate-in--3">
        <h2>{SUBJECT_LABEL} vs {c.shortName}</h2>
        <ul className="compare-list">
          {comparison.map((row) => (
            <li key={row.dimension}>
              <div className="compare-row">
                <strong>{row.label}</strong>
                <div className="compare-bars">
                  <div className="bar">
                    <span>{SUBJECT_LABEL}</span>
                    <div className="bar__track">
                      <i style={{ width: `${row.kargo}%` }} className="bar__fill bar__fill--kargo" />
                    </div>
                    <em>{row.kargo}</em>
                  </div>
                  <div className="bar">
                    <span>{c.shortName}</span>
                    <div className="bar__track">
                      <i style={{ width: `${row.competitor}%` }} className="bar__fill bar__fill--peer" />
                    </div>
                    <em>{row.competitor}</em>
                  </div>
                </div>
                <span className={`delta ${row.delta < 0 ? 'delta--scope' : 'delta--pos'}`}>
                  {row.delta >= 0 ? `Lead +${row.delta}` : `Scope +${-row.delta}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid-2 animate-in animate-in--4">
        <section className="panel">
          <h2>Related opportunities</h2>
          {opportunities.length === 0 ? (
            <p className="muted">No open opportunities linked yet.</p>
          ) : (
            <ul className="opp-list">
              {opportunities.map((o) => (
                <li key={o.id}>
                  <Link to={`/opportunities/${o.id}`} className="opp-row">
                    <div className="opp-row__meta">
                      <PriorityBadge priority={o.priority} />
                      <ConfidenceBadge value={o.confidence} />
                    </div>
                    <strong>{o.title}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <h2>Signals</h2>
          <div className="signal-table">
            {signals.map((s) => (
              <article key={s.id} className="signal-row signal-row--compact">
                <div className="signal-row__main">
                  <div className="signal-row__tags">
                    <ImpactBadge impact={s.impactOnKargo} />
                    <span className="muted">{s.sourceName}</span>
                  </div>
                  <h3>{s.title}</h3>
                </div>
                <div className="signal-row__side">
                  <ConfidenceBadge value={s.confidence} />
                  <a href={s.sourceUrl} target="_blank" rel="noreferrer" className="text-link">
                    Source ↗
                  </a>
                  <time className="muted">{formatDate(s.publishedAt)}</time>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
