import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { ConfidenceBadge, Loading, ErrorState, PriorityBadge } from '../components/ui'
import EvidenceDrawer from '../components/EvidenceDrawer'
import { CapabilityRadar, ScopeBars, QuarterBars } from '../components/Charts'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [drawer, setDrawer] = useState({ open: false, title: '', evidence: [], sources: [] })
  const [scopeOpen, setScopeOpen] = useState(null)

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message))
  }, [])

  async function openOppEvidence(oppId, title) {
    try {
      const detail = await api.opportunity(oppId)
      setDrawer({
        open: true,
        title,
        evidence: detail.evidence || [],
        sources: detail.sources || [],
      })
    } catch (e) {
      setError(e.message)
    }
  }

  async function openMoveEvidence(move) {
    if (!move.signalIds?.length) return
    try {
      const bundle = await api.evidence(move.signalIds)
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

  const scopeRows = data.scopeMap || data.lagMap || []
  const radarSeries = data.radar
    ? [
        {
          id: 'kargo',
          name: 'Kargo',
          tone: 'kargo',
          points: data.radar.kargo.map((p) => ({ label: p.label, value: p.value })),
        },
        {
          id: 'peer',
          name: 'Peer best',
          tone: 'peer',
          points: data.radar.peerMax.map((p) => ({ label: p.label, value: p.value })),
        },
      ]
    : []

  return (
    <div className="page page--dashboard">
      <section className="hero-panel hero-panel--tight animate-in">
        <div className="policy-chip">Public sources only · every claim is marked</div>
        <p className="eyebrow">Kargo radar</p>
        <h1>{data.headline}</h1>
        <p className="lede lede--short">Three moves with public evidence. Scope to improve, not speculation.</p>
      </section>

      <section className="move-grid animate-in animate-in--2">
        {data.topMoves.map((m) => (
          <article key={m.id} className="move-card">
            <div className="move-card__top">
              <PriorityBadge priority={m.priority} />
              <ConfidenceBadge value={m.confidence} />
            </div>
            <h2>{m.title}</h2>
            <p className="move-card__action">{m.move}</p>
            <div className="move-card__meta">
              <span className="pill">{m.effort} effort</span>
              <span className="pill">{m.impact} impact</span>
              <span className="muted">{m.evidenceCount} sources</span>
            </div>
            <div className="move-card__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={() => openOppEvidence(m.id, m.title)}>
                Evidence
              </button>
              <Link className="btn btn--ghost btn--sm" to={`/opportunities/${m.id}`}>
                Details
              </Link>
            </div>
          </article>
        ))}
      </section>

      <div className="grid-2 animate-in animate-in--3">
        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Capability radar</h2>
              <p className="muted">Kargo vs peer best (public scores)</p>
            </div>
            <Link to="/scope">Scope map</Link>
          </header>
          <CapabilityRadar series={radarSeries} />
        </section>

        <section className="panel">
          <header className="panel__head">
            <div>
              <h2>Scope to improve</h2>
              <p className="muted">Where upside is largest</p>
            </div>
            <Link to="/scope">Full map</Link>
          </header>
          <ScopeBars
            rows={scopeRows}
            onSelect={(row) => setScopeOpen(scopeOpen === row.dimension ? null : row.dimension)}
          />
          {scopeOpen && (
            <div className="scope-inline-detail">
              {(() => {
                const g = scopeRows.find((r) => r.dimension === scopeOpen)
                if (!g) return null
                return (
                  <>
                    <p>{g.whyItMatters}</p>
                    <p className="scope-move">
                      <strong>Next step:</strong> {g.recommendedMove}
                    </p>
                    <div className="move-card__meta">
                      <span className="pill">{g.effort} effort</span>
                      <span className="pill">{g.impact} impact</span>
                    </div>
                    {g.opportunityId && (
                      <Link className="text-link" to={`/opportunities/${g.opportunityId}`}>
                        Open move →
                      </Link>
                    )}
                  </>
                )
              })()}
            </div>
          )}
        </section>
      </div>

      <section className="panel panel--flush animate-in animate-in--4">
        <header className="panel__head">
          <div>
            <h2>Quarter pulse</h2>
            <p className="muted">Public peer moves · {data.latestQuarter}</p>
          </div>
          <Link to="/quarters">All quarters</Link>
        </header>
        <div className="quarter-layout">
          <QuarterBars moves={data.quarterPreview} />
          <div>
            <div className="quarter-chips">
              {data.quarters.map((q) => (
                <Link key={q} to={`/quarters?quarter=${q}`} className={`chip ${q === data.latestQuarter ? 'is-active' : ''}`}>
                  {q}
                </Link>
              ))}
            </div>
            <div className="data-list">
              {data.quarterPreview.map((m) => (
                <button key={m.id} type="button" className="data-row" onClick={() => openMoveEvidence(m)}>
                  <div className="data-row__main">
                    <span className="data-row__eyebrow">{m.competitorName} · {m.type}</span>
                    <strong>{m.title}</strong>
                    <span className="muted">{m.oneLiner}</span>
                  </div>
                  <div className="data-row__side">
                    <ConfidenceBadge value={m.confidence} size="sm" />
                    <span className="text-link">{m.sourceName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panel animate-in animate-in--4">
        <header className="panel__head">
          <h2>Peer playbooks</h2>
          <Link to="/learnings">All</Link>
        </header>
        <div className="data-list data-list--cards">
          {data.learningsPreview.map((l) => (
            <Link key={l.id} to={`/opportunities/${l.opportunityId}`} className="data-row data-row--link">
              <div className="data-row__main">
                <span className="data-row__eyebrow">Inspired by {l.from}</span>
                <strong>{l.title}</strong>
                <span className="muted">{l.quickWin}</span>
              </div>
              <div className="data-row__side">
                <span className="pill">{l.effort} effort</span>
                <span className="pill">{l.impact} impact</span>
                <ConfidenceBadge value={l.confidence} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      </section>

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
