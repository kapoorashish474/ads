import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceBadge, SourceFootnote } from '../components/Source';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import IntelCompareTable from '../components/IntelCompareTable';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';
import {
  compareRows,
  countByField,
  countBySlug,
  deltaVsPeers,
  focusRank,
  peerAverage,
} from '../utils/intelCompare';

function formatPosted(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function XPage({ embedded = false }) {
  const { slug, data, loading: ctxLoading, error: ctxError, compareMode } = useCompany();
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

  const company = data?.company;
  const postCounts = countBySlug(posts);
  const themeBreakdown = countByField(posts, 'company_slug', 'theme');
  const compareList = company
    ? compareRows(company, peers, postCounts).map((row) => ({
        ...row,
        breakdown: themeBreakdown[row.slug] || {},
      }))
    : [];
  const avgPeerPosts = peerAverage(peers, postCounts);
  const postDelta = deltaVsPeers(companyPosts.length, avgPeerPosts);
  const postRank = focusRank(compareList, slug);
  const compareColumns = themes.slice(0, 4).map(([t]) => ({ key: t, label: t }));

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className={embedded ? 'intel-panel' : 'page'}>
      {!embedded && (
        <div className="hero hero--compact">
          <h1>X presence</h1>
          <p className="lede">
            {compareMode
              ? `X presence vs peers — public themes and activity for ${companyName}.`
              : <>Verified X profile links for {companyName} and peers. Themes come from public press and company pages — not scraped tweet text.</>}
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

      {compareMode && company && (
        <>
          <div className="grid grid--stats grid--stats-4">
            <Stat label={`${companyName} themes`} value={companyPosts.length} hint={postDelta.text} />
            <Stat label="Peer average" value={avgPeerPosts} hint="Themes tracked per peer" />
            <Stat label="Your rank" value={postRank ? `#${postRank}` : '—'} hint="Among watch list" />
            <Stat label="From press" value={reportedCount} hint={`${companyName} reported items`} />
          </div>

          <div className="grid grid--2">
            <Card title="X activity by company" subtitle="Public themes tracked">
              <BarChart
                horizontal
                categories={compareList.map((r) => r.name)}
                series={[{ name: 'Themes', data: compareList.map((r) => r.count) }]}
                height={Math.max(220, compareList.length * 40)}
                xAxisLabel="Theme count"
                yAxisLabel="Company"
              />
            </Card>
            <Card title="Theme mix by company" subtitle="Top public themes per company">
              <IntelCompareTable
                rows={compareList}
                columns={compareColumns}
                focusSlug={slug}
                valueLabel="Total"
              />
            </Card>
          </div>
        </>
      )}

      {!compareMode && (
      <>
      <div className="grid grid--stats grid--stats-3">
        <Stat label="X handle" value={`@${xProfile?.handle || '—'}`} hint="Verified profile URL" />
        <Stat label="Themes tracked" value={themes.length} hint="Across company + peers" />
        <Stat label={`${companyName} items`} value={companyPosts.length} hint={`${reportedCount} from press`} />
      </div>

      <div className="grid grid--2">
        <Card title="Themes in feed" subtitle="What companies talk about publicly">
          <BarChart
            horizontal
            categories={themes.map(([t]) => t)}
            series={[{ name: 'Items', data: themes.map(([, n]) => n) }]}
            height={Math.max(160, themes.length * 36)}
            xAxisLabel="Post count"
            yAxisLabel="Theme"
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
      </>
      )}

      <Card title={compareMode ? 'All public themes' : 'Public themes & press'} subtitle={`${filtered.length} of ${posts.length} shown`}>
        <FilterBar className="filter-toolbar--inset">
          <FilterSelect
            label="Scope"
            value={scopeFilter}
            onChange={setScopeFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'company', label: companyName },
              { value: 'peers', label: 'Peers only' },
            ]}
          />
          <FilterSelect
            label="Theme"
            value={themeFilter}
            onChange={setThemeFilter}
            options={[
              { value: 'all', label: 'All themes' },
              ...themes.map(([t]) => ({ value: t, label: t })),
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
