export function ConfidenceBadge({ value, size = 'md' }) {
  const pct = Math.round(value * 100)
  const tone = pct >= 85 ? 'high' : pct >= 70 ? 'mid' : 'low'
  return (
    <span className={`confidence confidence--${tone} confidence--${size}`} title="Public-source confidence">
      <span className="confidence__bar" style={{ '--pct': `${pct}%` }} />
      <span className="confidence__label">{size === 'sm' ? `${pct}%` : `${pct}% conf.`}</span>
    </span>
  )
}

export function PriorityBadge({ priority }) {
  return <span className={`pill pill--${priority}`}>{priority}</span>
}

export function ImpactBadge({ impact }) {
  return <span className={`pill pill--impact-${impact}`}>{impact} impact</span>
}

export function SourceChip({ name, type, url }) {
  return (
    <a className="source-chip" href={url} target="_blank" rel="noreferrer" title={type}>
      <span className="source-chip__type">{type?.replace(/_/g, ' ')}</span>
      <span className="source-chip__name">{name}</span>
    </a>
  )
}

export function Metric({ label, value, hint }) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <strong className="metric__value">{value}</strong>
      {hint ? <span className="metric__hint">{hint}</span> : null}
    </div>
  )
}

export function Loading() {
  return <div className="state">Loading intelligence…</div>
}

export function ErrorState({ message }) {
  return <div className="state state--error">{message || 'Could not reach the API. Start the backend on port 5000.'}</div>
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
