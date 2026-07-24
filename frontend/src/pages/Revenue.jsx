import { Card, Loading, ErrorState } from '../components/ui';
import { DonutChart, BarChart, LineChart } from '../components/Charts';
import { CardSources, SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd } from '../api';

export default function Revenue() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};
  const segments = company.revenueSegments || [];
  const all = [company, ...peers.slice(0, 3)];
  const segmentNames = [...new Set(all.flatMap((c) => (c.revenueSegments || []).map((s) => s.name)))];

  const stackedSeries = all.map((c) => ({
    name: c.name,
    data: segmentNames.map((name) => {
      const seg = (c.revenueSegments || []).find((s) => s.name === name);
      return seg ? seg.pct : 0;
    }),
  }));

  const labels = company.searchMetrics?.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendSeries = [
    { name: company.name, data: company.searchMetrics?.trend || [] },
    ...(peers[0]
      ? [{ name: peers[0].name, data: peers[0].searchMetrics?.trend || [] }]
      : []),
  ];

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>Revenue</h1>
        <p className="lede">
          {formatUsd(company.adRevenueUsd)} total · {company.revenueLabel}
        </p>
        <SourceFootnote source={ds.revenue} />
      </div>

      <div className="grid grid--2">
        <Card title={`${company.name} — segments`}>
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

      <Card title="Segment mix vs peers" subtitle="% of ad revenue">
        <BarChart categories={segmentNames} series={stackedSeries} height={340} />
        <SourceFootnote source={ds.segments} field="Segments" />
      </Card>

      <Card title="Market attention proxy" subtitle="Search interest index (12 mo)">
        <LineChart labels={labels} series={trendSeries} />
        <SourceFootnote source={ds.search} field="Search" />
      </Card>
    </div>
  );
}
