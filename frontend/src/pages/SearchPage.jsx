import { useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { compareRows, deltaVsPeers, focusRank, peerAverage } from '../utils/intelCompare';
import { metricLabel } from '../lib/authenticity';
import { alignSearchSeries, alignTrendToLength, searchPeriodSubtitle } from '../utils/searchLabels';

export default function SearchPage({ embedded = false }) {
  const { data, loading, error, slug, compareMode } = useCompany();
  const [regionName, setRegionName] = useState(null);

  const compareMetrics = useMemo(() => {
    if (!data?.company) return [];
    const { company, peers } = data;
    const asOf = company.searchMetrics?.source?.asOf || company.refreshedAt;
    const counts = {};
    [company, ...peers].forEach((c) => {
      const aligned = alignSearchSeries(c.searchMetrics, asOf);
      counts[c.slug] = aligned.focusIndex ?? 0;
    });
    return compareRows(company, peers, counts);
  }, [data]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const sm = company.searchMetrics || {};
  const regions = sm.regions || [];
  const asOf = sm.source?.asOf || company.refreshedAt;
  const globalSeries = alignSearchSeries(sm, asOf);
  const { trend, labels, focusIndex, periodChange, period } = globalSeries;
  const periodSubtitle = searchPeriodSubtitle(sm, asOf);
  const activeRegion = regions.find((r) => r.name === regionName) || regions[0];
  const regionalSeries = activeRegion
    ? alignSearchSeries(sm, asOf, activeRegion.trend || [])
    : null;

  const peerIndexCounts = {};
  peers.forEach((p) => {
    const aligned = alignSearchSeries(p.searchMetrics, p.searchMetrics?.source?.asOf || asOf);
    peerIndexCounts[p.slug] = aligned.focusIndex ?? 0;
  });
  const avgPeerIndex = peerAverage(peers, peerIndexCounts);
  const indexDelta = deltaVsPeers(focusIndex, avgPeerIndex);
  const indexRank = focusRank(compareMetrics, slug);

  const compareSeries = compareMode
    ? [
        { name: company.name, data: trend },
        ...peers.map((p) => ({
          name: p.name,
          data: alignTrendToLength(p.searchMetrics?.trend || [], labels.length),
        })),
      ]
    : [
        { name: company.name, data: trend },
        ...peers.slice(0, 2).map((p) => ({
          name: p.name,
          data: alignTrendToLength(p.searchMetrics?.trend || [], labels.length),
        })),
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
          <h1>{metricLabel('Search interest', company.dataSources?.search)}</h1>
          <p className="lede">
            {compareMode
              ? `Modeled market attention index — ${company.name} vs ${peers.length} peers globally and by region.`
              : `Modeled index of how the market finds ${company.name} — global and by region. Not live Google Trends data.`}
          </p>
        </div>
      )}

      {compareMode && (
        <>
          <div className="grid grid--stats grid--stats-4">
            <Stat label={`${company.name} index`} value={focusIndex} hint={indexDelta.text} source={company.dataSources?.search} />
            <Stat label="Peer average" value={avgPeerIndex} hint="Modeled global index (0–100)" source={company.dataSources?.search} />
            <Stat label="Your rank" value={indexRank ? `#${indexRank}` : '—'} hint="Among watch list" />
            <Stat label="Top region" value={activeRegion?.name || '—'} hint={`${activeRegion?.sharePct ?? activeRegion?.value ?? 0}% share`} />
          </div>

          <Card title="Modeled global interest vs peers" subtitle={periodSubtitle}>
            <LineChart
              labels={labels}
              series={compareSeries}
              height={300}
              xAxisLabel="Month"
              yAxisLabel="Search index (0–100)"
            />
            <SourceFootnote source={sm.source || company.dataSources?.search} />
          </Card>

          <Card title="Primary region share" subtitle="Top region per company">
            <BarChart
              horizontal
              categories={regionalCompare.map((r) => r.name)}
              series={[{ name: 'Share %', data: regionalCompare.map((r) => r.share) }]}
              height={Math.max(220, regionalCompare.length * 40)}
              xAxisLabel="Share of search interest (%)"
              yAxisLabel="Company"
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
      <div className="grid grid--stats grid--stats-3">
        <Stat
          label={metricLabel('Global index', company.dataSources?.search)}
          value={focusIndex ?? '—'}
          hint={period?.end ? `Latest · ${period.end}` : 'Normalized 0–100'}
          source={company.dataSources?.search}
        />
        <Stat
          label="12-month change"
          value={periodChange != null ? `${periodChange > 0 ? '+' : ''}${periodChange}%` : '—'}
          hint={
            period
              ? `${period.start} → ${period.end}`
              : 'Vs start of rolling period'
          }
          source={company.dataSources?.search}
        />
        <Stat
          label="Latest month"
          value={period?.end ?? '—'}
          hint={sm.source?.asOf ? `Index through ${sm.source.asOf}` : 'Rolling 12-month window'}
          source={sm.source || company.dataSources?.search}
        />
      </div>

      <Card title="Modeled 12-month interest index" subtitle={periodSubtitle}>
        <LineChart
          labels={labels}
          series={compareSeries}
          height={280}
          xAxisLabel="Month"
          yAxisLabel="Search index (0–100)"
        />
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
            <div className="region-detail__stats">
              <div className="stat stat--compact">
                <span className="stat__label">{activeRegion.name} index</span>
                <strong className="stat__value">{regionalSeries?.focusIndex ?? '—'}</strong>
                <span className="stat__hint">
                  {period?.end ? `Latest · ${period.end}` : 'Regional normalized index'}
                </span>
              </div>
            </div>
            <p className="region-detail__insight">{activeRegion.insight}</p>
            <div className="region-detail__grid">
              <div className="region-detail__panel">
                <h4>{period ? `Trend · ${period.start} – ${period.end}` : '12-month trend'}</h4>
                <LineChart
                  labels={regionalSeries?.labels ?? labels}
                  series={[{ name: activeRegion.name, data: regionalSeries?.trend ?? [] }]}
                  height={200}
                  xAxisLabel="Month"
                  yAxisLabel="Regional search index (0–100)"
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
