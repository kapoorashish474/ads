import { useMemo } from 'react';
import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { SourceBadge, formatField, confidenceLabels } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatDate } from '../api';

const CONFIDENCE_LEVELS = [
  { key: 'reported', desc: 'SEC filings, earnings, company IR' },
  { key: 'estimated', desc: 'Industry reports, LinkedIn, analyst models' },
  { key: 'modeled', desc: 'Normalized indices — search trends, radar scores' },
  { key: 'inferred', desc: 'Synthesis across multiple public signals' },
];

export default function SourcesPage() {
  const { data, loading, error } = useCompany();
  const sources = data?.company?.dataSources;

  const confidenceCounts = useMemo(() => {
    const counts = { reported: 0, estimated: 0, modeled: 0, inferred: 0 };
    if (!sources) return counts;
    Object.values(sources).forEach((src) => {
      if (src.confidence && counts[src.confidence] !== undefined) {
        counts[src.confidence] += 1;
      }
    });
    return counts;
  }, [sources]);

  const topConfidence = useMemo(
    () => Object.entries(confidenceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '—',
    [confidenceCounts]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company } = data;
  const entries = Object.entries(sources || {});

  return (
    <div className="page page--sources">
      <div className="hero hero--compact">
        <h1>Sources</h1>
        <p className="lede">
          Public origins and confidence levels for every metric tracked on {company.name}.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Fields tracked" value={entries.length} hint="Across all tabs" />
        <Stat
          label="Most common level"
          value={confidenceLabels[topConfidence] || topConfidence}
          hint="Confidence tag"
        />
        <Stat label="Last refresh" value={formatDate(company.refreshedAt)} hint="Profile data" />
      </div>

      <div className="confidence-legend">
        {CONFIDENCE_LEVELS.map((level) => (
          <div key={level.key} className="confidence-legend__item">
            <SourceBadge confidence={level.key} />
            <p>{level.desc}</p>
            <span className="confidence-legend__count">{confidenceCounts[level.key]} fields</span>
          </div>
        ))}
      </div>

      <Card title="Source registry" subtitle={`${company.name} · ${entries.length} data fields`}>
        <div className="table-wrap table-wrap--flat">
          <table className="table source-registry">
            <thead>
              <tr>
                <th>Field</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>As of</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, src]) => (
                <tr key={key}>
                  <td className="source-registry__field">{formatField(key)}</td>
                  <td className="source-registry__label">
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer">
                        {src.label}
                      </a>
                    ) : (
                      src.label
                    )}
                  </td>
                  <td className="source-registry__badge">
                    <SourceBadge confidence={src.confidence} />
                  </td>
                  <td className="source-registry__asof">{src.asOf || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="sources-footer">
          <p>
            <strong>Signals</strong> cite press pages and trade coverage on the Signals tab.{' '}
            <strong>LinkedIn</strong> and <strong>X</strong> link to public social profiles — no private APIs.
          </p>
        </footer>
      </Card>
    </div>
  );
}
