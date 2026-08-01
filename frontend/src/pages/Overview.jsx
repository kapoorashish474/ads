import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Empty } from '../components/ui';
import { DonutChart, RadarChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import ResearchActivityTable from '../components/ResearchActivityTable';
import { useCompany } from '../context/CompanyContext';
import { api, formatUsd, formatUsdPerEmployee, revenuePerEmployee } from '../api';
import { derivedSource, metricLabel } from '../lib/authenticity';
import { searchMomentum } from '../utils/metrics';
import {
  buildResearchActivityRows,
  resolveResearchAsOf,
} from '../utils/researchActivity';

export default function Overview() {
  const { data, loading, error, slug } = useCompany();
  const [intel, setIntel] = useState({ signals: [], jobs: [], posts: [] });
  const [intelLoading, setIntelLoading] = useState(true);

  useEffect(() => {
    setIntelLoading(true);
    Promise.all([api.signals(slug), api.hiring(slug), api.xPosts(slug)])
      .then(([signalsRes, hiringRes, xRes]) => {
        setIntel({
          signals: signalsRes.signals || [],
          jobs: hiringRes.jobs || [],
          posts: xRes.posts || [],
        });
      })
      .catch(() => setIntel({ signals: [], jobs: [], posts: [] }))
      .finally(() => setIntelLoading(false));
  }, [slug]);

  const company = data?.company;

  const asOf = useMemo(
    () => resolveResearchAsOf({ company, ...intel, slug }),
    [company, intel, slug]
  );

  const asOfLabel = asOf.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const activityRows = useMemo(
    () => buildResearchActivityRows({ slug, ...intel, asOf }),
    [slug, intel, asOf]
  );

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!company) return <Empty message="Could not load company data." />;

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

      <Card
        title="Research activity"
        subtitle={`Inferred focus from public corpus · ${company.name}`}
        className="dashboard-activity-card"
      >
        {intelLoading ? (
          <p className="muted research-activity__loading">Loading research corpus…</p>
        ) : (
          <ResearchActivityTable rows={activityRows} asOfLabel={asOfLabel} />
        )}
      </Card>

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
