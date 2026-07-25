import { Link } from 'react-router-dom';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, momentumTone, severityTone } from '../hooks/useExecutive';
import { formatDate, formatUsdPerEmployee, revenuePerEmployee } from '../api';

const HORIZON_LABELS = { near: '0–6 mo', mid: '6–18 mo', far: '18+ mo' };
const LANE_LABELS = { marketing: 'Marketing', engineering: 'Engineering' };

function normalizePlaybook(opportunities) {
  if (opportunities && !Array.isArray(opportunities)) {
    return {
      strengths: opportunities.strengths || [],
      actions: opportunities.actions || [],
    };
  }
  const legacy = opportunities || [];
  return {
    strengths: legacy.map((item) => ({ title: item.title, summary: item.summary })),
    actions: [],
  };
}

export default function Brief() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company, peers } = data;
  const { brief, momentum, policy } = executive;
  const threats = (brief.threats || executive.threats || []).slice(0, 3);
  const changes = brief.changes || [];
  const playbook = normalizePlaybook(brief.opportunities);
  const rpe = revenuePerEmployee(company);

  return (
    <div className="page page--brief">
      <div className="hero hero--executive">
        <p className="eyebrow">
          Executive brief · {formatDate(brief.asOf || company.refreshedAt)} · Momentum{' '}
          {momentum.overallScore}/100
        </p>
        <h1>{company.name}</h1>
        <p className="lede lede--executive">{brief.headline}</p>
        <div className="momentum-grid">
          {(momentum.dimensions || []).map((d) => (
            <div key={d.key} className="momentum-chip">
              <span className="momentum-chip__label">{d.label}</span>
              <div className="momentum-chip__score">
                <strong>{d.score}</strong>
                <Pill tone={momentumTone(d.direction)}>{d.direction}</Pill>
              </div>
              <span className="momentum-chip__detail">{d.detail}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="brief-strip grid grid--stats grid--stats-3">
        <div className="stat">
          <span className="stat__label">This cycle</span>
          <strong className="stat__value stat__value--sm">{formatUsdPerEmployee(rpe)}</strong>
          <span className="stat__hint">Revenue / employee</span>
        </div>
        <div className="stat">
          <span className="stat__label">Top threats</span>
          <strong className="stat__value">{threats.length}</strong>
          <span className="stat__hint">Ranked in register below</span>
        </div>
        <div className="stat">
          <span className="stat__label">Recent signals</span>
          <strong className="stat__value">{changes.length}</strong>
          <span className="stat__hint">
            <Link to="/intel/signals">Open feed →</Link>
          </span>
        </div>
      </div>

      {brief.decision && (
        <section className="card card--decision">
          <header className="card__head">
            <div className="card__head-text">
              <h3>Recommended decision</h3>
              <p>One move to prioritize this cycle</p>
            </div>
          </header>
          <div className="card__body">
            <p className="decision-text">{brief.decision}</p>
            <p className="brief-details__links">
              <Link to="/suggestions">See supporting priorities →</Link>
            </p>
          </div>
        </section>
      )}

      {(playbook.strengths.length > 0 || playbook.actions.length > 0) && (
        <Card
          title="Where to lean in"
          subtitle="Exploit strengths · ship the highest-impact moves"
          className="card--lean"
          collapsible
          defaultOpen
        >
          <div className={`lean-grid ${playbook.strengths.length && playbook.actions.length ? 'lean-grid--split' : ''}`}>
            {playbook.strengths.length > 0 && (
              <section className="lean-col">
                <h4 className="lean-col__head">Leverage</h4>
                <ul className="lean-list">
                  {playbook.strengths.map((item) => (
                    <li key={item.title} className="lean-item lean-item--strength">
                      <Pill tone="launch">Strength</Pill>
                      <strong>{item.title}</strong>
                      <p>{item.summary}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {playbook.actions.length > 0 && (
              <section className="lean-col">
                <h4 className="lean-col__head">Ship next</h4>
                <ul className="lean-list">
                  {playbook.actions.map((item) => (
                    <li key={item.title} className="lean-item lean-item--action">
                      <div className="lean-item__meta">
                        <Pill tone={item.priority}>{item.priority}</Pill>
                        {item.lane && (
                          <span className="lean-item__lane">{LANE_LABELS[item.lane] || item.lane}</span>
                        )}
                      </div>
                      <strong>{item.title}</strong>
                      <p>{item.summary}</p>
                      {item.fastPath && (
                        <p className="lean-fast-path">
                          <span>This cycle</span>
                          {item.fastPath}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
          <Link to="/suggestions" className="card-link">
            Full priority register →
          </Link>
        </Card>
      )}

      <Card title="Risk register" subtitle={`Top ${threats.length} threats`} collapsible defaultOpen>
        {threats.length === 0 ? (
          <Empty message="No threats flagged for this company." />
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Horizon</th>
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
        <p className="brief-details__links">
          <Link to="/products">Product gaps →</Link>
          {' · '}
          <Link to="/suggestions">Suggested actions →</Link>
        </p>
      </Card>

      {changes.length > 0 && (
        <Card title="What changed" subtitle={`${changes.length} recent signals`} collapsible defaultOpen={false}>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {changes.map((c) => (
                  <tr key={`${c.date}-${c.title}`}>
                    <td className="cell-date">{c.date}</td>
                    <td>{c.company || company.name}</td>
                    <td className="cell-signal">
                      <strong>{c.title}</strong>
                      <p className="muted table-note">{c.summary}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <details className="benefit-details">
        <summary>Methodology</summary>
        <SourceFootnote source={{ label: policy, confidence: 'mixed', asOf: '2026-07' }} />
      </details>
    </div>
  );
}
