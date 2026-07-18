import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge } from '../components/ui'

export default function Learnings() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.learnings().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">from → lesson → quick win</p>
          <h1>Strategic playbooks</h1>
          <p className="lede lede--short">Public peer moves, distilled to one action each.</p>
        </div>
      </header>

      <div className="learn-grid">
        {data.learnings.map((l) => (
          <article key={l.id} className="learn-card learn-card--pad">
            <div className="learn-card__top">
              <span className="muted">from {l.from}</span>
              <ConfidenceBadge value={l.confidence} />
            </div>
            <h2>{l.title}</h2>
            <p>{l.lesson}</p>
            <p className="scope-move">
              <strong>Quick win:</strong> {l.quickWin}
            </p>
            <div className="move-card__meta">
              <span className="pill">{l.effort} effort</span>
              <span className="pill">{l.impact} impact</span>
              <span className="muted">{l.sourceNames.join(' · ')}</span>
            </div>
            <Link className="text-link" to={`/opportunities/${l.opportunityId}`}>
              Linked opportunity →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
