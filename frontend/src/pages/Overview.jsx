import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { DonutChart, RadarChart } from '../components/Charts';
import { CardSources } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive, severityTone } from '../hooks/useExecutive';
import { api, formatUsd, formatUsdPerEmployee, revenuePerEmployee, revenuePerEmployeeHint } from '../api';
import { derivedSource, metricLabel } from '../lib/authenticity';
import { peerRadarAverages, radarRank, searchMomentum } from '../utils/metrics';

function formatSignalDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Overview() {
  const { slug, data, loading, error } = useCompany();
  const { executive, loading: execLoading } = useExecutive(slug);
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    api.signals(slug).then((r) => setSignals(r.signals || [])).catch(() => setSignals([]));
  }, [slug]);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const ds = company.dataSources || {};
  const radar = company.strengthRadar || [];
  const search = searchMomentum(company.searchMetrics?.trend, company.searchMetrics, ds.search?.asOf || company.refreshedAt);
  const position = radarRank(company, peers);
  const peerRadar = peerRadarAverages(peers, radar);
  const rpeSource = derivedSource(ds.revenue, ds.employees);
  const summary = company.suggestionSummary;
  const threats = (executive?.brief?.threats || executive?.threats || []).slice(0, 3);
  const recentSignals = signals.filter((s) => s.company_slug === slug).slice(0, 3);
  const peerSignals = signals.filter((s) => s.company_slug !== slug).slice(0, 2);

  return (
    <div className="page">
      <div className="hero">
        <h1>{company.name}</h1>
        <p className="lede">{company.tagline}</p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat label="Ad revenue" value={formatUsd(company.adRevenueUsd)} hint={company.revenueLabel} source={ds.revenue} />
        <Stat
          label="Revenue / employee"
          value={formatUsdPerEmployee(revenuePerEmployee(company))}
          hint={revenuePerEmployeeHint(company, peers)}
          source={rpeSource}
        />
        <Stat
          label={metricLabel('Search index', ds.search)}
          value={search?.index ?? '—'}
          hint={
            search?.latestMonth
              ? `${search.latestMonth}${search.changePct != null ? ` · ${search.changePct > 0 ? '+' : ''}${search.changePct}% vs ${search.startMonth || 'start'}` : ''}`
              : 'Market attention trend'
          }
          source={ds.search}
        />
        <Stat label="Employees" value={company.employees?.toLocaleString() || '—'} source={ds.employees} />
      </div>

      <div className="grid grid--2">
        <Card title="Priority this cycle" subtitle="Top focus from the suggestion register" collapsible defaultOpen>
          {summary?.headline ? (
            <>
              <p className="overview-priority">{summary.headline}</p>
              {(summary.focus || []).length > 0 && (
                <ul className="overview-focus">
                  {summary.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="muted">No priority summary for this company yet.</p>
          )}
          <Link to="/suggestions" className="card-link">
            Open suggestion register →
          </Link>
        </Card>

        <Card title="Risks to watch" subtitle="Top competitive threats" collapsible defaultOpen>
          {execLoading ? (
            <p className="muted">Loading threats…</p>
          ) : threats.length === 0 ? (
            <Empty message="No threats flagged for this company." />
          ) : (
            <div className="table-wrap table-wrap--flat">
              <table className="table table--compact">
                <thead>
                  <tr>
                    <th>Severity</th>
                    <th>Threat</th>
                  </tr>
                </thead>
                <tbody>
                  {threats.map((t) => (
                    <tr key={t.title}>
                      <td>
                        <Pill tone={severityTone(t.severity)}>{t.severity}</Pill>
                      </td>
                      <td>
                        <strong>{t.title}</strong>
                        <p className="muted table-note">{t.summary}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link to="/products" className="card-link">
            Product gaps & landscape →
          </Link>
        </Card>
      </div>

      {(recentSignals.length > 0 || peerSignals.length > 0) && (
        <Card title="Recent signals" subtitle="Latest moves in your watch list" collapsible defaultOpen={false}>
          <div className="table-wrap table-wrap--flat">
            <table className="table table--compact table--signals">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {[...recentSignals, ...peerSignals].slice(0, 5).map((s) => (
                  <tr key={s.id} className={s.company_slug === slug ? 'row--focus' : ''}>
                    <td className="cell-date">{formatSignalDate(s.published_at)}</td>
                    <td>{s.company_slug === slug ? company.name : peers.find((p) => p.slug === s.company_slug)?.name || s.company_slug}</td>
                    <td className="cell-signal">
                      <strong>{s.title}</strong>
                      <p className="muted table-note">{s.summary}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/intel/signals" className="card-link">
            Full signal feed →
          </Link>
        </Card>
      )}

      <div className="grid grid--2">
        <Card title="Revenue mix" subtitle="Where they earn" collapsible defaultOpen>
          <DonutChart data={company.revenueSegments || []} />
          <CardSources company={company} fields={['segments']} />
          <Link to="/revenue" className="card-link">
            Segment comparison vs peers →
          </Link>
        </Card>

        <Card
          title={metricLabel('Strength benchmark', ds.radar)}
          subtitle={position ? `${position.avg}/100 avg · modeled vs peer set` : 'Modeled strength radar'}
          collapsible
          defaultOpen
        >
          {radar.length === 0 ? (
            <p className="muted">No radar data for this company.</p>
          ) : (
            <RadarChart
              indicators={radar}
              series={[
                { name: company.name, values: radar.map((r) => r.value) },
                { name: 'Peer avg', values: peerRadar },
              ]}
              height={300}
              note="Each axis = strength dimension (0–100). Lines compare company vs peer average."
            />
          )}
          <CardSources company={company} fields={['radar']} />
          <Link to="/products" className="card-link">
            Product gaps & landscape →
          </Link>
        </Card>
      </div>
    </div>
  );
}
