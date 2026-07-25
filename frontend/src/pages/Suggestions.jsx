import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
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

export default function Suggestions() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [laneFilter, setLaneFilter] = useState('all');

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
        return true;
      })
      .sort((a, b) => {
        const laneOrder = (a.lane || '').localeCompare(b.lane || '');
        if (laneOrder !== 0) return laneOrder;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      });
  }, [suggestions, laneFilter, priorityFilter]);

  const criticalCount = suggestions.filter((s) => s.priority === 'critical').length;

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page page--suggestions">
      <div className="hero hero--compact">
        <h1>Suggestions</h1>
        <p className="lede">
          Where {companyName} should invest next — evidence-backed priorities from peer gaps and
          public signals.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-2">
        <Stat label="Priorities" value={suggestions.length} />
        <Stat label="Critical" value={criticalCount} hint="Needs attention now" />
      </div>

      <Card title="Priority register" subtitle={`${filtered.length} of ${suggestions.length}`} collapsible defaultOpen>
        <FilterBar className="filter-toolbar--inset">
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
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No suggestions match these filters." />
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact table--suggestions">
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
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className={`suggestion-row suggestion-row--${item.priority}`}>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SourceFootnote
          source={{
            label: 'Peer compare + product gaps + search trends + public signals',
            confidence: 'inferred',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
