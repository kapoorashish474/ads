import { Link } from 'react-router-dom';
import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { DonutChart, RadarChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd, formatUsdPerEmployee, revenuePerEmployee, revenuePerEmployeeHint } from '../api';
import { peerRadarAverages, radarRank, searchMomentum } from '../utils/metrics';

export default function Overview() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};
  const radar = company.strengthRadar || [];
  const search = searchMomentum(company.searchMetrics?.trend);
  const position = radarRank(company, peers);
  const peerRadar = peerRadarAverages(peers, radar);

  return (
    <div className="page">
      <div className="hero">
        <p className="eyebrow">
          {peers.length} peers · {position ? `#${position.rank} competitive position` : 'Peer comparison'}
        </p>
        <h1>{company.name}</h1>
        <p className="lede">{company.tagline}</p>
        <Link to="/" className="btn btn--ghost hero__cta">
          Open executive brief →
        </Link>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat
          label="Revenue / employee"
          value={formatUsdPerEmployee(revenuePerEmployee(company))}
          hint={revenuePerEmployeeHint(company, peers)}
        />
        <Stat
          label="Search index"
          value={search?.index ?? '—'}
          hint={
            search?.changePct != null
              ? `${search.changePct > 0 ? '+' : ''}${search.changePct}% vs start of period`
              : 'Market attention trend'
          }
          source={ds.search}
        />
        <Stat label="Employees" value={company.employees?.toLocaleString() || '—'} source={ds.employees} />
      </div>

      <div className="grid grid--2">
        <Card title="Revenue mix" subtitle="Where they earn" collapsible defaultOpen>
          <DonutChart data={company.revenueSegments || []} />
          <CardSources company={company} fields={['segments']} />
          <Link to="/revenue" className="card-link">
            Segment comparison vs peers →
          </Link>
        </Card>

        <Card
          title="Competitive position"
          subtitle={position ? `${position.avg}/100 avg · vs peer set` : 'Strength radar'}
          collapsible
          defaultOpen
        >
          {radar.length === 0 ? (
            <p className="muted">No radar data for this company.</p>
          ) : (
            <RadarChart
              indicators={radar}
              series={[
                { name: company.name, values: radar.map((r) => r.value) },
                { name: 'Peer avg', values: peerRadar },
              ]}
              height={300}
            />
          )}
          <CardSources company={company} fields={['radar']} />
          <Link to="/products" className="card-link">
            Product gaps & landscape →
          </Link>
        </Card>
      </div>
    </div>
  );
}
