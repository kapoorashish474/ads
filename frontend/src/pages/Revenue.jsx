import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { DonutChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd, formatUsdPerEmployee, revenuePerEmployee } from '../api';

export default function Revenue() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company } = data;
  const ds = company.dataSources || {};
  const segments = company.revenueSegments || [];

  return (
    <div className="page page--revenue">
      <div className="hero hero--compact">
        <h1>Revenue</h1>
        <p className="lede">Segment mix and revenue metrics for {company.name}.</p>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat
          label="Revenue / employee"
          value={formatUsdPerEmployee(revenuePerEmployee(company))}
          hint="Ad revenue ÷ headcount"
          source={ds.employees}
        />
        <Stat label="Segments" value={segments.length} hint="Reported or estimated mix" source={ds.segments} />
      </div>

      <div className="grid grid--2">
        <Card title="Revenue segments">
          <DonutChart data={segments} />
          <CardSources company={company} fields={['segments']} />
        </Card>
        <Card title="Segment breakdown">
          <table className="table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Share</th>
                <th>$M (est.)</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td>{s.pct}%</td>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
