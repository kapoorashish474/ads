import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge, PriorityBadge, SourceChip, formatDate } from '../components/ui'

export default function OpportunityDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.opportunity(id).then(setData).catch((e) => setError(e.message))
  }, [id])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  const { opportunity: o, evidence, competitors, sources, confidenceBreakdown } = data

  return (
    <div className="page">
      <Link to="/opportunities" className="back-link">
        ← Opportunities
      </Link>

      <header className="detail-hero animate-in">
        <div className="detail-hero__badges">
          <PriorityBadge priority={o.priority} />
          <ConfidenceBadge value={o.confidence} size="lg" />
          <span className="pill">{o.horizon}</span>
        </div>
        <h1>{o.title}</h1>
        <p className="lede lede--short">{o.move}</p>
        <p className="muted">{o.whyItMatters}</p>
      </header>

      <div className="grid-2 animate-in animate-in--2">
        <section className="panel">
          <h2>Why this matters</h2>
          <p>{o.expectedImpact}</p>
          <h3 className="subhead">Actions</h3>
          <ol className="action-list">
            {o.recommendedActions.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ol>
          <div className="move-card__meta" style={{ marginTop: '1rem' }}>
            <span className="pill">{o.effort} effort</span>
            <span className="pill">{o.impact} impact</span>
          </div>
        </section>

        <section className="panel">
          <h2>Confidence breakdown</h2>
          <p className="muted">{confidenceBreakdown.note}</p>
          <dl className="stat-dl">
            <div>
              <dt>Overall</dt>
              <dd>{Math.round(confidenceBreakdown.overall * 100)}%</dd>
            </div>
            <div>
              <dt>Evidence items</dt>
              <dd>{confidenceBreakdown.evidenceCount}</dd>
            </div>
            <div>
              <dt>Strong evidence</dt>
              <dd>{confidenceBreakdown.strongEvidence}</dd>
            </div>
            <div>
              <dt>Avg signal conf.</dt>
              <dd>{Math.round(confidenceBreakdown.avgSignalConfidence * 100)}%</dd>
            </div>
          </dl>
          <h3 className="subhead">Pressuring competitors</h3>
          <div className="tag-row">
            {competitors.map((c) => (
              <Link key={c.id} to={`/competitors/${c.id}`} className="tag-link">
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="panel animate-in animate-in--3">
        <header className="panel__head">
          <h2>Evidence & sources</h2>
        </header>
        <div className="source-row">
          {sources.map((s) => (
            <SourceChip key={s.id + s.url} name={s.name} type={s.type} url={s.url} />
          ))}
        </div>
        <div className="evidence-list">
          {evidence.map((e) => (
            <article key={e.id} className="evidence">
              <div className="evidence__head">
                <ConfidenceBadge value={e.confidence} />
                <span className="pill pill--strength">{e.evidenceStrength}</span>
                <span className="muted">{e.sourceName}</span>
              </div>
              <h3>{e.title}</h3>
              <p>{e.summary}</p>
              <blockquote>{e.rawExcerpt}</blockquote>
              <div className="evidence__foot">
                <time className="muted">{formatDate(e.publishedAt)}</time>
                <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-link">
                  Open original source ↗
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
