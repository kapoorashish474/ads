import { Card, Stat, Loading, ErrorState, Empty } from '../components/ui';
import { DonutChart, RadarChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd, formatUsdPerEmployee, revenuePerEmployee } from '../api';
import { derivedSource, metricLabel } from '../lib/authenticity';
import { searchMomentum } from '../utils/metrics';

export default function Overview() {
  const { data, loading, error } = useCompany();

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data?.company) return <Empty message="Could not load company data." />;

  const { company } = data;
  const ds = company.dataSources || {};
  const radar = company.strengthRadar || [];
  const search = searchMomentum(
    company.searchMetrics?.trend,
    company.searchMetrics,
    ds.search?.asOf || company.refreshedAt
  );
  const rpeSource = derivedSource(ds.revenue, ds.employees);

  return (
    <div className="page page--dashboard">
      <div className="hero hero--compact">
        <p className="eyebrow">{company.type || 'Watch list'}</p>
        <h1>{company.name}</h1>
        <p className="lede">{company.tagline}</p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat
          label="Revenue / employee"
          value={formatUsdPerEmployee(revenuePerEmployee(company))}
          hint="Ad revenue ÷ headcount"
          source={rpeSource}
        />
        <Stat
          label={metricLabel('Search index', ds.search)}
          value={search?.index ?? '—'}
          hint={
            search?.latestMonth
              ? `${search.latestMonth}${search.changePct != null ? ` · ${search.changePct > 0 ? '+' : ''}${search.changePct}% vs ${search.startMonth || 'start'}` : ''}`
              : 'Market attention trend'
          }
          source={ds.search}
        />
        <Stat label="Employees" value={company.employees?.toLocaleString() || '—'} source={ds.employees} />
      </div>

      <div className="dashboard-section grid grid--2">
        <Card title="Revenue mix" subtitle="Where this company earns">
          <DonutChart data={company.revenueSegments || []} />
          <CardSources company={company} fields={['segments']} />
        </Card>

        <Card
          title={metricLabel('Strength profile', ds.radar)}
          subtitle="Modeled capability scores for this company"
        >
          {radar.length === 0 ? (
            <p className="muted">No strength profile data for this company.</p>
          ) : (
            <RadarChart
              indicators={radar}
              series={[{ name: company.name, values: radar.map((r) => r.value) }]}
              height={300}
              note="Each axis = strength dimension (0–100) for this company."
            />
          )}
          <CardSources company={company} fields={['radar']} />
        </Card>
      </div>
    </div>
  );
}
