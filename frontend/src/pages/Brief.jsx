import { Link } from 'react-router-dom';
import { Card, Stat, Loading, ErrorState, Pill } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive } from '../hooks/useExecutive';
import { formatDate } from '../api';

export default function Brief() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company } = data;
  const { brief, momentum, policy } = executive;

  return (
    <div className="page page--brief">
      <div className="hero hero--executive">
        <p className="eyebrow">Executive brief · {formatDate(brief.asOf || company.refreshedAt)}</p>
        <h1>{company.name}</h1>
        <p className="lede lede--executive">{brief.headline}</p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat
          label="Momentum score"
          value={`${momentum.overallScore}/100`}
          hint={`Trend ${momentum.direction}`}
        />
        <Stat label="Active threats" value={executive.threats.length} hint="Ranked by severity" />
        <Stat label="Strategic gaps" value={executive.gaps.length} hint="Radar + product gaps" />
        <Stat label="Leadership moves" value={executive.leadership.length} hint="Hires & peer shifts" />
      </div>

      <Card title="Recommended decision" subtitle="One move to prioritize this cycle" className="card--decision" collapsible defaultOpen>
        <p className="decision-text">{brief.decision}</p>
      </Card>

      <div className="grid grid--2">
        <Card title="What changed" subtitle="Latest signals in your watch list" collapsible defaultOpen>
          {(brief.changes || []).length === 0 ? (
            <p className="muted">No recent signals in corpus.</p>
          ) : (
            <ul className="brief-list">
              {brief.changes.map((c) => (
                <li key={`${c.date}-${c.title}`} className="brief-list__item">
                  <div className="brief-list__meta">
                    <Pill tone="launch">{c.company || company.name}</Pill>
                    <span className="muted">{c.date}</span>
                  </div>
                  <strong>{c.title}</strong>
                  <p>{c.summary}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Top threats" subtitle="What could hurt you" collapsible defaultOpen>
          {(brief.threats || []).length === 0 ? (
            <p className="muted">No threats flagged.</p>
          ) : (
            <ul className="brief-list">
              {brief.threats.map((t) => (
                <li key={t.title} className="brief-list__item">
                  <div className="brief-list__meta">
                    <Pill tone={t.severity === 'critical' ? 'critical' : 'launch'}>{t.severity}</Pill>
                    <span className="muted">{t.category}</span>
                  </div>
                  <strong>{t.title}</strong>
                  <p>{t.summary}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/threats" className="card-link">
            View all threats →
          </Link>
        </Card>
      </div>

      <Card title="Opportunities" subtitle="Where you can win" collapsible defaultOpen>
        <ul className="takeaway-list">
          {(brief.opportunities || []).map((o) => (
            <li key={o.title} className="takeaway takeaway--strength">
              <strong>{o.title}</strong>
              <p>{o.summary}</p>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Quick links" subtitle="Drill into detail" collapsible defaultOpen={false}>
        <div className="link-grid">
          <Link to="/momentum" className="link-card">
            Momentum metrics
          </Link>
          <Link to="/gaps" className="link-card">
            Strategic gaps
          </Link>
          <Link to="/leadership" className="link-card">
            Leadership moves
          </Link>
          <Link to="/suggestions" className="link-card">
            Action suggestions
          </Link>
        </div>
        <SourceFootnote source={{ label: policy, confidence: 'mixed', asOf: '2026-07' }} />
      </Card>
    </div>
  );
}
