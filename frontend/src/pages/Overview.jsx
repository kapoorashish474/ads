import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { DonutChart, BarChart, RadarChart } from '../components/Charts';
import { CardSources, SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd } from '../api';

export default function Overview() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};
  const peerAvg =
    peers.length > 0
      ? Math.round(peers.reduce((s, p) => s + (p.strengthRadar?.[2]?.value || 0), 0) / peers.length)
      : 0;

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

  const revenueCompare = [
    { name: company.name, value: company.adRevenueUsd / 1e6 },
    ...peers.slice(0, 4).map((p) => ({ name: p.name, value: p.adRevenueUsd / 1e6 })),
  ].sort((a, b) => b.value - a.value);

  return (
    <div className="page">
      <div className="hero">
        <p className="eyebrow">Compared to {peers.length} peers · public sources marked</p>
        <h1>{company.name}</h1>
        <p className="lede">{company.tagline}</p>
      </div>

      <div className="grid grid--stats">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat label="Employees" value={company.employees?.toLocaleString() || '—'} source={ds.employees} />
        <Stat label="Peer programmatic avg" value={`${peerAvg}/100`} hint="vs your radar" source={ds.radar} />
        <Stat label="Products tracked" value={company.products?.length || 0} source={ds.products} />
      </div>

      <div className="grid grid--2">
        <Card title="Strength vs peers" subtitle="Radar — higher is stronger">
          <RadarChart indicators={radarIndicators} series={radarSeries} />
          <CardSources company={company} fields={['radar']} />
        </Card>
        <Card title="Revenue mix" subtitle="Where they earn">
          <DonutChart data={company.revenueSegments || []} />
          <CardSources company={company} fields={['segments']} />
        </Card>
      </div>

      <Card title="Scale vs peers" subtitle="Ad revenue ($M)">
        <BarChart
          horizontal
          categories={revenueCompare.map((r) => r.name)}
          series={[{ name: 'Revenue ($M)', data: revenueCompare.map((r) => Math.round(r.value)) }]}
        />
        <SourceFootnote source={ds.revenue} field="Revenue" />
      </Card>

      <Card title="Why they're winning">
        <ul className="list">
          {(company.winning || []).map((w, i) => (
            <li key={i}>
              <span className="list__score">{w.strength}/5</span>
              {w.text}
            </li>
          ))}
        </ul>
        <CardSources company={company} fields={['winning']} />
      </Card>
    </div>
  );
}
