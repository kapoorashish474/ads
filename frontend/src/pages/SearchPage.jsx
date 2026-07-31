import { useEffect, useState } from 'react';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { LineChart } from '../components/Charts';
import { SourceBadge, SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { metricLabel } from '../lib/authenticity';
import { alignSearchSeries, searchPeriodSubtitle } from '../utils/searchLabels';

function changeTone(value) {
  if (value == null) return 'default';
  if (value >= 10) return 'up';
  if (value < 0) return 'down';
  return 'default';
}

function formatChange(value) {
  if (value == null) return '—';
  return `${value > 0 ? '+' : ''}${value}%`;
}

export default function SearchPage({ embedded = false }) {
  const { data, loading, error, slug } = useCompany();
  const [regionName, setRegionName] = useState(null);

  useEffect(() => {
    setRegionName(null);
  }, [slug]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company } = data;
  const sm = company.searchMetrics || {};
  const regions = sm.regions || [];
  const queries = sm.queries || [];
  const asOf = sm.source?.asOf || company.refreshedAt;
  const searchSource = sm.source || company.dataSources?.search;
  const globalSeries = alignSearchSeries(sm, asOf);
  const { trend, labels, focusIndex, periodChange, period } = globalSeries;
  const periodSubtitle = searchPeriodSubtitle(sm, asOf);
  const activeRegion = regions.find((r) => r.name === regionName) || regions[0];
  const regionalSeries = activeRegion
    ? alignSearchSeries(sm, asOf, activeRegion.trend || [])
    : null;
  const topMetroIndex = Math.max(...(activeRegion?.metros || []).map((m) => m.index), 1);

  return (
    <div className={`search-page ${embedded ? 'search-page--embedded' : 'page page--search'}`}>
      <section className="search-summary" aria-label="Search index summary">
        <div className="search-summary__main">
          <p className="search-summary__eyebrow">{metricLabel('Modeled search index', searchSource)}</p>
          <div className="search-summary__index-row">
            <strong className="search-summary__index">{focusIndex ?? '—'}</strong>
            {periodChange != null && (
              <span className="search-summary__delta">
                <Pill tone={changeTone(periodChange)}>
                  {formatChange(periodChange)} over 12 mo
                </Pill>
              </span>
            )}
          </div>
          <p className="search-summary__period">
            {period ? `${period.start} – ${period.end}` : 'Rolling 12-month window'}
            {asOf ? ` · through ${asOf}` : ''}
          </p>
        </div>
        <div className="search-summary__aside">
          <SourceBadge confidence={searchSource?.confidence} />
          <p className="search-summary__note">
            Normalized 0–100 index for how the market finds {company.name}. Not live Google Trends data.
          </p>
        </div>
      </section>

      <div className="search-layout">
        <Card title="Global interest trend" subtitle={periodSubtitle} className="search-layout__chart">
          {trend.length === 0 ? (
            <Empty message="No search trend data for this company." />
          ) : (
            <LineChart
              labels={labels}
              series={[{ name: company.name, data: trend }]}
              height={300}
              xAxisLabel="Month"
              yAxisLabel="Search index (0–100)"
            />
          )}
          <SourceFootnote source={searchSource} />
        </Card>

        <Card title="Top search terms" subtitle={`${queries.length} tracked globally`} className="search-layout__queries">
          {queries.length === 0 ? (
            <Empty message="No top queries tracked." />
          ) : (
            <ol className="search-query-list">
              {queries.map((query, index) => (
                <li key={query} className="search-query-list__item">
                  <span className="search-query-list__rank">{index + 1}</span>
                  <span className="search-query-list__text">{query}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card
        title="Regional breakdown"
        subtitle={activeRegion ? `${regions.length} regions · ${activeRegion.name} selected` : 'No regional data'}
        className="search-regions"
      >
        {regions.length === 0 ? (
          <Empty message="No regional search data for this company." />
        ) : (
          <>
            <div className="search-region-tabs scroll-x" role="tablist" aria-label="Regions">
              <div className="search-region-tabs__inner">
                {regions.map((region) => {
                  const share = region.sharePct ?? region.value ?? 0;
                  const isActive = activeRegion?.name === region.name;
                  return (
                    <button
                      key={region.name}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`search-region-tab ${isActive ? 'search-region-tab--active' : ''}`}
                      onClick={() => setRegionName(region.name)}
                    >
                      <span className="search-region-tab__name">{region.name}</span>
                      <span className="search-region-tab__meta">
                        {share}% share · {formatChange(region.changePct)} YoY
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeRegion && (
              <div className="search-region-panel">
                <div className="search-region-panel__stats">
                  <div className="search-region-stat">
                    <span className="search-region-stat__label">Share of interest</span>
                    <strong className="search-region-stat__value">
                      {activeRegion.sharePct ?? activeRegion.value ?? '—'}%
                    </strong>
                  </div>
                  <div className="search-region-stat">
                    <span className="search-region-stat__label">Regional index</span>
                    <strong className="search-region-stat__value">{regionalSeries?.focusIndex ?? '—'}</strong>
                  </div>
                  <div className="search-region-stat">
                    <span className="search-region-stat__label">12-month change</span>
                    <strong className="search-region-stat__value">
                      <Pill tone={changeTone(activeRegion.changePct)}>{formatChange(activeRegion.changePct)}</Pill>
                    </strong>
                  </div>
                </div>

                {activeRegion.insight && (
                  <blockquote className="search-region-panel__insight">{activeRegion.insight}</blockquote>
                )}

                <div className="search-region-panel__grid">
                  <div className="search-region-panel__chart">
                    <h4 className="search-region-panel__heading">
                      {period ? `Trend · ${period.start} – ${period.end}` : '12-month trend'}
                    </h4>
                    <LineChart
                      labels={regionalSeries?.labels ?? labels}
                      series={[{ name: activeRegion.name, data: regionalSeries?.trend ?? [] }]}
                      height={220}
                      xAxisLabel="Month"
                      yAxisLabel="Regional index (0–100)"
                    />
                  </div>

                  <div className="search-region-panel__metros">
                    <h4 className="search-region-panel__heading">Top metros</h4>
                    {(activeRegion.metros || []).length === 0 ? (
                      <p className="muted">No metro breakdown for this region.</p>
                    ) : (
                      <ul className="search-metro-list">
                        {(activeRegion.metros || []).map((metro) => (
                          <li key={metro.name} className="search-metro-list__item">
                            <div className="search-metro-list__head">
                              <span>{metro.name}</span>
                              <span className="search-metro-list__index">{metro.index}</span>
                            </div>
                            <div className="search-metro-list__bar" aria-hidden>
                              <span
                                className="search-metro-list__fill"
                                style={{ width: `${Math.round((metro.index / topMetroIndex) * 100)}%` }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {(activeRegion.topQueries || []).length > 0 && (
                  <div className="search-region-panel__queries">
                    <h4 className="search-region-panel__heading">Top queries in region</h4>
                    <div className="table-wrap table-wrap--flat">
                      <table className="table table--compact search-query-table">
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
                              <td className="search-query-table__index">{q.index}</td>
                              <td>
                                <Pill tone={q.change?.startsWith('+') ? 'up' : 'default'}>{q.change}</Pill>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <SourceFootnote source={searchSource} field="Regional search" />
      </Card>
    </div>
  );
}
