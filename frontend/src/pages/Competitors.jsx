import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SUBJECT_LABEL } from '../brand'
import { api } from '../api'
import { Loading, ErrorState } from '../components/ui'
import { RankList } from '../components/Charts'

const WATCH_LABEL = {
  focus: 'Priority focus',
  watch: 'Worth watching',
  radar: 'On the radar',
}

export default function Competitors() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [params, setParams] = useSearchParams()
  const tier = params.get('tier') || ''

  useEffect(() => {
    api.competitors(tier || undefined).then(setData).catch((e) => setError(e.message))
  }, [tier])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  const ranked = [...data.competitors]
    .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
    .map((c) => ({
      id: c.id,
      label: c.name,
      value: c.opportunityScore,
      hint: `${c.tier} · ${WATCH_LABEL[c.watchLevel] || c.watchLevel}`,
    }))

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Direct · Adjacent · Emerging</p>
          <h1>Peer map</h1>
          <p className="lede lede--short">
            Track peers against your baseline. Opportunity score ranks where learning is richest.
          </p>
        </div>
        <div className="filters">
          {['', 'direct', 'adjacent', 'startup'].map((t) => (
            <button
              key={t || 'all'}
              type="button"
              className={`chip ${tier === t ? 'is-active' : ''}`}
              onClick={() => setParams(t ? { tier: t } : {})}
            >
              {t || 'All'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid-2">
        <section className="panel">
          <h2>Opportunity ranking</h2>
          <RankList items={ranked} />
        </section>

        <div className="baseline-panel panel">
          <div>
            <p className="eyebrow">Baseline</p>
            <h2>{SUBJECT_LABEL}</h2>
            <p className="muted">Your reference frame for every comparison.</p>
          </div>
          <div className="score-strip">
            {Object.entries(data.kargo.capabilityScores).map(([k, v]) => (
              <div key={k} className="score-pill">
                <span>{k.replace(/([A-Z])/g, ' $1')}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-list data-list--cards panel">
        {data.competitors.map((c) => (
          <Link key={c.id} to={`/competitors/${c.id}`} className="data-row data-row--link">
            <div className="comp-card__avatar">{c.shortName}</div>
            <div className="data-row__main">
              <span className="data-row__eyebrow capitalize">
                {c.tier} · {c.category}
              </span>
              <strong>{c.name}</strong>
              <span className="muted">{c.summary}</span>
            </div>
            <div className="data-row__side">
              <span className={`pill pill--watch-${c.watchLevel}`}>{WATCH_LABEL[c.watchLevel] || c.watchLevel}</span>
              <span className="muted">Opportunity {c.opportunityScore}</span>
              <span className="muted">{c.recentMoves} recent moves</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
