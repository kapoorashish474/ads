import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { Loading, ErrorState, ConfidenceBadge, ImpactBadge } from '../components/ui'
import EvidenceDrawer from '../components/EvidenceDrawer'

export default function Quarters() {
  const [params, setParams] = useSearchParams()
  const quarter = params.get('quarter') || ''
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, title: '', evidence: [], sources: [] })

  useEffect(() => {
    api.quarters(quarter || undefined).then(setData).catch((e) => setError(e.message))
  }, [quarter])

  async function openEvidence(move) {
    try {
      const bundle = await api.evidence(move.signalIds || [])
      setDrawer({
        open: true,
        title: move.title,
        evidence: bundle.evidence || [],
        sources: bundle.sources || [],
      })
    } catch (e) {
      setError(e.message)
    }
  }

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Public competitor moves</p>
          <h1>By quarter</h1>
          <p className="lede lede--short">Chips, not essays. Tap a move for marked sources.</p>
        </div>
        <div className="filters">
          {data.quarters.map((q) => (
            <button
              key={q}
              type="button"
              className={`chip ${(quarter || data.selected) === q ? 'is-active' : ''}`}
              onClick={() => setParams({ quarter: q })}
            >
              {q}
            </button>
          ))}
        </div>
      </header>

      <p className="muted count-line">
        {data.count} public moves · {data.selected}
      </p>

      <div className="q-grid">
        {data.moves.map((m) => (
          <button key={m.id} type="button" className="q-card" onClick={() => openEvidence(m)}>
            <div className="q-card__top">
              <span className="pill pill--soft">{m.type}</span>
              <ImpactBadge impact={m.impactOnKargo} />
            </div>
            <span className="muted">{m.competitorName}</span>
            <h2>{m.title}</h2>
            <p>{m.oneLiner}</p>
            <div className="q-card__foot">
              <ConfidenceBadge value={m.confidence} />
              <span className="text-link">{m.sourceName} ↗</span>
            </div>
          </button>
        ))}
      </div>

      <EvidenceDrawer
        open={drawer.open}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        title={drawer.title}
        evidence={drawer.evidence}
        sources={drawer.sources}
      />
    </div>
  )
}
