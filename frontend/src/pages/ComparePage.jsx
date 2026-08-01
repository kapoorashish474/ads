import { useEffect, useMemo, useState } from 'react';
import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { FilterBar, FilterSelect } from '../components/FilterBar';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';
import { buildCompareModel } from '../utils/compare';

function WinnerBadge({ winner, isYou }) {
  if (!winner) return '—';
  return (
    <span className={`compare-win ${isYou ? 'compare-win--you' : ''}`}>
      {winner.name}
      <span className="compare-win__score">{winner.value}</span>
    </span>
  );
}

function RouteCard({ profile }) {
  return (
    <article className={`compare-route ${profile.isYou ? 'compare-route--you' : ''}`}>
      <header className="compare-route__head">
        <strong>{profile.name}</strong>
        {profile.isYou && <Pill tone="conf-reported">You</Pill>}
      </header>
      <p className="compare-route__label">{profile.route.routeLabel}</p>
      {profile.route.headline && <p className="compare-route__headline">{profile.route.headline}</p>}
      {profile.route.themes.length > 0 && (
        <div className="compare-route__themes">
          {profile.route.themes.map((theme) => (
            <Pill key={theme}>{theme}</Pill>
          ))}
        </div>
      )}
      {profile.route.focus.length > 0 && (
        <ul className="compare-route__focus">
          {profile.route.focus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function ComparePage() {
  const { data, loading, error, slug } = useCompany();
  const [intel, setIntel] = useState({ signals: [], jobs: [], posts: [] });
  const [intelLoading, setIntelLoading] = useState(true);
  const [mode, setMode] = useState('all');
  const [opponentSlug, setOpponentSlug] = useState('');

  useEffect(() => {
    setIntelLoading(true);
    Promise.all([api.signals(slug), api.hiring(slug), api.xPosts(slug)])
      .then(([signalsRes, hiringRes, xRes]) => {
        setIntel({
          signals: signalsRes.signals || [],
          jobs: hiringRes.jobs || [],
          posts: xRes.posts || [],
        });
      })
      .catch(() => setIntel({ signals: [], jobs: [], posts: [] }))
      .finally(() => setIntelLoading(false));
  }, [slug]);

  const peers = data?.peers || [];

  useEffect(() => {
    if (!peers.length) {
      setOpponentSlug('');
      return;
    }
    setOpponentSlug((prev) => (peers.some((p) => p.slug === prev) ? prev : peers[0].slug));
  }, [slug, peers]);

  const model = useMemo(() => {
    if (!data?.company) return null;
    return buildCompareModel({
      company: data.company,
      peers,
      mode,
      opponentSlug: mode === 'one' ? opponentSlug : undefined,
      ...intel,
    });
  }, [data, intel, mode, opponentSlug, peers]);

  if (loading || intelLoading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data?.company || !model) return <Empty message="Could not load comparison data." />;

  const { company } = data;
  const ds = company.dataSources || {};
  const { profiles, dimensionWinners, investmentChart, summary } = model;
  const isOneVsOne = mode === 'one';
  const opponentLabel = model.opponentName || 'peer';
  const compareTarget = isOneVsOne ? opponentLabel : `${peers.length} peers`;

  const rolesDelta =
    summary.peerOpenRoles > 0
      ? Math.round(((summary.openRoles - summary.peerOpenRoles) / summary.peerOpenRoles) * 100)
      : null;

  const rolesHint = isOneVsOne
    ? rolesDelta != null
      ? `${rolesDelta > 0 ? '+' : ''}${rolesDelta}% vs ${opponentLabel}`
      : `${summary.peerOpenRoles} roles at ${opponentLabel}`
    : rolesDelta != null
      ? `${rolesDelta > 0 ? '+' : ''}${rolesDelta}% vs ${summary.peerOpenRoles} peer avg`
      : 'Verified careers listings';

  const dimensionsHint = isOneVsOne
    ? `Head-to-head vs ${opponentLabel}`
    : 'Strength radar vs all peers';

  return (
    <div className="page page--compare">
      <div className="compare-toolbar">
        <div className="compare-mode-tabs" role="tablist" aria-label="Compare mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'one'}
            className={mode === 'one' ? 'compare-mode-tab active' : 'compare-mode-tab'}
            onClick={() => setMode('one')}
          >
            1 vs 1
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'all'}
            className={mode === 'all' ? 'compare-mode-tab active' : 'compare-mode-tab'}
            onClick={() => setMode('all')}
          >
            1 vs all
          </button>
        </div>

        {isOneVsOne && peers.length > 0 && (
          <FilterBar className="compare-toolbar__peer">
            <FilterSelect
              label="Compare to"
              value={opponentSlug}
              onChange={setOpponentSlug}
              options={peers.map((p) => ({ value: p.slug, label: p.name }))}
            />
          </FilterBar>
        )}
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat
          label="Dimensions won"
          value={`${summary.dimensionsWon}/${summary.dimensionTotal}`}
          hint={dimensionsHint}
          source={ds.radar}
        />
        <Stat
          label="Open roles"
          value={summary.openRoles}
          hint={rolesHint}
          source={ds.hiring}
        />
        <Stat
          label="Top hiring bet"
          value={summary.topInvestment}
          hint="Largest team investment"
          source={ds.hiring}
        />
        <Stat
          label="Primary route"
          value={summary.primaryTheme}
          hint={summary.primaryRoute}
          source={ds.signals}
        />
      </div>

      <Card
        title="Where they're investing"
        subtitle={`Hiring, revenue mix, and signal activity · ${company.name} vs ${compareTarget}`}
      >
        <p className="compare-lede">
          {isOneVsOne
            ? `Head-to-head hiring and revenue focus — ${company.name} vs ${opponentLabel}.`
            : `Side-by-side view of where ${company.name} puts headcount and mindshare versus the full peer set (${peers.map((p) => p.name).join(', ')}).`}
        </p>

        <div className="grid grid--2 compare-invest-grid">
          <div>
            <h4 className="compare-subhead">Hiring by team</h4>
            {investmentChart.categories.length === 0 ? (
              <p className="muted">No verified hiring data to compare.</p>
            ) : (
              <>
                <BarChart
                  categories={investmentChart.categories}
                  series={[
                    { name: company.name, data: investmentChart.youSeries },
                    { name: investmentChart.opponentLabel, data: investmentChart.opponentSeries },
                  ]}
                  height={Math.max(220, investmentChart.categories.length * 44)}
                  xAxisLabel="Open roles"
                  yAxisLabel="Team"
                />
                <div className="segment-compare__legend">
                  <span>
                    <span className="segment-compare__dot segment-compare__dot--you" />
                    {company.name}
                  </span>
                  <span>
                    <span className="segment-compare__dot segment-compare__dot--peer" />
                    {investmentChart.opponentLabel}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="compare-invest-table-wrap">
            <table className="table table--compact compare-invest-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Roles</th>
                  <th>Top teams</th>
                  <th>Revenue focus</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.slug} className={p.isYou ? 'compare-row--you' : ''}>
                    <td className="intel-compare__name">
                      {p.name}
                      {p.isYou && <span className="compare-you-tag">You</span>}
                    </td>
                    <td>{p.investment.openRoles}</td>
                    <td>
                      {p.investment.topDepartments.map((d) => d.label).join(', ') || '—'}
                    </td>
                    <td>
                      {p.investment.topSegments.map((s) => `${s.label} (${s.value}%)`).join(' · ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SourceFootnote
          source={{
            label: 'Hiring from verified careers feeds · revenue segments from public filings/estimates',
            confidence: 'mixed',
            url: ds.hiring?.url,
            asOf: ds.hiring?.asOf,
          }}
        />
      </Card>

      <Card
        title="Strategy routes"
        subtitle={
          isOneVsOne
            ? `Positioning contrast · ${company.name} vs ${opponentLabel}`
            : 'How each company is positioning and where momentum is aimed'
        }
      >
        <p className="compare-lede">
          Inferred from public signals, hiring patterns, and stated focus areas — not internal roadmaps.
        </p>
        <div className={`compare-route-grid ${isOneVsOne ? 'compare-route-grid--duo' : ''}`}>
          {profiles.map((p) => (
            <RouteCard key={p.slug} profile={p} />
          ))}
        </div>
        <SourceFootnote
          source={{
            label: 'Route themes from signals, hiring, and suggestion focus areas',
            confidence: 'inferred',
            url: company.website,
            asOf: company.refreshedAt?.slice(0, 7) || '2026-07',
          }}
        />
      </Card>

      <Card
        title="Who wins where"
        subtitle={
          isOneVsOne
            ? `Strength radar · ${company.name} vs ${opponentLabel}`
            : 'Strength radar dimensions · higher score wins the row'
        }
      >
        <p className="compare-lede">
          {isOneVsOne
            ? `${company.name} leads ${summary.dimensionsWon} of ${summary.dimensionTotal} dimensions against ${opponentLabel}.`
            : `${company.name} leads ${summary.dimensionsWon} of ${summary.dimensionTotal} capability dimensions in this peer set.`}
        </p>

        <div className="table-wrap">
          <table className="table table--compare-winners">
            <thead>
              <tr>
                <th>Dimension</th>
                {profiles.map((p) => (
                  <th key={p.slug} className={p.isYou ? 'compare-col--you' : ''}>
                    {p.name}
                  </th>
                ))}
                <th>Winner</th>
              </tr>
            </thead>
            <tbody>
              {dimensionWinners.map((row) => (
                <tr key={row.dimension}>
                  <td>{row.dimension}</td>
                  {profiles.map((p) => {
                    const score = row.scores.find((s) => s.slug === p.slug);
                    const isWin = score?.slug === row.winner.slug;
                    return (
                      <td
                        key={p.slug}
                        className={`compare-score ${isWin ? 'compare-score--win' : ''} ${p.isYou ? 'compare-col--you' : ''}`}
                      >
                        {score?.value ?? '—'}
                      </td>
                    );
                  })}
                  <td>
                    <WinnerBadge winner={row.winner} isYou={row.winner.isYou} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`compare-winning-grid ${isOneVsOne ? 'compare-winning-grid--duo' : ''}`}>
          {profiles.map((p) => (
            <div key={p.slug} className={`compare-winning ${p.isYou ? 'compare-winning--you' : ''}`}>
              <h4>{p.name}</h4>
              {p.winning.length === 0 ? (
                <p className="muted">No winning themes recorded.</p>
              ) : (
                <ul>
                  {p.winning.map((w) => (
                    <li key={w.text}>{w.text}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <SourceFootnote source={ds.radar} />
      </Card>
    </div>
  );
}
