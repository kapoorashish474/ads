import { useEffect, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

const COVERAGE_LABELS = {
  companySignals: 'Your signals',
  peerSignals: 'Peer signals',
  hiringRoles: 'Hiring roles',
  xThemes: 'X themes',
  suggestions: 'Suggestions',
  products: 'Products',
  peers: 'Peers monitored',
  searchRegions: 'Search regions',
  sourceFields: 'Sourced fields',
};

export default function Benefit() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .benefit(slug)
      .then(setBenefit)
      .finally(() => setLoading(false));
  }, [slug]);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError) return <ErrorState message={ctxError} />;

  const snap = benefit?.snapshot || {};
  const coverage = snap.researchCoverage || {};
  const breakdown = snap.timeBreakdown || [];
  const companyName = data?.company?.name || slug;
  const baseline = snap.researchBaselineHours || 0;
  const usageBonus = Math.max(0, (snap.researchHoursSaved || 0) - baseline);

  const coverageRows = Object.entries(coverage).map(([key, value]) => ({
    key,
    label: COVERAGE_LABELS[key] || key,
    value,
  }));

  return (
    <div className="page page--benefit">
      <div className="hero hero--compact">
        <h1>Your benefit</h1>
        <p className="lede">
          What {companyName} gets from this research corpus — tracked data, estimated manual effort
          avoided, and outcomes from the intel.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat
          label="Research hours saved"
          value={`~${snap.researchHoursSaved || 0}h`}
          hint={baseline ? `${baseline}h corpus + 1h usage` : 'Estimated vs manual research'}
        />
        <Stat label="Data points tracked" value={snap.dataPointsTracked || 0} hint="Signals, roles, themes & more" />
        <Stat label="Peers monitored" value={coverage.peers || data?.peers?.length || 0} hint="In your watch list" />
        <Stat label="Suggestions ready" value={coverage.suggestions || 0} hint={`${snap.suggestionsAccepted || 0} accepted`} />
      </div>

      <div className="grid grid--2">
        <Card title="Research coverage" subtitle="What is already researched for this company" collapsible defaultOpen>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>Area</th>
                  <th>Tracked</th>
                </tr>
              </thead>
              <tbody>
                {coverageRows.map((row) => (
                  <tr key={row.key}>
                    <td>{row.label}</td>
                    <td>
                      <strong>{row.value}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="card-note muted">
            Every company gets the same depth per category — signals, hiring, X themes, products, and
            suggestions are balanced across the watch list.
          </p>
        </Card>

        <Card title="Time you would spend manually" subtitle="How we estimate hours saved" collapsible defaultOpen>
          {breakdown.length === 0 ? (
            <Empty message="Run node server/scripts/enrich-benefit.js to seed benefit estimates." />
          ) : (
            <>
              <BarChart
                horizontal
                categories={breakdown.map((b) => b.task)}
                series={[{ name: 'Hours', data: breakdown.map((b) => b.hours) }]}
                height={Math.max(220, breakdown.length * 38)}
              />
              <div className="table-wrap table-wrap--flat">
                <table className="table table--compact">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Hours</th>
                      <th>Includes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((row) => (
                      <tr key={row.task}>
                        <td>{row.task}</td>
                        <td>
                          <strong>{row.hours}h</strong>
                        </td>
                        <td className="muted">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
      </div>

      <Card title="Research outcomes" subtitle="What this intel enables" collapsible defaultOpen>
        {(snap.highlights || []).length === 0 ? (
          <Empty message="No outcome highlights yet for this company." />
        ) : (
          <ul className="takeaway-list">
            {snap.highlights.map((h) => (
              <li key={h} className="takeaway takeaway--implication">
                <p>{h}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Your activity" subtitle="Usage on top of the research baseline" collapsible defaultOpen={false}>
        <div className="grid grid--stats grid--stats-3">
          <Stat label="Deep dives" value={snap.views || 0} hint="Page views this session" />
          <Stat label="Data refreshes" value={benefit?.refreshCount || 0} />
          <Stat label="Signals validated" value={snap.validatedSignals || 0} hint="Marked as confirmed" />
        </div>
        <SourceFootnote
          source={{
            label: benefit?.policy || 'Time saved = manual research estimate for corpus depth + small usage bonus',
            confidence: 'modeled',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
