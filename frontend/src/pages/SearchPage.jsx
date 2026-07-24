import { useState } from 'react';
import { Card, Loading, ErrorState, Pill } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';

export default function SearchPage() {
  const { data, loading, error } = useCompany();
  const [regionName, setRegionName] = useState(null);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const sm = company.searchMetrics || {};
  const trend = sm.trend || [];
  const regions = sm.regions || [];
  const labels = sm.monthLabels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const activeRegion = regions.find((r) => r.name === regionName) || regions[0];

  const compareSeries = [
    { name: company.name, data: trend },
    ...peers.slice(0, 2).map((p) => ({ name: p.name, data: p.searchMetrics?.trend || [] })),
  ];

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>Search interest</h1>
        <p className="lede">How the market finds {company.name} — global and by region</p>
      </div>

      <Card title="12-month interest index" subtitle="Global normalized index (0–100)">
        <LineChart labels={labels} series={compareSeries} height={280} />
        <SourceFootnote source={sm.source || company.dataSources?.search} />
      </Card>

      <Card title="Regional overview" subtitle="Click a region to drill down">
        <div className="scroll-strip">
          <div className="region-grid region-grid--strip">
            {regions.map((r) => (
              <button
                key={r.name}
                type="button"
                className={`region-card ${activeRegion?.name === r.name ? 'region-card--active' : ''}`}
                onClick={() => setRegionName(r.name)}
              >
                <strong>{r.name}</strong>
                <span className="region-card__value">{r.sharePct ?? r.value}% share</span>
                <span className={`region-card__change ${(r.changePct ?? 0) >= 10 ? 'up' : ''}`}>
                  {(r.changePct ?? 0) >= 0 ? '+' : ''}
                  {r.changePct ?? 0}% YoY
                </span>
              </button>
            ))}
          </div>
        </div>
        <BarChart
          horizontal
          categories={regions.map((r) => r.name)}
          series={[{ name: 'Interest share', data: regions.map((r) => r.sharePct ?? r.value) }]}
          height={Math.max(180, regions.length * 48)}
        />
      </Card>

      {activeRegion && (
        <>
          <div className="hero hero--compact">
            <p className="eyebrow">Region deep dive</p>
            <h2>{activeRegion.name}</h2>
            <p className="lede">{activeRegion.insight}</p>
          </div>

          <div className="grid grid--stats">
            <div className="stat">
              <span className="stat__label">Share of search</span>
              <strong className="stat__value">{activeRegion.sharePct ?? activeRegion.value}%</strong>
            </div>
            <div className="stat">
              <span className="stat__label">12-mo change</span>
              <strong className="stat__value">+{activeRegion.changePct ?? 0}%</strong>
            </div>
            <div className="stat">
              <span className="stat__label">Top metro</span>
              <strong className="stat__value">{activeRegion.metros?.[0]?.name || '—'}</strong>
            </div>
          </div>

          <div className="grid grid--2">
            <Card title={`${activeRegion.name} — 12-month trend`}>
              <LineChart
                labels={labels}
                series={[{ name: activeRegion.name, data: activeRegion.trend || [] }]}
              />
            </Card>
            <Card title="Top metros" subtitle="Relative interest within region">
              <BarChart
                horizontal
                categories={(activeRegion.metros || []).map((m) => m.name)}
                series={[{ name: 'Index', data: (activeRegion.metros || []).map((m) => m.index) }]}
              />
            </Card>
          </div>

          <Card title={`Queries in ${activeRegion.name}`} subtitle="What people search for">
            <table className="table">
              <thead>
                <tr>
                  <th>Query</th>
                  <th>Index</th>
                  <th>Change</th>
                </tr>
              </thead>
              <tbody>
                {(activeRegion.topQueries || []).map((q) => (
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
            <SourceFootnote source={sm.source || company.dataSources?.search} field="Regional search" />
          </Card>
        </>
      )}

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
