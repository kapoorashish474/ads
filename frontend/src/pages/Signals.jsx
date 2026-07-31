import { useEffect, useMemo, useState } from 'react';
import { Card, Loading, ErrorState, Pill, Empty } from '../components/ui';
import ScrollTable from '../components/ScrollTable';
import { SourceFootnote } from '../components/Source';
import { FilterBar, FilterSelect } from '../components/FilterBar';
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

export default function Signals({ embedded = false }) {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    setTypeFilter('all');
    api
      .signals(slug)
      .then((r) => setSignals(r.signals))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const companyName = data?.company?.name || slug;

  const filtered = useMemo(() => {
    return signals.filter((s) => {
      if (s.company_slug !== slug) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      return true;
    });
  }, [signals, typeFilter, slug]);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className={embedded ? 'intel-panel' : 'page page--signals'}>
      <Card title="Signal feed" subtitle={`${filtered.length} for ${companyName}`} collapsible defaultOpen>
        <FilterBar className="filter-toolbar--inset">
          <FilterSelect
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All types' },
              { value: 'launch', label: TYPE_LABELS.launch },
              { value: 'product', label: TYPE_LABELS.product },
              { value: 'partnership', label: TYPE_LABELS.partnership },
            ]}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No signals for this company match these filters." />
        ) : (
          <ScrollTable
            rows={filtered}
            getRowKey={(s) => s.id}
            tableClassName="table table--signals"
            head={
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Signal</th>
                  <th>Source</th>
                </tr>
              </thead>
            }
            renderRow={(s) => (
              <tr>
                <td className="cell-date">{formatSignalDate(s.published_at)}</td>
                <td className="cell-type">
                  <Pill tone={s.type}>{TYPE_LABELS[s.type] || s.type}</Pill>
                </td>
                <td className="cell-signal">
                  <strong>{s.title}</strong>
                  <p>{s.summary}</p>
                </td>
                <td className="cell-source">
                  {s.confidence && <Pill tone={`conf-${s.confidence}`}>{s.confidence}</Pill>}
                  <span className="cell-source__name">{s.source_name || 'Public source'}</span>
                  {s.source_url && (
                    <a href={s.source_url} target="_blank" rel="noreferrer">
                      Open
                    </a>
                  )}
                </td>
              </tr>
            )}
          />
        )}

        <SourceFootnote
          source={{
            label: 'Curated from company press releases, IR pages, and public websites',
            confidence: 'mixed',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
