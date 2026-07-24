import { Card, Stat, Loading, ErrorState, Pill } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, momentumTone } from '../hooks/useExecutive';
import { formatUsd } from '../api';

export default function Momentum() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company } = data;
  const { momentum } = executive;
  const trend = company.searchMetrics?.trend || [];
  const labels = company.searchMetrics?.monthLabels || trend.map((_, i) => `M${i + 1}`);
  const revPerEmp = momentum.revenuePerEmployee;

  return (
    <div className="page page--momentum">
      <div className="hero hero--compact">
        <h1>Momentum</h1>
        <p className="lede">
          Directional indicators for {company.name} — search interest, hiring velocity, signal activity,
          and competitive position vs peers.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat
          label="Overall momentum"
          value={`${momentum.overallScore}/100`}
          hint={`Direction: ${momentum.direction}`}
        />
        {revPerEmp != null && (
          <Stat
            label="Revenue / employee"
            value={formatUsd(revPerEmp)}
            hint={
              momentum.peerRevenuePerEmployee
                ? `Peer avg ${formatUsd(momentum.peerRevenuePerEmployee)}`
                : 'Efficiency proxy'
            }
          />
        )}
        <Stat label="Dimensions tracked" value={momentum.dimensions.length} />
        <Stat label="Search trend points" value={trend.length} hint="12-month modeled index" />
      </div>

      <div className="grid grid--2">
        <Card title="Momentum dimensions" subtitle="Computed from live corpus" collapsible defaultOpen>
          <BarChart
            horizontal
            categories={momentum.dimensions.map((d) => d.label)}
            series={[{ name: 'Score', data: momentum.dimensions.map((d) => d.score) }]}
            height={220}
          />
          <ul className="momentum-list">
            {momentum.dimensions.map((d) => (
              <li key={d.key}>
                <Pill tone={momentumTone(d.direction)}>{d.direction}</Pill>
                <span>
                  <strong>{d.label}</strong> — {d.detail}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Search interest trend" subtitle="Brand/category demand index" collapsible defaultOpen>
          {trend.length > 0 ? (
            <LineChart
              labels={labels.slice(-trend.length)}
              series={[{ name: company.name, data: trend }]}
              height={220}
            />
          ) : (
            <p className="muted">No search trend data.</p>
          )}
          <SourceFootnote source={company.dataSources?.search} />
        </Card>
      </div>
    </div>
  );
}
