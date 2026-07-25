import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorState } from '../components/ui';
import { SourceBadge, formatField } from '../components/Source';
import { useCompany } from '../context/CompanyContext';

const CATEGORY_ORDER = ['Dashboard', 'Executive', 'Market intel', 'Planning', 'Reference'];

const TAB_ROUTES = {
  Overview: '/overview',
  Revenue: '/revenue',
  Products: '/products',
  Signals: '/intel/signals',
  Search: '/intel/search',
  LinkedIn: '/intel/social?channel=linkedin',
  X: '/intel/social?channel=x',
  Suggestions: '/suggestions',
  Benefit: '/benefit',
  Brief: '/',
};

function sortRows(a, b) {
  const cat = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
  if (cat !== 0) return cat;
  return (a.tab || '').localeCompare(b.tab || '') || a.key.localeCompare(b.key);
}

function SourceRow({ row }) {
  return (
    <tr>
      <td className="sources-row__field">
        <strong>{formatField(row.key)}</strong>
        {row.note && <span className="sources-row__note">{row.note}</span>}
      </td>
      <td className="sources-row__tab">
        {row.tab && TAB_ROUTES[row.tab] ? (
          <Link to={TAB_ROUTES[row.tab]}>{row.tab}</Link>
        ) : (
          row.tab || '—'
        )}
      </td>
      <td className="sources-row__source">
        {row.url ? (
          <a href={row.url} target="_blank" rel="noreferrer">
            {row.label}
          </a>
        ) : (
          row.label
        )}
      </td>
      <td>
        <SourceBadge confidence={row.confidence} />
      </td>
      <td className="sources-row__asof">{row.asOf || '—'}</td>
    </tr>
  );
}

export default function SourcesPage() {
  const { data, loading, error } = useCompany();
  const [query, setQuery] = useState('');

  const sources = data?.company?.dataSources;

  const rows = useMemo(
    () =>
      Object.entries(sources || {})
        .map(([key, src]) => ({ key, ...src }))
        .sort(sortRows),
    [sources]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const haystack = [formatField(row.key), row.tab, row.label, row.note, row.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((row) => {
      const cat = row.category || 'Other';
      if (!map[cat]) map[cat] = [];
      map[cat].push(row);
    });
    return CATEGORY_ORDER.filter((c) => map[c]?.length).map((category) => ({
      category,
      rows: map[category],
    }));
  }, [filtered]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company } = data;

  return (
    <div className="page page--sources">
      <header className="sources-header">
        <div>
          <h1>Sources</h1>
          <p className="sources-header__lede">
            Public data origins for {company.name} — {rows.length} fields across the app.
          </p>
        </div>
        <div className="sources-header__search">
          <input
            type="search"
            className="sources-search"
            placeholder="Search field or source…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search sources"
          />
        </div>
      </header>

      <div className="sources-registry">
        {grouped.length === 0 ? (
          <p className="muted sources-empty">No fields match your search.</p>
        ) : (
          grouped.map(({ category, rows: sectionRows }) => (
            <section key={category} className="sources-section">
              <div className="sources-section__head">
                <h2>{category}</h2>
              </div>
              <div className="sources-section__table">
                <table className="table table--compact sources-table">
                  <thead>
                    <tr>
                      <th>Field</th>
                      <th>Tab</th>
                      <th>Source</th>
                      <th>Level</th>
                      <th>As of</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectionRows.map((row) => (
                      <SourceRow key={row.key} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>

      <details className="sources-methodology">
        <summary>About confidence levels & methodology</summary>
        <ul>
          <li>
            <strong>Reported</strong> — filings, IR, verified profiles.{' '}
            <strong>Estimated</strong> — industry reports, LinkedIn bands.{' '}
            <strong>Modeled</strong> — indices & scores.{' '}
            <strong>Inferred</strong> — synthesized from public signals.{' '}
            <strong>Mixed</strong> — reported + modeled.
          </li>
          <li>All metrics use public sources only — no private APIs or scraped social text.</li>
          <li>Each chart and stat elsewhere in the app shows the same confidence tag at point of use.</li>
        </ul>
      </details>
    </div>
  );
}
