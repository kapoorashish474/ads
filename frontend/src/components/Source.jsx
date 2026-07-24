import { Pill } from './ui';

const confidenceLabels = {
  reported: 'Reported',
  estimated: 'Estimated',
  modeled: 'Modeled',
  inferred: 'Inferred',
};

export function SourceBadge({ confidence }) {
  if (!confidence) return null;
  return (
    <Pill tone={`conf-${confidence}`}>{confidenceLabels[confidence] || confidence}</Pill>
  );
}

export function SourceFootnote({ source, field }) {
  if (!source) return null;
  const s = typeof source === 'string' ? { label: source } : source;
  return (
    <footer className="source-footnote">
      <SourceBadge confidence={s.confidence} />
      <span className="source-footnote__text">
        {field && <strong>{field}: </strong>}
        {s.url ? (
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ) : (
          s.label
        )}
        {s.asOf && <span className="muted"> · {s.asOf}</span>}
      </span>
    </footer>
  );
}

export function SourceList({ sources }) {
  if (!sources || typeof sources !== 'object') return null;
  const entries = Object.entries(sources);
  return (
    <ul className="source-list">
      {entries.map(([key, src]) => (
        <li key={key}>
          <span className="source-list__field">{formatField(key)}</span>
          <SourceFootnote source={src} />
        </li>
      ))}
    </ul>
  );
}

function formatField(key) {
  const map = {
    revenue: 'Revenue',
    employees: 'Headcount',
    segments: 'Revenue segments',
    radar: 'Strength radar',
    products: 'Products',
    winning: 'Winning thesis',
    search: 'Search interest',
    hiring: 'LinkedIn hiring',
    x: 'X (Twitter) presence',
  };
  return map[key] || key;
}

export { formatField, confidenceLabels };

export function CardSources({ company, fields = [] }) {
  const ds = company?.dataSources;
  if (!ds) return null;
  const keys = fields.length ? fields : Object.keys(ds);
  return (
    <div className="card-sources">
      {keys.map((k) =>
        ds[k] ? <SourceFootnote key={k} source={ds[k]} field={formatField(k)} /> : null
      )}
    </div>
  );
}
