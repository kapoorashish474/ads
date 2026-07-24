import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { FilterBar, FilterRow } from '../components/FilterBar';
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

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

function SuggestionCard({ item, onStatus }) {
  const isClosed = item.status !== 'open';

  return (
    <article className={`suggestion-card suggestion-card--${item.priority} ${isClosed ? 'suggestion-card--closed' : ''}`}>
      <div className="suggestion-card__meta">
        <Pill tone={item.priority}>{item.priority}</Pill>
        <Pill>{TYPE_LABELS[item.type] || item.type}</Pill>
        {isClosed && <Pill tone="partnership">{item.status}</Pill>}
      </div>
      <h3>{item.title}</h3>
      <p className="suggestion-card__thesis">{item.thesis}</p>
      <div className="suggestion-card__fast">
        <span className="suggestion-card__label">Fast path</span>
        <p>{item.fast_path}</p>
      </div>
      {(item.evidence || []).length > 0 && (
        <ul className="suggestion-card__evidence">
          {item.evidence.map((e) => (
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
      )}
      {!isClosed && (
        <div className="suggestion-card__actions">
          <button type="button" className="btn btn--ghost" onClick={() => onStatus(item.id, 'accepted')}>
            Accept
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => onStatus(item.id, 'dismissed')}>
            Dismiss
          </button>
        </div>
      )}
    </article>
  );
}

function LaneColumn({ title, subtitle, items, onStatus, emptyMessage }) {
  return (
    <Card title={title} subtitle={subtitle} collapsible defaultOpen className="suggestion-lane">
      {items.length === 0 ? (
        <Empty message={emptyMessage} />
      ) : (
        <div className="suggestion-lane__scroll scroll-y">
          {items.map((item) => (
            <SuggestionCard key={item.id} item={item} onStatus={onStatus} />
          ))}
        </div>
      )}
    </Card>
  );
}

export default function Suggestions() {
  const { slug, data, loading: ctxLoading, error: ctxError, reload } = useCompany();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('open');

  const load = () => {
    setLoading(true);
    api
      .suggestions(slug)
      .then((r) => setSuggestions(r.suggestions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  const companyName = data?.company?.name || slug;
  const summary = data?.company?.suggestionSummary;

  const filtered = useMemo(() => {
    return suggestions
      .filter((s) => {
        if (statusFilter !== 'all' && s.status !== statusFilter) return false;
        if (priorityFilter !== 'all' && s.priority !== priorityFilter) return false;
        return true;
      })
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [suggestions, statusFilter, priorityFilter]);

  const marketing = filtered.filter((s) => s.lane === 'marketing');
  const engineering = filtered.filter((s) => s.lane === 'engineering');
  const openCount = suggestions.filter((s) => s.status === 'open').length;
  const criticalCount = suggestions.filter((s) => s.status === 'open' && s.priority === 'critical').length;

  async function setStatus(id, status) {
    await api.updateSuggestion(id, status);
    load();
    reload();
  }

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page page--suggestions">
      <div className="hero hero--compact">
        <h1>Suggestions</h1>
        <p className="lede">
          Where {companyName} should invest next — peer gaps, search signals, and product coverage
          turned into marketing and engineering priorities.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Open priorities" value={openCount} hint={`${suggestions.length} total tracked`} />
        <Stat label="Critical" value={criticalCount} hint="Needs attention now" />
        <Stat label="Marketing" value={suggestions.filter((s) => s.lane === 'marketing' && s.status === 'open').length} hint="Open items" />
        <Stat label="Engineering" value={suggestions.filter((s) => s.lane === 'engineering' && s.status === 'open').length} hint="Open items" />
      </div>

      {summary && (
        <Card title="Strategic focus" subtitle={summary.headline} collapsible defaultOpen>
          {summary.focus?.length > 0 && (
            <ul className="focus-list">
              {summary.focus.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <FilterBar
        title="Filters"
        summary={[
          statusFilter === 'all' ? 'All statuses' : statusFilter,
          priorityFilter === 'all' ? 'All priorities' : priorityFilter,
        ].join(' · ')}
      >
        <FilterRow label="Status">
          {[
            ['open', 'Open'],
            ['all', 'All'],
            ['accepted', 'Accepted'],
            ['dismissed', 'Dismissed'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={statusFilter === key ? 'chip active' : 'chip'}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="Priority">
          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              type="button"
              className={priorityFilter === p ? 'chip active' : 'chip'}
              onClick={() => setPriorityFilter(p)}
            >
              {p === 'all' ? 'All' : p}
            </button>
          ))}
        </FilterRow>
      </FilterBar>

      {filtered.length === 0 ? (
        <Empty message="No suggestions match these filters." />
      ) : (
        <div className="grid grid--2 suggestion-board">
          <LaneColumn
            title="Marketing"
            subtitle={`${marketing.length} priorities · narrative, demand, positioning`}
            items={marketing}
            onStatus={setStatus}
            emptyMessage="No marketing suggestions for this filter."
          />
          <LaneColumn
            title="Engineering"
            subtitle={`${engineering.length} priorities · product, platform, integrations`}
            items={engineering}
            onStatus={setStatus}
            emptyMessage="No engineering suggestions for this filter."
          />
        </div>
      )}

      <Card title="How suggestions are built" collapsible defaultOpen={false}>
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
