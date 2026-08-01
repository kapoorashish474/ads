import { THEME_PATTERNS } from './researchActivity';

const ROUTE_BY_TYPE = {
  DSP: 'Demand-side platform · buyer-first',
  SSP: 'Supply-side platform · publisher monetization',
  'Retail media': 'Retail media network · commerce data',
  'Ad network': 'Specialist formats · differentiated inventory',
};

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function topEntries(counts, limit = 3) {
  return counts.slice(0, limit).map(([label, value]) => ({ label, value }));
}

function scoreThemes(texts) {
  const scores = {};
  for (const text of texts) {
    if (!text) continue;
    for (const { label, re } of THEME_PATTERNS) {
      if (re.test(text)) scores[label] = (scores[label] || 0) + 1;
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1]);
}

function peerAverage(values, excludeSlug) {
  const peerValues = values.filter((v) => v.slug !== excludeSlug).map((v) => v.value);
  if (!peerValues.length) return 0;
  return Math.round((peerValues.reduce((a, b) => a + b, 0) / peerValues.length) * 10) / 10;
}

function buildInvestment(company, signals, jobs) {
  const companySignals = signals.filter((s) => s.company_slug === company.slug);
  const companyJobs = jobs.filter((j) => j.company_slug === company.slug);

  return {
    openRoles: companyJobs.length,
    signalCount: companySignals.length,
    topDepartments: topEntries(countBy(companyJobs, (j) => j.department)),
    topSignalTypes: topEntries(
      countBy(companySignals, (s) => {
        if (s.type === 'launch') return 'Launches';
        if (s.type === 'product') return 'Product updates';
        if (s.type === 'partnership') return 'Partnerships';
        return s.type;
      })
    ),
    topSegments: (company.revenueSegments || [])
      .slice()
      .sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))
      .slice(0, 3)
      .map((s) => ({ label: s.name, value: s.pct })),
  };
}

function buildRoute(company, signals, jobs, posts) {
  const companySignals = signals.filter((s) => s.company_slug === company.slug);
  const companyJobs = jobs.filter((j) => j.company_slug === company.slug);
  const companyPosts = posts.filter((p) => p.company_slug === company.slug);

  const texts = [
    ...companySignals.map((s) => `${s.title} ${s.summary}`),
    ...companyJobs.map((j) => `${j.title} ${j.department}`),
    ...companyPosts.map((p) => `${p.text || ''} ${p.theme || ''}`),
    company.tagline || '',
    ...(company.suggestionSummary?.focus || []),
  ];

  const themes = scoreThemes(texts).slice(0, 3).map(([label]) => label);
  const routeLabel = ROUTE_BY_TYPE[company.type] || company.type;

  return {
    routeLabel,
    themes,
    focus: company.suggestionSummary?.focus || [],
    headline: company.suggestionSummary?.headline || company.tagline,
  };
}

function buildProfile(company, isYou, signals, jobs, posts) {
  return {
    slug: company.slug,
    name: company.name,
    isYou,
    type: company.type,
    investment: buildInvestment(company, signals, jobs),
    route: buildRoute(company, signals, jobs, posts),
    strengths: company.strengthRadar || [],
    winning: (company.winning || []).slice(0, 2),
  };
}

export function buildDimensionWinners(profiles) {
  const labels = profiles[0]?.strengths.map((s) => s.label) || [];
  return labels.map((dimension) => {
    const scores = profiles
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        isYou: p.isYou,
        value: p.strengths.find((s) => s.label === dimension)?.value ?? 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      dimension,
      winner: scores[0],
      runnerUp: scores[1] || null,
      margin: scores[0].value - (scores[1]?.value ?? 0),
      scores,
    };
  });
}

export function buildInvestmentComparison(profiles, focusSlug, { mode = 'all', opponentSlug } = {}) {
  const deptTotals = {};
  profiles.forEach((p) => {
    p.investment.topDepartments.forEach(({ label, value }) => {
      if (!deptTotals[label]) deptTotals[label] = [];
      deptTotals[label].push({ slug: p.slug, name: p.name, value, isYou: p.isYou });
    });
  });

  const categories = Object.entries(deptTotals)
    .map(([dept, rows]) => ({
      dept,
      total: rows.reduce((s, r) => s + r.value, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((r) => r.dept);

  const youSeries = categories.map((dept) => {
    const row = profiles.find((p) => p.slug === focusSlug);
    return row?.investment.topDepartments.find((d) => d.label === dept)?.value ?? 0;
  });

  const opponent =
    mode === 'one' && opponentSlug ? profiles.find((p) => p.slug === opponentSlug) : null;

  const opponentSeries = categories.map((dept) => {
    if (opponent) {
      return opponent.investment.topDepartments.find((d) => d.label === dept)?.value ?? 0;
    }
    const rows = deptTotals[dept] || [];
    return peerAverage(rows, focusSlug);
  });

  return {
    categories,
    youSeries,
    opponentSeries,
    opponentLabel: opponent?.name || 'Peer avg',
    mode,
  };
}

export function buildCompareModel({
  company,
  peers,
  signals = [],
  jobs = [],
  posts = [],
  mode = 'all',
  opponentSlug,
}) {
  const activePeers =
    mode === 'one' && opponentSlug ? peers.filter((p) => p.slug === opponentSlug) : peers;

  const profiles = [
    buildProfile(company, true, signals, jobs, posts),
    ...activePeers.map((p) => buildProfile(p, false, signals, jobs, posts)),
  ];

  const resolvedOpponentSlug =
    mode === 'one' ? activePeers[0]?.slug || opponentSlug : undefined;

  const dimensionWinners = buildDimensionWinners(profiles);
  const youWins = dimensionWinners.filter((d) => d.winner.isYou).length;
  const investmentChart = buildInvestmentComparison(profiles, company.slug, {
    mode,
    opponentSlug: resolvedOpponentSlug,
  });

  const you = profiles.find((p) => p.isYou);
  const peerProfiles = profiles.filter((p) => !p.isYou);
  const peerOpenRoles =
    peerProfiles.length > 0
      ? mode === 'one'
        ? peerProfiles[0].investment.openRoles
        : Math.round(peerProfiles.reduce((s, p) => s + p.investment.openRoles, 0) / peerProfiles.length)
      : 0;

  const opponent = peerProfiles[0];

  return {
    mode,
    opponentSlug: resolvedOpponentSlug,
    opponentName: opponent?.name,
    profiles,
    dimensionWinners,
    investmentChart,
    summary: {
      dimensionsWon: youWins,
      dimensionTotal: dimensionWinners.length,
      openRoles: you?.investment.openRoles ?? 0,
      peerOpenRoles,
      topInvestment:
        you?.investment.topDepartments[0]?.label ||
        you?.investment.topSegments[0]?.label ||
        '—',
      primaryRoute: you?.route.routeLabel || '—',
      primaryTheme: you?.route.themes[0] || '—',
    },
  };
}
