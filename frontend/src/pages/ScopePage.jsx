import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SUBJECT_LABEL } from '../brand'
import { api } from '../api'
import { Loading, ErrorState } from '../components/ui'
import { CapabilityRadar, ScopeBars } from '../components/Charts'

export default function ScopePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [open, setOpen] = useState(null)

  useEffect(() => {
    api.scopeMap().then(setData).catch((e) => setError(e.message))
  }, [])

  if (error) return <ErrorState message={error} />
  if (!data) return <Loading />

  const radarSeries = [
    {
      id: 'baseline',
      name: SUBJECT_LABEL,
      tone: 'baseline',
      points: Object.entries(data.kargo.capabilityScores).map(([dimension, value]) => ({
        label: dimension.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).split(' ')[0],
        value,
      })),
    },
    {
      id: 'peer',
      name: 'Peer best',
      tone: 'peer',
      points: data.gaps.map((g) => ({
        label: g.label.split(' ')[0],
        value: g.leaderScore,
      })),
    },
  ]

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Growth upside</p>
          <h1>Scope to improve</h1>
          <p className="lede lede--short">{data.policy}</p>
        </div>
      </header>

      <div className="grid-2">
        <section className="panel">
          <h2>Capability radar</h2>
          <CapabilityRadar series={radarSeries} size={320} />
        </section>
        <section className="panel">
          <h2>Improvement map</h2>
          <ScopeBars rows={data.gaps} onSelect={(row) => setOpen(open === row.dimension ? null : row.dimension)} />
          {open && (
            <div className="scope-inline-detail">
              {(() => {
                const g = data.gaps.find((r) => r.dimension === open)
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
                      <span className="muted">Peer lead: {g.leaderName}</span>
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
    </div>
  )
}
