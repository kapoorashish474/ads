import { useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { compareRows, deltaVsPeers, focusRank, peerAverage } from '../utils/intelCompare';

export default function SearchPage({ embedded = false }) {
  const { data, loading, error, slug, compareMode } = useCompany();
  const [regionName, setRegionName] = useState(null);

  const compareMetrics = useMemo(() => {
    if (!data?.company) return [];
    const { company, peers } = data;
    const counts = {};
    [company, ...peers].forEach((c) => {
      const trend = c.searchMetrics?.trend || [];
      counts[c.slug] = trend.length ? trend[trend.length - 1] : 0;
    });
    return compareRows(company, peers, counts);
  }, [data]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const sm = company.searchMetrics || {};
  const trend = sm.trend || [];
  const regions = sm.regions || [];
  const labels = sm.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const activeRegion = regions.find((r) => r.name === regionName) || regions[0];
  const focusIndex = trend.length ? trend[trend.length - 1] : 0;

  const peerIndexCounts = {};
  peers.forEach((p) => {
    const t = p.searchMetrics?.trend || [];
    peerIndexCounts[p.slug] = t.length ? t[t.length - 1] : 0;
  });
  const avgPeerIndex = peerAverage(peers, peerIndexCounts);
  const indexDelta = deltaVsPeers(focusIndex, avgPeerIndex);
  const indexRank = focusRank(compareMetrics, slug);

  const compareSeries = compareMode
    ? [
        { name: company.name, data: trend },
        ...peers.map((p) => ({ name: p.name, data: p.searchMetrics?.trend || [] })),
      ]
    : [
        { name: company.name, data: trend },
        ...peers.slice(0, 2).map((p) => ({ name: p.name, data: p.searchMetrics?.trend || [] })),
      ];

  const regionalCompare = [company, ...peers].map((c) => {
    const region = (c.searchMetrics?.regions || [])[0];
    return {
      name: c.name,
      slug: c.slug,
      share: region?.sharePct ?? region?.value ?? 0,
      change: region?.changePct ?? 0,
      topRegion: region?.name || '—',
    };
  });

  return (
    <div className={embedded ? 'intel-panel' : 'page'}>
      {!embedded && (
        <div className="hero hero--compact">
          <h1>Search interest</h1>
          <p className="lede">
            {compareMode
              ? `Market attention index — ${company.name} vs ${peers.length} peers globally and by region.`
              : `How the market finds ${company.name} — global and by region`}
          </p>
        </div>
      )}

      {compareMode && (
        <>
          <div className="grid grid--stats grid--stats-4">
            <Stat label={`${company.name} index`} value={focusIndex} hint={indexDelta.text} />
            <Stat label="Peer average" value={avgPeerIndex} hint="Global index (0–100)" />
            <Stat label="Your rank" value={indexRank ? `#${indexRank}` : '—'} hint="Among watch list" />
            <Stat label="Top region" value={activeRegion?.name || '—'} hint={`${activeRegion?.sharePct ?? activeRegion?.value ?? 0}% share`} />
          </div>

          <Card title="Global interest vs peers" subtitle="12-month normalized index (0–100)">
            <LineChart labels={labels} series={compareSeries} height={300} />
            <SourceFootnote source={sm.source || company.dataSources?.search} />
          </Card>

          <Card title="Primary region share" subtitle="Top region per company">
            <BarChart
              horizontal
              categories={regionalCompare.map((r) => r.name)}
              series={[{ name: 'Share %', data: regionalCompare.map((r) => r.share) }]}
              height={Math.max(220, regionalCompare.length * 40)}
            />
            <div className="table-wrap table-wrap--flat">
              <table className="table table--compact">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Top region</th>
                    <th>Share</th>
                    <th>YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {regionalCompare.map((r) => (
                    <tr key={r.slug} className={r.slug === slug ? 'row--focus' : ''}>
                      <td>{r.name}</td>
                      <td>{r.topRegion}</td>
                      <td>{r.share}%</td>
                      <td>
                        <Pill tone={r.change >= 10 ? 'up' : 'default'}>
                          {r.change >= 0 ? '+' : ''}
                          {r.change}%
                        </Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {!compareMode && (
      <>
      <Card title="12-month interest index" subtitle="Global normalized index (0–100)">
        <LineChart labels={labels} series={compareSeries} height={280} />
        <SourceFootnote source={sm.source || company.dataSources?.search} />
      </Card>
      </>
      )}

      <Card title="Regional search" subtitle="Click a region for detail">
        <div className="region-table-wrap">
          <table className="table table--compact region-table">
            <thead>
              <tr>
                <th>Region</th>
                <th>Share</th>
                <th>YoY</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((r) => {
                const share = r.sharePct ?? r.value ?? 0;
                const isActive = activeRegion?.name === r.name;
                return (
                  <tr
                    key={r.name}
                    className={`region-table__row ${isActive ? 'region-table__row--active' : ''}`}
                    onClick={() => setRegionName(r.name)}
                  >
                    <td className="region-table__name">{r.name}</td>
                    <td className="region-table__share">
                      <div className="region-table__bar" aria-hidden>
                        <span className="region-table__fill" style={{ width: `${share}%` }} />
                      </div>
                      <span>{share}%</span>
                    </td>
                    <td>
                      <Pill tone={(r.changePct ?? 0) >= 10 ? 'up' : 'default'}>
                        {(r.changePct ?? 0) >= 0 ? '+' : ''}
                        {r.changePct ?? 0}%
                      </Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {activeRegion && (
          <div className="region-detail">
            <p className="region-detail__insight">{activeRegion.insight}</p>
            <div className="region-detail__grid">
              <div className="region-detail__panel">
                <h4>12-month trend</h4>
                <LineChart
                  labels={labels}
                  series={[{ name: activeRegion.name, data: activeRegion.trend || [] }]}
                  height={200}
                />
              </div>
              <div className="region-detail__panel">
                <h4>Top metros</h4>
                <ul className="region-detail__metros">
                  {(activeRegion.metros || []).map((m) => (
                    <li key={m.name}>
                      <span>{m.name}</span>
                      <span className="region-detail__metro-index">{m.index}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {(activeRegion.topQueries || []).length > 0 && (
              <table className="table table--compact region-detail__queries">
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>Index</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRegion.topQueries.map((q) => (
                    <tr key={q.query}>
                      <td>{q.query}</td>
                      <td>{q.index}</td>
                      <td>
                        <Pill tone={q.change?.startsWith('+') ? 'up' : 'default'}>{q.change}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <SourceFootnote source={sm.source || company.dataSources?.search} field="Regional search" />
      </Card>

      <Card title="Global top queries">
        <ul className="list list--plain">
          {(sm.queries || []).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
