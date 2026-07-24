import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceBadge, SourceFootnote } from '../components/Source';
import { FilterBar, FilterRow } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

function formatPosted(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function XPage() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [posts, setPosts] = useState([]);
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themeFilter, setThemeFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
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
  const peers = data?.peers || [];

  const profiles = useMemo(() => {
    const list = [];
    if (data?.company?.x) {
      list.push({ slug: data.company.slug, name: data.company.name, ...data.company.x, isFocus: true });
    }
    peers.forEach((p) => {
      if (p.x) list.push({ slug: p.slug, name: p.name, ...p.x, isFocus: false });
    });
    return list;
  }, [data, peers]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (scopeFilter === 'company' && p.company_slug !== slug) return false;
      if (scopeFilter === 'peers' && p.company_slug === slug) return false;
      if (themeFilter !== 'all' && p.theme !== themeFilter) return false;
      return true;
    });
  }, [posts, scopeFilter, themeFilter, slug]);

  const themes = useMemo(() => {
    const counts = {};
    posts.forEach((p) => {
      counts[p.theme] = (counts[p.theme] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const companyPosts = posts.filter((p) => p.company_slug === slug);
  const reportedCount = companyPosts.filter((p) => p.confidence === 'reported').length;

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>X presence</h1>
        <p className="lede">
          Verified X profile links for {companyName} and peers. Themes come from public press and company
          pages — not scraped tweet text.
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

      <div className="grid grid--stats grid--stats-4">
        <Stat label="X handle" value={`@${xProfile?.handle || '—'}`} hint="Verified profile URL" />
        <Stat label="Themes tracked" value={themes.length} hint="Across company + peers" />
        <Stat label={`${companyName} items`} value={companyPosts.length} hint={`${reportedCount} from press`} />
        <Stat label="Live stats" value="On X" hint="Follower counts not stored — view profile" />
      </div>

      <div className="grid grid--2">
        <Card title="Themes in feed" subtitle="What companies talk about publicly">
          <BarChart
            horizontal
            categories={themes.map(([t]) => t)}
            series={[{ name: 'Items', data: themes.map(([, n]) => n) }]}
            height={Math.max(160, themes.length * 36)}
          />
        </Card>
        <Card title="Verified profiles" subtitle="Links checked against x.com">
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Handle</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.slug} className={p.slug === slug ? 'row--focus' : ''}>
                    <td>{p.name}</td>
                    <td>
                      <a href={p.profileUrl} target="_blank" rel="noreferrer">
                        @{p.handle}
                      </a>
                    </td>
                    <td className="muted">{p.validatedAt || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {xProfile?.topThemes && (
            <p className="muted card-note">
              Focus themes for {companyName}: {xProfile.topThemes.join(' · ')}
            </p>
          )}
        </Card>
      </div>

      <Card title="Public themes & press" subtitle={`${filtered.length} of ${posts.length} shown`}>
        <FilterBar
          summary={[
            scopeFilter === 'all' ? 'All' : scopeFilter === 'company' ? companyName : 'Peers',
            themeFilter === 'all' ? 'All themes' : themeFilter,
          ].join(' · ')}
        >
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
          <FilterRow label="Theme">
            <button type="button" className={themeFilter === 'all' ? 'chip active' : 'chip'} onClick={() => setThemeFilter('all')}>
              All themes
            </button>
            {themes.map(([t]) => (
              <button
                key={t}
                type="button"
                className={themeFilter === t ? 'chip active' : 'chip'}
                onClick={() => setThemeFilter(t)}
              >
                {t}
              </button>
            ))}
          </FilterRow>
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No items match these filters." />
        ) : (
          <div className="table-wrap">
            <table className="table table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Theme / headline</th>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={p.company_slug === slug ? 'row--focus' : ''}>
                    <td className="cell-date">{formatPosted(p.posted_at)}</td>
                    <td className="cell-company">{p.company_name || p.company_slug}</td>
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
                      {p.profile_url && (
                        <a href={p.profile_url} target="_blank" rel="noreferrer" className="muted-link">
                          @{profiles.find((pr) => pr.slug === p.company_slug)?.handle || 'profile'}
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
