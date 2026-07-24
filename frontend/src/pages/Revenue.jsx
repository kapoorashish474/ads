import { Card, Stat, Loading, ErrorState, Empty } from '../components/ui';
import { DonutChart, StackedBarChart, LineChart } from '../components/Charts';
import { CardSources, SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { formatUsd } from '../api';
import {
  SEGMENT_BUCKETS,
  normalizeSegmentMix,
  segmentComparison,
  segmentInsights,
} from '../utils/segments';

export default function Revenue() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};
  const segments = company.revenueSegments || [];
  const compareSet = [company, ...peers];
  const comparison = segmentComparison(company, peers);
  const insights = segmentInsights(company, peers);
  const peerNames = peers.map((p) => p.name).join(', ');

  const stackedCategories = compareSet.map((c) => c.name);
  const stackedSeries = SEGMENT_BUCKETS.map((bucket) => ({
    name: bucket,
    data: compareSet.map((c) => normalizeSegmentMix(c)[bucket]),
  })).filter((s) => s.data.some((v) => v > 0));

  const labels = company.searchMetrics?.monthLabels || [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const trendSeries = [
    { name: company.name, data: company.searchMetrics?.trend || [] },
    ...(peers[0] ? [{ name: peers[0].name, data: peers[0].searchMetrics?.trend || [] }] : []),
  ];

  return (
    <div className="page page--revenue">
      <div className="hero hero--compact">
        <h1>Revenue</h1>
        <p className="lede">
          {formatUsd(company.adRevenueUsd)} total · {company.revenueLabel}
        </p>
        <SourceFootnote source={ds.revenue} />
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} />
        <Stat label="Revenue segments" value={segments.length} hint="Reported or estimated mix" />
        <Stat label="Peers compared" value={peers.length} hint={peerNames || 'None configured'} />
        <Stat label="Categories in mix" value={comparison.length} hint="Normalized buckets with data" />
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

      <Card
        title="Segment mix vs peers"
        subtitle={`${company.name} vs ${peers.length} peers · normalized categories`}
        collapsible
        defaultOpen
      >
        {peers.length === 0 ? (
          <Empty message="No peers configured — segment comparison unavailable." />
        ) : (
          <>
        {(insights?.over || insights?.under) && (
          <div className="segment-insights">
            {insights.over && <p className="segment-insights__item segment-insights__item--up">{insights.over}</p>}
            {insights.under && (
              <p className="segment-insights__item segment-insights__item--down">{insights.under}</p>
            )}
          </div>
        )}

        <StackedBarChart
          categories={stackedCategories}
          series={stackedSeries}
          height={Math.max(260, compareSet.length * 44)}
        />

        <p className="card-note muted">
          Raw segment labels differ by company (e.g. &quot;Mobile high-impact&quot; vs &quot;Native &amp; display&quot;).
          We map them into shared buckets for peer comparison.
        </p>

        <div className="table-wrap table-wrap--scroll segment-compare-wrap">
          <table className="table table--compact segment-compare">
            <thead>
              <tr>
                <th>Category</th>
                <th>{company.name}</th>
                <th>Peer avg</th>
                <th>Delta</th>
                <th>Mix</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.bucket} className={Math.abs(row.delta) >= 8 ? 'row--focus' : ''}>
                  <td>{row.bucket}</td>
                  <td>{row.yours}%</td>
                  <td className="muted">{row.peerAvg}%</td>
                  <td>
                    <span
                      className={
                        row.delta > 0 ? 'segment-delta segment-delta--up' : row.delta < 0 ? 'segment-delta segment-delta--down' : 'segment-delta'
                      }
                    >
                      {row.delta > 0 ? '+' : ''}
                      {row.delta} pts
                    </span>
                  </td>
                  <td className="segment-compare__bar-cell">
                    <div className="segment-compare__bar" aria-hidden>
                      <span className="segment-compare__bar-you" style={{ width: `${row.yours}%` }} />
                      <span className="segment-compare__bar-peer" style={{ width: `${row.peerAvg}%` }} />
                    </div>
                    <span className="segment-compare__legend">
                      <span className="segment-compare__dot segment-compare__dot--you" /> You
                      <span className="segment-compare__dot segment-compare__dot--peer" /> Peers
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <SourceFootnote source={ds.segments} field="Segments" />
          </>
        )}
      </Card>

      <Card title="Market attention proxy" subtitle="Search interest index (12 mo)">
        <LineChart labels={labels} series={trendSeries} />
        <SourceFootnote source={ds.search} field="Search" />
      </Card>
    </div>
  );
}
