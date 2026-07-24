import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, severityTone } from '../hooks/useExecutive';

const HORIZON_LABELS = { near: '0–6 mo', mid: '6–18 mo', far: '18+ mo' };

export default function Threats() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const threats = executive.threats || [];
  const critical = threats.filter((t) => t.severity === 'critical').length;
  const near = threats.filter((t) => t.horizon === 'near').length;

  return (
    <div className="page page--threats">
      <div className="hero hero--compact">
        <h1>Threats & risks</h1>
        <p className="lede">
          Competitive, budget, platform, and regulatory risks ranked for {data.company.name} — sourced
          from peer moves, product gaps, and market signals.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Total threats" value={threats.length} />
        <Stat label="Critical / high" value={critical + threats.filter((t) => t.severity === 'high').length} />
        <Stat label="Near-term" value={near} hint={HORIZON_LABELS.near} />
      </div>

      <Card title="Risk register" subtitle="Severity × time horizon" collapsible defaultOpen>
        {threats.length === 0 ? (
          <Empty message="No threats in corpus for this company." />
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Horizon</th>
                  <th>Category</th>
                  <th>Threat</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr key={t.title}>
                    <td>
                      <Pill tone={severityTone(t.severity)}>{t.severity}</Pill>
                    </td>
                    <td>{HORIZON_LABELS[t.horizon] || t.horizon}</td>
                    <td>{t.category}</td>
                    <td>
                      <strong>{t.title}</strong>
                      <p className="muted table-note">{t.summary}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SourceFootnote source={{ label: executive.policy, confidence: 'mixed', asOf: '2026-07' }} />
      </Card>
    </div>
  );
}
