import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

function formatPosted(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LinkedInPage({ embedded = false }) {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [jobs, setJobs] = useState([]);
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regionFilter, setRegionFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    setRegionFilter('all');
    setDeptFilter('all');
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

  const companyJobsList = useMemo(
    () => jobs.filter((j) => j.company_slug === slug),
    [jobs, slug]
  );

  const filtered = useMemo(() => {
    return companyJobsList.filter((j) => {
      if (regionFilter !== 'all' && j.region !== regionFilter) return false;
      if (deptFilter !== 'all' && j.department !== deptFilter) return false;
      return true;
    });
  }, [companyJobsList, regionFilter, deptFilter]);

  const companyRegions = useMemo(() => {
    const counts = {};
    companyJobsList.forEach((j) => {
      counts[j.region] = (counts[j.region] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [companyJobsList]);

  const companyDepartments = useMemo(() => {
    const counts = {};
    companyJobsList.forEach((j) => {
      counts[j.department] = (counts[j.department] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [companyJobsList]);

  const companyJobs = companyJobsList.length;
  const topRegion = companyRegions[0]?.[0];

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;

  return (
    <div className={embedded ? 'intel-panel' : 'page'}>
      {!embedded && (
        <div className="hero hero--compact">
          <h1>LinkedIn hiring</h1>
          <p className="lede">
            Where {companyName} is hiring — public LinkedIn listings by role, team, and region.
          </p>
          {linkedin?.jobsUrl && (
            <p className="lede" style={{ marginTop: '0.5rem' }}>
              <a href={linkedin.jobsUrl} target="_blank" rel="noreferrer">
                View all {companyName} roles on LinkedIn →
              </a>
            </p>
          )}
        </div>
      )}
      {embedded && linkedin?.jobsUrl && (
        <p className="intel-panel__link">
          <a href={linkedin.jobsUrl} target="_blank" rel="noreferrer">
            View all {companyName} roles on LinkedIn →
          </a>
        </p>
      )}

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Open roles" value={companyJobs} hint={`${companyName} only`} />
        <Stat label="Top hiring region" value={topRegion || '—'} hint="Most open roles" />
        <Stat label="Departments" value={companyDepartments.length} hint="Teams with listings" />
      </div>

      <div className="grid grid--2">
        <Card title="Hiring by region" subtitle={`Where ${companyName} is recruiting`}>
          {companyRegions.length === 0 ? (
            <Empty message={`No open roles tracked for ${companyName}.`} />
          ) : (
            <BarChart
              horizontal
              categories={companyRegions.map(([r]) => r)}
              series={[{ name: 'Open roles', data: companyRegions.map(([, n]) => n) }]}
              height={Math.max(180, companyRegions.length * 36)}
              xAxisLabel="Open role count"
              yAxisLabel="Region"
            />
          )}
        </Card>
        <Card title="Hiring by department" subtitle="Teams with open roles">
          {companyDepartments.length === 0 ? (
            <Empty message={`No open roles tracked for ${companyName}.`} />
          ) : (
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {companyDepartments.map(([dept, count]) => (
                  <tr key={dept}>
                    <td>{dept}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Card title="Open roles" subtitle={`${filtered.length} shown · public LinkedIn listings`}>
        <FilterBar className="filter-toolbar--inset">
          <FilterSelect
            label="Region"
            value={regionFilter}
            onChange={setRegionFilter}
            options={[
              { value: 'all', label: 'All regions' },
              ...companyRegions.map(([r]) => ({ value: r, label: r })),
            ]}
          />
          <FilterSelect
            label="Team"
            value={deptFilter}
            onChange={setDeptFilter}
            options={[
              { value: 'all', label: 'All teams' },
              ...companyDepartments.map(([d]) => ({ value: d, label: d })),
            ]}
          />
        </FilterBar>

        {filtered.length === 0 ? (
          <Empty message="No roles match these filters." />
        ) : (
          <div className="table-wrap">
            <table className="table table--signals">
              <thead>
                <tr>
                  <th>Posted</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Location</th>
                  <th>Region</th>
                  <th>LinkedIn</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.id}>
                    <td className="cell-date">{formatPosted(j.posted_at)}</td>
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
