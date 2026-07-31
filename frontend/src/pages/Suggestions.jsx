import { useEffect, useMemo, useState } from 'react';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import ScrollTable from '../components/ScrollTable';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

const TYPE_LABELS = {
  build: 'Build',
  catch_up: 'Catch up',
  differentiate: 'Differentiate',
  improve: 'Improve',
  double: 'Double down',
  fix: 'Fix',
};

const LANE_LABELS = {
  marketing: 'Marketing',
  engineering: 'Engineering',
};

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  ...Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label })),
];

function EvidenceLinks({ items }) {
  if (!items?.length) return <span className="muted">—</span>;
  return (
    <ul className="suggestion-table__evidence">
      {items.map((e) => (
        <li key={e.label}>
          {e.url && e.url !== '#' ? (
            <a href={e.url} target="_blank" rel="noreferrer">
              {e.label}
            </a>
          ) : (
            e.label
          )}
        </li>
      ))}
    </ul>
  );
}

function matchesQuery(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [item.title, item.thesis, item.fast_path, item.lane, item.type, item.priority]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export default function Suggestions() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [laneFilter, setLaneFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api
      .suggestions(slug)
      .then((r) => setSuggestions(r.suggestions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const companyName = data?.company?.name || slug;

  const filtered = useMemo(() => {
    return suggestions
      .filter((s) => {
        if (laneFilter !== 'all' && s.lane !== laneFilter) return false;
        if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
        if (typeFilter !== 'all' && s.type !== typeFilter) return false;
        if (!matchesQuery(s, query)) return false;
        return true;
      })
      .sort((a, b) => {
        const priorityOrder = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (priorityOrder !== 0) return priorityOrder;
        const laneOrder = (a.lane || '').localeCompare(b.lane || '');
        if (laneOrder !== 0) return laneOrder;
        return (a.title || '').localeCompare(b.title || '');
      });
  }, [suggestions, laneFilter, priorityFilter, typeFilter, query]);

  const filtersActive =
    query.trim() !== '' || laneFilter !== 'all' || priorityFilter !== 'all' || typeFilter !== 'all';

  function clearFilters() {
    setQuery('');
    setLaneFilter('all');
    setPriorityFilter('all');
    setTypeFilter('all');
  }

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page page--suggestions">
      <div className="hero hero--compact">
        <h1>Suggestions</h1>
        <p className="lede">
          Where {companyName} should invest next — evidence-backed priorities for this company.
        </p>
      </div>

      <Card title="Priority register" subtitle={`${filtered.length} of ${suggestions.length}`} collapsible defaultOpen>
        <FilterBar className="filter-toolbar--inset suggestions-filters">
          <label className="filter-search suggestions-filters__search">
            <span className="filter-select__label">Search</span>
            <input
              type="search"
              className="filter-search__input"
              placeholder="Title, thesis, fast path…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search suggestions"
            />
          </label>
          <FilterSelect
            label="Lane"
            value={laneFilter}
            onChange={setLaneFilter}
            options={[
              { value: 'all', label: 'All lanes' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'engineering', label: 'Engineering' },
            ]}
          />
          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All priorities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <FilterSelect label="Type" value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
          {filtersActive && (
            <button type="button" className="suggestions-filters__clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No suggestions match these filters." />
        ) : (
          <ScrollTable
            rows={filtered}
            getRowKey={(item) => item.id}
            tableClassName="table table--compact table--suggestions"
            head={
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Lane</th>
                  <th>Type</th>
                  <th>Recommendation</th>
                  <th>Fast path</th>
                  <th>Evidence</th>
                </tr>
              </thead>
            }
            renderRow={(item) => (
              <tr className={`suggestion-row suggestion-row--${item.priority}`}>
                <td>
                  <Pill tone={item.priority}>{item.priority}</Pill>
                </td>
                <td>{LANE_LABELS[item.lane] || item.lane}</td>
                <td>{TYPE_LABELS[item.type] || item.type}</td>
                <td>
                  <strong>{item.title}</strong>
                  <p className="muted table-note">{item.thesis}</p>
                </td>
                <td>{item.fast_path}</td>
                <td>
                  <EvidenceLinks items={item.evidence} />
                </td>
              </tr>
            )}
          />
        )}
        <SourceFootnote
          source={{
            label: 'Product gaps, search trends, and public signals for this company',
            confidence: 'inferred',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
