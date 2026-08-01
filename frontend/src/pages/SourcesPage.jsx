import { useEffect, useMemo, useState } from 'react';
import { Card, Loading, ErrorState } from '../components/ui';
import ScrollTable from '../components/ScrollTable';
import { SourceBadge, formatField } from '../components/Source';
import { useCompany } from '../context/CompanyContext';

const CATEGORY_ORDER = ['Dashboard', 'Market intel', 'Reference'];
const EXCLUDED_CATEGORIES = new Set(['Planning', 'Executive']);

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
  const [expanded, setExpanded] = useState({});

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

  const allExpanded = grouped.length > 0 && grouped.every(({ category }) => expanded[category]);

  const toggleAll = () => {
    const next = !allExpanded;
    setExpanded(Object.fromEntries(grouped.map(({ category }) => [category, next])));
  };

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="page page--sources">
      <div className="sources-registry">
        <div className="sources-registry__toolbar">
          <p className="sources-registry__meta">
            {filtered.length} field{filtered.length === 1 ? '' : 's'}
            {query.trim() ? ' matching search' : ''} across {grouped.length} section
            {grouped.length === 1 ? '' : 's'}
          </p>
          <div className="sources-registry__actions">
            <input
              type="search"
              className="sources-search"
              placeholder="Search field or source…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search sources"
            />
            {grouped.length > 1 && (
              <button type="button" className="sources-registry__toggle" onClick={toggleAll}>
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            )}
          </div>
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
