import { useEffect, useState } from 'react';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

export default function Suggestions() {
  const { slug, loading: ctxLoading, error: ctxError, reload } = useCompany();
  const [suggestions, setSuggestions] = useState([]);
  const [lane, setLane] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .suggestions(slug)
      .then((r) => setSuggestions(r.suggestions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  const filtered = suggestions.filter((s) => lane === 'all' || s.lane === lane);
  const marketing = suggestions.filter((s) => s.lane === 'marketing');
  const engineering = suggestions.filter((s) => s.lane === 'engineering');

  async function setStatus(id, status) {
    await api.updateSuggestion(id, status);
    load();
    reload();
  }

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>Suggestions</h1>
        <p className="lede">Where to invest — marketing vs engineering</p>
      </div>

      <div className="lane-tabs scroll-x">
        <button type="button" className={lane === 'all' ? 'chip active' : 'chip'} onClick={() => setLane('all')}>
          All ({suggestions.length})
        </button>
        <button type="button" className={lane === 'marketing' ? 'chip active' : 'chip'} onClick={() => setLane('marketing')}>
          Marketing ({marketing.length})
        </button>
        <button type="button" className={lane === 'engineering' ? 'chip active' : 'chip'} onClick={() => setLane('engineering')}>
          Engineering ({engineering.length})
        </button>
      </div>

      {filtered.length === 0 ? (
        <Empty message="No suggestions for this company yet." />
      ) : (
        <div className="suggestion-grid">
          {filtered.map((s) => (
            <Card key={s.id} className={`suggestion suggestion--${s.priority}`}>
              <div className="suggestion__head">
                <Pill tone={s.lane}>{s.lane}</Pill>
                <Pill tone={s.priority}>{s.priority}</Pill>
                <Pill>{s.type}</Pill>
              </div>
              <h3>{s.title}</h3>
              <p>{s.thesis}</p>
              <p className="fast-path">
                <strong>Fast path:</strong> {s.fast_path}
              </p>
              {(s.evidence || []).length > 0 && (
                <ul className="evidence-list">
                  {s.evidence.map((e) => (
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
              <div className="suggestion__actions">
                <button type="button" className="btn btn--ghost" onClick={() => setStatus(s.id, 'accepted')}>
                  Accept
                </button>
                <button type="button" className="btn btn--ghost" onClick={() => setStatus(s.id, 'dismissed')}>
                  Dismiss
                </button>
                {s.status !== 'open' && <span className="muted">Status: {s.status}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Card title="Suggestion methodology">
        <SourceFootnote
          source={{
            label: 'Peer compare + signals + search trends',
            confidence: 'inferred',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
