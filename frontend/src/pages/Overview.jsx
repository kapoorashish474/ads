import { Link } from 'react-router-dom';
import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { DonutChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd } from '../api';

export default function Overview() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};

  return (
    <div className="page">
      <div className="hero">
        <p className="eyebrow">Compared to {peers.length} peers</p>
        <h1>{company.name}</h1>
        <p className="lede">{company.tagline}</p>
        <Link to="/brief" className="btn btn--ghost hero__cta">
          Open executive brief →
        </Link>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat label="Employees" value={company.employees?.toLocaleString() || '—'} source={ds.employees} />
        <Stat label="Products tracked" value={company.products?.length || 0} source={ds.products} />
      </div>

      <div className="grid grid--2">
        <Card title="Revenue mix" subtitle="Where they earn · see Revenue for peer comparison" collapsible defaultOpen>
          <DonutChart data={company.revenueSegments || []} />
          <CardSources company={company} fields={['segments']} />
          <Link to="/revenue" className="card-link">
            Full revenue analysis →
          </Link>
        </Card>

        <Card title="Why they're winning" collapsible defaultOpen>
          <ul className="list">
            {(company.winning || []).map((w, i) => (
              <li key={i}>
                <span className="list__score">{w.strength}/5</span>
                {w.text}
              </li>
            ))}
          </ul>
          <CardSources company={company} fields={['winning']} />
          <Link to="/products" className="card-link">
            Product landscape & gaps →
          </Link>
        </Card>
      </div>
    </div>
  );
}
