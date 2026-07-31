import { useEffect, useMemo, useState } from 'react';
import { Card, Loading, ErrorState } from '../components/ui';
import ScrollTable from '../components/ScrollTable';
import { SourceBadge, formatField, confidenceLabels } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

const CATEGORY_ORDER = ['Dashboard', 'Market intel', 'Reference'];
const EXCLUDED_CATEGORIES = new Set(['Planning', 'Executive']);
const CONFIDENCE_ORDER = ['reported', 'estimated', 'mixed', 'inferred', 'modeled'];

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
      <td className="sources-row__tab">{row.tab || '—'}</td>
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

function SourcesSection({ category, rows, open, onToggle }) {
  return (
    <Card
      className="sources-section-card"
      title={category}
      subtitle={`${rows.length} field${rows.length === 1 ? '' : 's'}`}
      collapsible
      open={open}
      onOpenChange={onToggle}
    >
      <ScrollTable
        rows={rows}
        getRowKey={(row) => row.key}
        tableClassName="table table--compact sources-table"
        head={
          <thead>
            <tr>
              <th>Field</th>
              <th>Planned view</th>
              <th>Source</th>
              <th>Level</th>
              <th>As of</th>
            </tr>
          </thead>
        }
        renderRow={(row) => <SourceRow row={row} />}
      />
    </Card>
  );
}

export default function SourcesPage() {
  const { data, loading, error } = useCompany();
  const [query, setQuery] = useState('');
  const [policy, setPolicy] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.policies().then((r) => setPolicy(r.sources || '')).catch(() => {});
  }, []);

  const sources = data?.company?.dataSources;

  const rows = useMemo(
    () =>
      Object.entries(sources || {})
        .map(([key, src]) => ({ key, ...src }))
        .filter((row) => !EXCLUDED_CATEGORIES.has(row.category))
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

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      grouped.forEach(({ category }, index) => {
        if (next[category] === undefined) next[category] = index === 0;
      });
      return next;
    });
  }, [grouped]);

  const confidenceCounts = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      const key = row.confidence || 'unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return CONFIDENCE_ORDER.filter((c) => counts[c]).map((c) => [c, counts[c]]);
  }, [rows]);

  const allExpanded = grouped.length > 0 && grouped.every(({ category }) => expanded[category]);

  const toggleAll = () => {
    const next = !allExpanded;
    setExpanded(Object.fromEntries(grouped.map(({ category }) => [category, next])));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company } = data;

  return (
    <div className="page page--sources">
      <Card className="sources-intro-card">
        <header className="sources-header">
          <div className="sources-header__copy">
            <h1>Data sources</h1>
            <p className="sources-header__lede">
              Plan from public origins first — every metric for {company.name} must trace to a URL,
              confidence level, and as-of date before it appears on a dashboard.
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

        <div className="sources-summary">
          <span className="sources-summary__total">
            <strong>{rows.length}</strong> fields tracked
          </span>
          {confidenceCounts.map(([level, count]) => (
            <span key={level} className="sources-summary__chip">
              {count} {confidenceLabels[level] || level}
            </span>
          ))}
        </div>

        {policy && (
          <details className="sources-policy">
            <summary>Source policy</summary>
            <p>{policy}</p>
          </details>
        )}
      </Card>

      <div className="sources-registry">
        <div className="sources-registry__toolbar">
          <p className="sources-registry__meta">
            {filtered.length} field{filtered.length === 1 ? '' : 's'}
            {query.trim() ? ' matching search' : ''} across {grouped.length} section
            {grouped.length === 1 ? '' : 's'}
          </p>
          {grouped.length > 1 && (
            <button type="button" className="sources-registry__toggle" onClick={toggleAll}>
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>

        {grouped.length === 0 ? (
          <Card className="sources-empty-card">
            <p className="muted sources-empty">No fields match your search.</p>
          </Card>
        ) : (
          grouped.map(({ category, rows: sectionRows }) => (
            <SourcesSection
              key={category}
              category={category}
              rows={sectionRows}
              open={!!expanded[category]}
              onToggle={(next) => setExpanded((prev) => ({ ...prev, [category]: next }))}
            />
          ))
        )}
      </div>
    </div>
  );
}
