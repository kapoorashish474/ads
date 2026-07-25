export default function CompareModeBar({ compareMode, onChange, peerCount, compact = false }) {
  return (
    <div className={`compare-mode ${compact ? 'compare-mode--compact' : ''}`} role="group" aria-label="View mode">
      {!compact && <span className="compare-mode__label">View</span>}
      <button
        type="button"
        className={!compareMode ? 'compare-mode__btn active' : 'compare-mode__btn'}
        onClick={() => onChange(false)}
        aria-pressed={!compareMode}
      >
        Focus
      </button>
      <button
        type="button"
        className={compareMode ? 'compare-mode__btn active' : 'compare-mode__btn'}
        onClick={() => onChange(true)}
        aria-pressed={compareMode}
      >
        Compare{peerCount ? (compact ? ` · ${peerCount}` : ` · ${peerCount} peers`) : ''}
      </button>
    </div>
  );
}
