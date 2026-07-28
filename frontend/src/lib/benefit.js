/** Client-side benefit corpus (mirrors server/benefit.js). */

const STANDARD_COVERAGE = {
  companySignals: 8,
  peerSignals: 40,
  hiringRoles: 48,
  xThemes: 36,
  suggestions: 6,
  products: 4,
  peers: 5,
  searchRegions: 3,
  sourceFields: 13,
};

const TARGET_BASELINE_HOURS = 56;

const CORPUS_INCLUDES = [
  'Signals, hiring, products, search, and X themes at the same depth for every company',
  'Five peers monitored per company with balanced intel coverage',
  'Evidence-backed suggestions drafted from peer gaps and public signals',
  'Executive brief, threats, gaps, and leadership views synthesized per company',
];

export const BENEFIT_POLICY =
  'Time saved is a corpus-level estimate: the manual research effort to build one company profile at the standard depth in this watch list. Every company receives the same coverage — switch to Overview or Suggestions for company-specific priorities.';

function timeBreakdown(metrics) {
  return [
    { task: 'Company & peer profile setup', hours: 4, note: `${metrics.peers} peers per company` },
    {
      task: 'Signal monitoring (press & launches)',
      hours: Math.round(metrics.companySignals * 0.7 + metrics.peerSignals * 0.12),
      note: `${metrics.companySignals + metrics.peerSignals} items per company`,
    },
    {
      task: 'LinkedIn hiring scan',
      hours: Math.round(metrics.hiringRoles * 0.35),
      note: `${metrics.hiringRoles} public roles per company`,
    },
    {
      task: 'Product & feature landscape',
      hours: Math.round(metrics.products * 0.9 + metrics.peers * 1.1),
      note: `${metrics.products} SKUs vs peers`,
    },
    {
      task: 'Search & regional demand',
      hours: Math.round(metrics.searchRegions * 1.1 + 2),
      note: `${metrics.searchRegions} regions + queries`,
    },
    {
      task: 'X / social theme tracking',
      hours: Math.round(metrics.xThemes * 0.22),
      note: `${metrics.xThemes} public themes per company`,
    },
    {
      task: 'Strategic suggestions draft',
      hours: Math.round(metrics.suggestions * 1.1),
      note: `${metrics.suggestions} evidence-backed items per company`,
    },
  ];
}

function baselineHours(breakdown) {
  return breakdown.reduce((sum, row) => sum + row.hours, 0);
}

function scaleBreakdown(breakdown, targetHours) {
  const raw = baselineHours(breakdown);
  if (raw <= 0) return breakdown;
  const scaled = breakdown.map((row) => ({
    ...row,
    hours: Math.max(1, Math.round((row.hours / raw) * targetHours)),
  }));
  const diff = targetHours - baselineHours(scaled);
  if (diff !== 0 && scaled.length) {
    scaled[scaled.length - 1] = {
      ...scaled[scaled.length - 1],
      hours: scaled[scaled.length - 1].hours + diff,
    };
  }
  return scaled;
}

const TARGET_DATA_POINTS =
  STANDARD_COVERAGE.companySignals +
  STANDARD_COVERAGE.peerSignals +
  STANDARD_COVERAGE.hiringRoles +
  STANDARD_COVERAGE.xThemes +
  STANDARD_COVERAGE.suggestions +
  STANDARD_COVERAGE.products;

export function buildBenefitCorpus(store) {
  if (store.benefitCorpus) return store.benefitCorpus;

  const breakdown = scaleBreakdown(timeBreakdown(STANDARD_COVERAGE), TARGET_BASELINE_HOURS);
  return {
    researchBaselineHours: TARGET_BASELINE_HOURS,
    researchCoverage: STANDARD_COVERAGE,
    timeBreakdown: breakdown,
    dataPointsTracked: TARGET_DATA_POINTS,
    companyCount: store.companies?.length || 0,
    includes: CORPUS_INCLUDES,
  };
}
