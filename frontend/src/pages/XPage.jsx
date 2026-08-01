import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceBadge, SourceFootnote } from '../components/Source';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

function formatPosted(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function XPage({ embedded = false }) {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [posts, setPosts] = useState([]);
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themeFilter, setThemeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    setThemeFilter('all');
    api
      .xPosts(slug)
      .then((r) => {
        setPosts(r.posts);
        setPolicy(r.policy);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const companyName = data?.company?.name || slug;
  const xProfile = data?.company?.x;

  const companyPosts = useMemo(
    () => posts.filter((p) => p.company_slug === slug),
    [posts, slug]
  );

  const filtered = useMemo(() => {
    return companyPosts.filter((p) => {
      if (themeFilter !== 'all' && p.theme !== themeFilter) return false;
      return true;
    });
  }, [companyPosts, themeFilter]);

  const companyThemes = useMemo(() => {
    const counts = {};
    companyPosts.forEach((p) => {
      counts[p.theme] = (counts[p.theme] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [companyPosts]);

  const reportedCount = companyPosts.filter((p) => p.confidence === 'reported').length;

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className={embedded ? 'intel-panel' : 'page'}>
      {!embedded && (
        <div className="hero hero--compact">
          <h1>X presence</h1>
          <p className="lede">
            Public themes and activity for {companyName}. Themes come from public press and company pages — not scraped tweet text.
          </p>
          {xProfile?.profileUrl && (
            <p className="lede" style={{ marginTop: '0.5rem' }}>
              <a href={xProfile.profileUrl} target="_blank" rel="noreferrer">
                @{xProfile.handle} on X →
              </a>
              {xProfile.validatedAt && (
                <span className="muted"> · profile verified {xProfile.validatedAt}</span>
              )}
            </p>
          )}
        </div>
      )}
      {embedded && xProfile?.profileUrl && (
        <p className="intel-panel__link">
          <a href={xProfile.profileUrl} target="_blank" rel="noreferrer">
            @{xProfile.handle} on X →
          </a>
          {xProfile.validatedAt && (
            <span className="muted"> · profile verified {xProfile.validatedAt}</span>
          )}
        </p>
      )}

      <div className="grid grid--stats grid--stats-3">
        <Stat label="X handle" value={`@${xProfile?.handle || '—'}`} hint={`${companyName} verified profile`} />
        <Stat label="Themes tracked" value={companyThemes.length} hint="Public narrative themes" />
        <Stat label="Public items" value={companyPosts.length} hint={`${reportedCount} from press`} />
      </div>

      <div className="grid grid--2">
        <Card title="Themes" subtitle="Public narrative from press and pages">
          {companyThemes.length === 0 ? (
            <Empty message={`No X themes tracked for ${companyName}.`} />
          ) : (
            <BarChart
              horizontal
              categories={companyThemes.map(([t]) => t)}
              series={[{ name: 'Items', data: companyThemes.map(([, n]) => n) }]}
              height={Math.max(160, companyThemes.length * 36)}
              xAxisLabel="Item count"
              yAxisLabel="Theme"
            />
          )}
        </Card>
        <Card title="X profile" subtitle="Link checked against x.com">
          {xProfile?.profileUrl ? (
            <>
              <div className="table-wrap table-wrap--flat">
                <table className="table table--compact">
                  <tbody>
                    <tr>
                      <th scope="row">Handle</th>
                      <td>
                        <a href={xProfile.profileUrl} target="_blank" rel="noreferrer">
                          @{xProfile.handle}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Verified</th>
                      <td className="muted">{xProfile.validatedAt || '—'}</td>
                    </tr>
                    {xProfile.bio && (
                      <tr>
                        <th scope="row">Bio</th>
                        <td>{xProfile.bio}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {xProfile.topThemes?.length > 0 && (
                <p className="muted card-note">
                  Focus themes: {xProfile.topThemes.join(' · ')}
                </p>
              )}
            </>
          ) : (
            <Empty message={`No verified X profile for ${companyName}.`} />
          )}
        </Card>
      </div>

      <Card title="Public themes" subtitle={`${filtered.length} shown`}>
        <FilterBar>
          <FilterSelect
            label="Theme"
            value={themeFilter}
            onChange={setThemeFilter}
            options={[
              { value: 'all', label: 'All themes' },
              ...companyThemes.map(([t]) => ({ value: t, label: t })),
            ]}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No items match these filters." />
        ) : (
          <div className="table-wrap">
            <table className="table table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Theme / headline</th>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-date">{formatPosted(p.posted_at)}</td>
                    <td className="cell-signal">
                      <strong>{p.text}</strong>
                    </td>
                    <td>
                      <Pill>{p.theme}</Pill>
                    </td>
                    <td>
                      <SourceBadge confidence={p.confidence} />
                    </td>
                    <td className="cell-source">
                      <a href={p.source_url} target="_blank" rel="noreferrer">
                        {p.source_name || 'Source'}
                      </a>
                      {p.profile_url && xProfile?.handle && (
                        <a href={p.profile_url} target="_blank" rel="noreferrer" className="muted-link">
                          @{xProfile.handle}
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
            label: policy || 'X profiles verified · themes from public pages',
            confidence: 'reported',
            url: xProfile?.profileUrl || 'https://x.com',
            asOf: xProfile?.validatedAt || '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
