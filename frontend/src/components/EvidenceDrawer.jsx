import { ConfidenceBadge, ImpactBadge, formatDate } from './ui'

export default function EvidenceDrawer({ open, onClose, title, evidence = [], sources = [] }) {
  if (!open) return null

  return (
    <div className="drawer-root" role="dialog" aria-modal="true" aria-label="Evidence">
      <button type="button" className="drawer-backdrop" aria-label="Close" onClick={onClose} />
      <aside className="drawer">
        <header className="drawer__head">
          <div>
            <p className="eyebrow">Public evidence</p>
            <h2>{title || 'Evidence'}</h2>
          </div>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Close
          </button>
        </header>

        {sources.length > 0 && (
          <div className="source-row drawer__sources">
            {sources.map((s) => (
              <a key={s.id + (s.url || '')} className="source-chip" href={s.url} target="_blank" rel="noreferrer">
                <span className="source-chip__type">{(s.type || 'source').replace(/_/g, ' ')}</span>
                <span className="source-chip__name">{s.name}</span>
              </a>
            ))}
          </div>
        )}

        <div className="drawer__body">
          {evidence.length === 0 ? (
            <p className="muted">No linked public signals.</p>
          ) : (
            evidence.map((e) => (
              <article key={e.id} className="evidence evidence--compact">
                <div className="evidence__head">
                  <ConfidenceBadge value={e.confidence} />
                  {e.impactOnKargo && <ImpactBadge impact={e.impactOnKargo} />}
                  <span className="muted">{e.sourceName}</span>
                </div>
                <h3>{e.title}</h3>
                <p>{e.summary || e.oneLiner}</p>
                <div className="evidence__foot">
                  {e.publishedAt && <time className="muted">{formatDate(e.publishedAt)}</time>}
                  <a href={e.sourceUrl} target="_blank" rel="noreferrer" className="text-link">
                    Open source ↗
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
