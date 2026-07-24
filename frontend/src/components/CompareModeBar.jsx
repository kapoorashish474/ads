export default function CompareModeBar({ compareMode, onChange, peerCount }) {
  return (
    <div className="compare-mode" role="group" aria-label="View mode">
      <span className="compare-mode__label">View</span>
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
        Compare{peerCount ? ` · ${peerCount} peers` : ''}
      </button>
    </div>
  );
}
