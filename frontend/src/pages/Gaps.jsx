import { Link } from 'react-router-dom';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { RadarChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, severityTone } from '../hooks/useExecutive';

export default function Gaps() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company, peers } = data;
  const gaps = executive.gaps || [];
  const insights = company.productInsights;
  const radarIndicators = company.strengthRadar || [];
  const radarSeries = [
    { name: company.name, values: radarIndicators.map((r) => r.value) },
    {
      name: 'Peer avg',
      values: radarIndicators.map((ind) => {
        const vals = peers
          .map((p) => p.strengthRadar?.find((r) => r.label === ind.label)?.value)
          .filter(Boolean);
        return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      }),
    },
  ];

  return (
    <div className="page page--gaps">
      <div className="hero hero--compact">
        <h1>Strategic gaps</h1>
        <p className="lede">
          Where {company.name} trails peers on radar scores and product coverage — with implications
          for roadmap and GTM.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Gaps identified" value={gaps.length} />
        <Stat label="Critical gaps" value={gaps.filter((g) => g.severity === 'critical').length} />
        <Stat label="Product gaps" value={gaps.filter((g) => g.source === 'product').length} />
      </div>

      {insights && (
        <Card title={insights.headline} subtitle="Product landscape read" collapsible defaultOpen>
          <ul className="takeaway-list">
            {(insights.takeaways || []).map((t) => (
              <li key={t.title} className={`takeaway takeaway--${t.type}`}>
                <Pill>{t.type}</Pill>
                <strong>{t.title}</strong>
                <p>{t.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid--2">
        <Card title="Gap register" subtitle="Prioritized weaknesses" collapsible defaultOpen>
          {gaps.length === 0 ? (
            <Empty message="No material gaps vs peers in current corpus." />
          ) : (
            <ul className="gap-list">
              {gaps.map((g) => (
                <li key={`${g.area}-${g.source}`} className="gap-list__item">
                  <div className="gap-list__meta">
                    <Pill tone={severityTone(g.severity)}>{g.severity}</Pill>
                    <span className="muted">{g.source}</span>
                  </div>
                  <strong>{g.area}</strong>
                  <p>{g.summary}</p>
                  {g.score != null && (
                    <p className="muted">
                      Score {g.score} vs peer avg {g.peerAvg}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Link to="/suggestions" className="card-link">
            See suggested actions →
          </Link>
        </Card>

        <Card title="Radar vs peers" subtitle="Visual gap map" collapsible defaultOpen>
          <RadarChart indicators={radarIndicators} series={radarSeries} />
          <CardSources company={company} fields={['radar']} />
        </Card>
      </div>
    </div>
  );
}
