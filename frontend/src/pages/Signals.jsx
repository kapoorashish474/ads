import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { FilterBar, FilterRow } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

const TYPE_LABELS = {
  launch: 'Launch',
  product: 'Product',
  partnership: 'Partnership',
};

function formatSignalDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function slugToName(slug, nameMap) {
  return nameMap[slug] || slug.replace(/-/g, ' ');
}

export default function Signals() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api
      .signals(slug)
      .then((r) => setSignals(r.signals))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const nameMap = useMemo(() => {
    const map = {};
    if (data?.company) map[data.company.slug] = data.company.name;
    (data?.peers || []).forEach((p) => {
      map[p.slug] = p.name;
    });
    return map;
  }, [data]);

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (scopeFilter === 'company' && s.company_slug !== slug) return false;
      if (scopeFilter === 'peers' && s.company_slug === slug) return false;
      return true;
    });
  }, [signals, typeFilter, scopeFilter, slug]);

  const byType = useMemo(() => {
    const counts = {};
    signals.forEach((s) => {
      counts[s.type] = (counts[s.type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [signals]);

  const byCompany = useMemo(() => {
    const counts = {};
    signals.forEach((s) => {
      counts[s.company_slug] = (counts[s.company_slug] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([s, n]) => ({ slug: s, name: slugToName(s, nameMap), count: n }))
      .sort((a, b) => b.count - a.count);
  }, [signals, nameMap]);

  const companySignalCount = signals.filter((s) => s.company_slug === slug).length;
  const peerSignalCount = signals.length - companySignalCount;
  const latestDate = signals[0]?.published_at;

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  const companyName = data?.company?.name || slug;

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>Signals</h1>
        <p className="lede">
          Public moves from <strong>{companyName}</strong> and {data?.peers?.length || 0} peers —
          launches, products, and partnerships with sources cited.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Total signals" value={signals.length} hint="In your watch list" />
        <Stat label={`About ${companyName}`} value={companySignalCount} hint="Direct company news" />
        <Stat label="Peer moves" value={peerSignalCount} hint="Competitive intel" />
        <Stat label="Latest" value={latestDate ? formatSignalDate(latestDate) : '—'} hint="Most recent item" />
      </div>

      <div className="grid grid--2">
        <Card title="By type" subtitle="What kind of moves" collapsible defaultOpen>
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Type</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {byType.map(([type, count]) => (
                <tr key={type}>
                  <td>
                    <Pill tone={type}>{TYPE_LABELS[type] || type}</Pill>
                  </td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="By company" subtitle="Who is most active" collapsible defaultOpen>
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Company</th>
                <th>Signals</th>
              </tr>
            </thead>
            <tbody>
              {byCompany.map((row) => (
                <tr key={row.slug} className={row.slug === slug ? 'row--focus' : ''}>
                  <td>{row.name}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Signal feed" subtitle={`${filtered.length} of ${signals.length} shown`}>
        <FilterBar
          summary={`${typeFilter !== 'all' ? TYPE_LABELS[typeFilter] || typeFilter : 'All types'} · ${scopeFilter === 'all' ? 'All' : scopeFilter === 'company' ? companyName : 'Peers'}`}
        >
          <FilterRow label="Type">
            {['all', 'launch', 'product', 'partnership'].map((t) => (
              <button
                key={t}
                type="button"
                className={typeFilter === t ? 'chip active' : 'chip'}
                onClick={() => setTypeFilter(t)}
              >
                {t === 'all' ? 'All types' : TYPE_LABELS[t] || t}
              </button>
            ))}
          </FilterRow>
          <FilterRow label="Scope">
            {[
              ['all', 'All'],
              ['company', companyName],
              ['peers', 'Peers only'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={scopeFilter === key ? 'chip active' : 'chip'}
                onClick={() => setScopeFilter(key)}
              >
                {label}
              </button>
            ))}
          </FilterRow>
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No signals match these filters." />
        ) : (
          <div className="table-wrap">
            <table className="table table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Signal</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className={s.company_slug === slug ? 'row--focus' : ''}>
                    <td className="cell-date">{formatSignalDate(s.published_at)}</td>
                    <td className="cell-company">{slugToName(s.company_slug, nameMap)}</td>
                    <td className="cell-type">
                      <Pill tone={s.type}>{TYPE_LABELS[s.type] || s.type}</Pill>
                    </td>
                    <td className="cell-signal">
                      <strong>{s.title}</strong>
                      <p>{s.summary}</p>
                    </td>
                    <td className="cell-source">
                      {s.confidence && (
                        <Pill tone={`conf-${s.confidence}`}>{s.confidence}</Pill>
                      )}
                      <span className="cell-source__name">{s.source_name || 'Public source'}</span>
                      {s.source_url && (
                        <a href={s.source_url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <SourceFootnote
          source={{
            label: 'Company press releases & public websites',
            confidence: 'reported',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
