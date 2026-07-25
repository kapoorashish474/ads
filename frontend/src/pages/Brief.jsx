import { Link } from 'react-router-dom';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, severityTone } from '../hooks/useExecutive';
import { formatDate } from '../api';

const HORIZON_LABELS = { near: '0–6 mo', mid: '6–18 mo', far: '18+ mo' };
const TYPE_LABELS = {
  hire: 'New hire',
  peer_move: 'Peer move',
  departure: 'Departure',
};

export default function Brief() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company, peers } = data;
  const { brief, momentum, policy } = executive;
  const threats = executive.threats || [];
  const gaps = executive.gaps || [];
  const moves = executive.leadership || [];
  const changes = brief.changes || [];
  const nameMap = Object.fromEntries([company, ...peers].map((c) => [c.slug, c.name]));

  return (
    <div className="page page--brief">
      <div className="hero hero--executive">
        <p className="eyebrow">
          Executive brief · {formatDate(brief.asOf || company.refreshedAt)} · Momentum{' '}
          {momentum.overallScore}/100 ({momentum.direction})
        </p>
        <h1>{company.name}</h1>
        <p className="lede lede--executive">{brief.headline}</p>
      </div>

      <Card title="Recommended decision" subtitle="One move to prioritize this cycle" className="card--decision" collapsible defaultOpen>
        <div className="table-wrap table-wrap--flat">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>This cycle</td>
                <td className="cell-signal">
                  <strong>{brief.decision}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="What changed" subtitle={`${changes.length} recent signals`} collapsible defaultOpen>
        {changes.length === 0 ? (
          <p className="muted">No recent signals in corpus.</p>
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Signal</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={`${c.date}-${c.title}`}>
                    <td className="cell-date">{c.date}</td>
                    <td>{c.company || company.name}</td>
                    <td className="cell-signal">
                      <strong>{c.title}</strong>
                    </td>
                    <td>{c.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/intel?section=signals" className="card-link">
          Full signal feed →
        </Link>
      </Card>

      <Card title="Risk register" subtitle={`${threats.length} ranked threats`} collapsible defaultOpen>
        {threats.length === 0 ? (
          <Empty message="No threats flagged for this company." />
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Horizon</th>
                  <th>Category</th>
                  <th>Threat</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr key={t.title}>
                    <td>
                      <Pill tone={severityTone(t.severity)}>{t.severity}</Pill>
                    </td>
                    <td>{HORIZON_LABELS[t.horizon] || t.horizon}</td>
                    <td>{t.category || '—'}</td>
                    <td>
                      <strong>{t.title}</strong>
                    </td>
                    <td>{t.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {gaps.length > 0 && (
        <Card title="Strategic gaps" subtitle={`${gaps.length} gaps vs peers`} collapsible defaultOpen={false}>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Area</th>
                  <th>Summary</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((g) => (
                  <tr key={`${g.area}-${g.source}`}>
                    <td>
                      <Pill tone={severityTone(g.severity)}>{g.severity}</Pill>
                    </td>
                    <td>{g.source}</td>
                    <td>
                      <strong>{g.area}</strong>
                    </td>
                    <td>{g.summary}</td>
                    <td>
                      {g.score != null ? `${g.score} vs ${g.peerAvg} peer avg` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="brief-details__links">
            <Link to="/products">Product landscape →</Link>
            {' · '}
            <Link to="/suggestions">Suggested actions →</Link>
          </p>
        </Card>
      )}

      {moves.length > 0 && (
        <Card title="Leadership moves" subtitle={`${moves.length} curated moves`} collapsible defaultOpen={false}>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Company</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {moves.map((m) => (
                  <tr key={`${m.date}-${m.name}-${m.company_slug}`}>
                    <td className="cell-date">{m.date}</td>
                    <td>
                      <Pill tone={m.type === 'peer_move' ? 'launch' : 'partnership'}>
                        {TYPE_LABELS[m.type] || m.type}
                      </Pill>
                    </td>
                    <td>{nameMap[m.company_slug] || m.company_slug}</td>
                    <td>
                      <strong>{m.name}</strong>
                    </td>
                    <td>{m.role}</td>
                    <td>{m.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/intel?section=social&channel=linkedin" className="card-link">
            Open roles on LinkedIn →
          </Link>
        </Card>
      )}

      <details className="benefit-details">
        <summary>Methodology</summary>
        <SourceFootnote source={{ label: policy, confidence: 'mixed', asOf: '2026-07' }} />
      </details>
    </div>
  );
}
