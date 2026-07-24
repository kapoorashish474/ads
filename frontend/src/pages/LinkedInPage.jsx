import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { FilterBar, FilterRow } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

function formatPosted(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LinkedInPage() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [jobs, setJobs] = useState([]);
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionFilter, setRegionFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api
      .hiring(slug)
      .then((r) => {
        setJobs(r.jobs);
        setPolicy(r.policy);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const companyName = data?.company?.name || slug;
  const linkedin = data?.company?.linkedin;

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (scopeFilter === 'company' && j.company_slug !== slug) return false;
      if (scopeFilter === 'peers' && j.company_slug === slug) return false;
      if (regionFilter !== 'all' && j.region !== regionFilter) return false;
      if (deptFilter !== 'all' && j.department !== deptFilter) return false;
      return true;
    });
  }, [jobs, scopeFilter, regionFilter, deptFilter, slug]);

  const regions = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => {
      counts[j.region] = (counts[j.region] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const departments = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => {
      counts[j.department] = (counts[j.department] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [jobs]);

  const companyJobs = jobs.filter((j) => j.company_slug === slug).length;
  const topRegion = regions[0]?.[0];

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>LinkedIn hiring</h1>
        <p className="lede">
          Where {companyName} and peers are hiring — public LinkedIn listings by role, team, and region.
        </p>
        {linkedin?.jobsUrl && (
          <p className="lede" style={{ marginTop: '0.5rem' }}>
            <a href={linkedin.jobsUrl} target="_blank" rel="noreferrer">
              View all {companyName} roles on LinkedIn →
            </a>
          </p>
        )}
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Open roles tracked" value={jobs.length} hint="Company + peers" />
        <Stat label={`${companyName} roles`} value={companyJobs} />
        <Stat label="Top hiring region" value={topRegion || '—'} />
        <Stat label="Departments" value={departments.length} hint="Distinct teams" />
      </div>

      <div className="grid grid--2">
        <Card title="Hiring by region" subtitle="Where talent investment is focused">
          <BarChart
            horizontal
            categories={regions.map(([r]) => r)}
            series={[{ name: 'Open roles', data: regions.map(([, n]) => n) }]}
            height={Math.max(180, regions.length * 36)}
          />
        </Card>
        <Card title="Hiring by department" subtitle="What functions are growing">
          <table className="table table--compact">
            <thead>
              <tr>
                <th>Department</th>
                <th>Roles</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(([dept, count]) => (
                <tr key={dept}>
                  <td>{dept}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Open roles" subtitle={`${filtered.length} of ${jobs.length} shown · public LinkedIn listings`}>
        <FilterBar
          summary={[
            scopeFilter === 'all' ? 'All' : scopeFilter === 'company' ? companyName : 'Peers',
            regionFilter === 'all' ? 'All regions' : regionFilter,
            deptFilter === 'all' ? 'All teams' : deptFilter,
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
          <FilterRow label="Region">
            <button type="button" className={regionFilter === 'all' ? 'chip active' : 'chip'} onClick={() => setRegionFilter('all')}>
              All regions
            </button>
            {regions.map(([r]) => (
              <button
                key={r}
                type="button"
                className={regionFilter === r ? 'chip active' : 'chip'}
                onClick={() => setRegionFilter(r)}
              >
                {r}
              </button>
            ))}
          </FilterRow>
          <FilterRow label="Team">
            <button type="button" className={deptFilter === 'all' ? 'chip active' : 'chip'} onClick={() => setDeptFilter('all')}>
              All teams
            </button>
            {departments.map(([d]) => (
              <button
                key={d}
                type="button"
                className={deptFilter === d ? 'chip active' : 'chip'}
                onClick={() => setDeptFilter(d)}
              >
                {d}
              </button>
            ))}
          </FilterRow>
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No roles match these filters." />
        ) : (
          <div className="table-wrap">
            <table className="table table--signals">
              <thead>
                <tr>
                  <th>Posted</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Location</th>
                  <th>Region</th>
                  <th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id} className={j.company_slug === slug ? 'row--focus' : ''}>
                    <td className="cell-date">{formatPosted(j.posted_at)}</td>
                    <td className="cell-company">{j.company_name || j.company_slug}</td>
                    <td className="cell-signal">
                      <strong>{j.title}</strong>
                      <p>{j.workplace}</p>
                    </td>
                    <td>
                      <Pill>{j.department}</Pill>
                    </td>
                    <td>{j.location}</td>
                    <td>{j.region}</td>
                    <td className="cell-source">
                      <Pill tone="conf-reported">public</Pill>
                      <a href={j.source_url} target="_blank" rel="noreferrer">
                        View on LinkedIn
                      </a>
                      {j.linkedin_company_url && (
                        <a href={j.linkedin_company_url} target="_blank" rel="noreferrer" className="muted-link">
                          All company jobs
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
            label: policy || 'LinkedIn public job listings',
            confidence: 'reported',
            url: linkedin?.jobsUrl || 'https://www.linkedin.com/jobs/',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
