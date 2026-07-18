import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, formatDate } from '../components/ui'

export default function Sources() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.sources().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Marked public origins</p>
          <h1>Sources</h1>
          <p className="lede lede--short">
            {data.notice || 'Public sources only. No confidential or internal data.'}
          </p>
        </div>
        <Link className="btn btn--primary" to="/signals">
          Browse signals
        </Link>
      </header>

      <div className="source-grid">
        {data.sources.map((s, i) => (
          <article key={s.id} className={`source-card animate-in animate-in--${Math.min(i + 1, 4)}`}>
            <div className="source-card__top">
              <span className="pill pill--soft">{s.type.replace(/_/g, ' ')}</span>
              <span className={`status-dot status-dot--${s.status}`}>{s.status}</span>
            </div>
            <h2>{s.name}</h2>
            <p>{s.description}</p>
            <dl className="source-meta">
              <div>
                <dt>Cadence</dt>
                <dd>{s.cadence}</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>{s.coverage}</dd>
              </div>
              <div>
                <dt>Reliability</dt>
                <dd>{Math.round(s.reliability * 100)}%</dd>
              </div>
              <div>
                <dt>Signals here</dt>
                <dd>{s.signalCount}</dd>
              </div>
              <div>
                <dt>Last sync</dt>
                <dd>{formatDate(s.lastSync)}</dd>
              </div>
            </dl>
            <a href={s.url} target="_blank" rel="noreferrer" className="text-link">
              Visit source origin ↗
            </a>
          </article>
        ))}
      </div>
    </div>
  )
}
