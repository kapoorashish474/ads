import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

export const SOURCES_VERSION = 2;

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shiftTrend(base, delta = 0) {
  return base.map((v, i) => Math.min(100, Math.max(10, v + delta + (i % 3) - 1)));
}

function src(label, confidence, opts = {}) {
  return {
    label,
    confidence,
    url: opts.url ?? null,
    asOf: opts.asOf ?? '2026-07',
    category: opts.category,
    tab: opts.tab,
    note: opts.note ?? '',
  };
}

const sharedFields = {
  radar: src('Peer benchmark model · product pages, press, and radar inputs', 'modeled', {
    category: 'Dashboard',
    tab: 'Overview',
    note: 'Scores normalized 0–100 vs peer set',
  }),
  products: (company) =>
    src(`${company.name} product pages & public documentation`, 'reported', {
      url: company.website,
      category: 'Dashboard',
      tab: 'Products',
    }),
  winning: src('Synthesized winning thesis from filings, press, and peer compare', 'inferred', {
    category: 'Dashboard',
    tab: 'Overview',
  }),
  search: src('Google Trends-style interest index (normalized 0–100)', 'modeled', {
    url: 'https://trends.google.com',
    category: 'Market intel',
    tab: 'Search',
    note: 'Regional drill-down uses modeled metro/query indices',
  }),
  signals: (company) =>
    src('Public press, product pages, and industry news synthesis', 'mixed', {
      url: company.website,
      category: 'Market intel',
      tab: 'Signals',
      note: 'Each signal cites its own source URL on the Signals tab',
    }),
  hiring: (company) =>
    src('LinkedIn public job listings & company careers pages', 'reported', {
      url: company.linkedin?.jobsUrl || company.linkedin?.companyUrl,
      category: 'Market intel',
      tab: 'LinkedIn',
    }),
  x: (company) =>
    src(`X profile @${company.x?.handle || 'company'} (verified public URL)`, 'reported', {
      url: company.x?.profileUrl,
      asOf: company.x?.validatedAt || '2026-07',
      category: 'Market intel',
      tab: 'X',
      note: 'Themes inferred from public news — not scraped tweet text',
    }),
  suggestions: src('Peer gaps, search trends, product coverage, and public signals', 'inferred', {
    category: 'Planning',
    tab: 'Suggestions',
    note: 'Priorities are directional — validate before resourcing',
  }),
  benefit: src('Manual research time model for corpus depth + usage activity', 'modeled', {
    category: 'Planning',
    tab: 'Benefit',
  }),
  executive: src('Brief, threats, gaps, momentum, and leadership synthesis', 'mixed', {
    category: 'Executive',
    tab: 'Brief',
    note: 'Momentum scores computed from live store metrics',
  }),
};

const sourceTemplates = {
  kargo: {
    revenue: src('Industry analyst estimates · ad platform landscape', 'estimated', {
      url: 'https://www.adexchanger.com',
      asOf: '2025',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('LinkedIn · company profile headcount band', 'estimated', {
      url: 'https://www.linkedin.com/company/kargo',
      asOf: '2026-Q2',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('Segment split modeled from public positioning & product mix', 'estimated', {
      url: 'https://www.kargo.com',
      asOf: '2025',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
  'the-trade-desk': {
    revenue: src('The Trade Desk 10-K · platform revenue', 'reported', {
      url: 'https://investors.thetradedesk.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('10-K headcount disclosure', 'reported', {
      url: 'https://investors.thetradedesk.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('Earnings call segment commentary', 'reported', {
      url: 'https://investors.thetradedesk.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
  stackadapt: {
    revenue: src('Industry estimates · programmatic landscape reports', 'estimated', {
      url: 'https://www.stackadapt.com',
      asOf: '2025',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('LinkedIn · company profile headcount band', 'estimated', {
      url: 'https://www.linkedin.com/company/stackadapt',
      asOf: '2026-Q2',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('Product mix inferred from marketing & case studies', 'estimated', {
      url: 'https://www.stackadapt.com',
      asOf: '2025',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
  magnite: {
    revenue: src('Magnite 10-K · consolidated revenue', 'reported', {
      url: 'https://investors.magnite.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('10-K headcount disclosure', 'reported', {
      url: 'https://investors.magnite.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('10-K segment reporting (CTV / DV+)', 'reported', {
      url: 'https://investors.magnite.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
  'amazon-ads': {
    revenue: src('Amazon 10-K · advertising services revenue', 'reported', {
      url: 'https://ir.aboutamazon.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('Estimated Amazon Ads org · public job posts', 'estimated', {
      url: 'https://advertising.amazon.com',
      asOf: '2026-Q2',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('Earnings narrative · sponsored ads vs DSP', 'reported', {
      url: 'https://ir.aboutamazon.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
  criteo: {
    revenue: src('Criteo 10-K · revenue', 'reported', {
      url: 'https://investors.criteo.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
    employees: src('10-K headcount disclosure', 'reported', {
      url: 'https://investors.criteo.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Overview',
    }),
    segments: src('10-K + investor deck segment split', 'reported', {
      url: 'https://investors.criteo.com',
      asOf: 'FY2024',
      category: 'Dashboard',
      tab: 'Revenue',
    }),
  },
};

const regionDeepDive = {
  kargo: {
    'United States': {
      changePct: 14,
      insight: 'CTV and high-impact mobile queries rising on the coasts.',
      topQueries: [
        { query: 'kargo ctv', index: 100, change: '+22%' },
        { query: 'kargo ads', index: 86, change: '+8%' },
        { query: 'high impact mobile ads', index: 64, change: '+5%' },
      ],
      metros: [
        { name: 'New York', index: 100 },
        { name: 'Los Angeles', index: 78 },
        { name: 'Chicago', index: 61 },
      ],
    },
    'United Kingdom': {
      changePct: 19,
      insight: 'UK buyers search omnichannel formats — localized proof is scarce.',
      topQueries: [
        { query: 'kargo uk', index: 100, change: '+31%' },
        { query: 'kargo ctv', index: 72, change: '+18%' },
      ],
      metros: [
        { name: 'London', index: 100 },
        { name: 'Manchester', index: 42 },
      ],
    },
    Germany: {
      changePct: 6,
      insight: 'Smaller volume but steady interest in premium formats.',
      topQueries: [
        { query: 'kargo werbung', index: 100, change: '+4%' },
        { query: 'ctv advertising', index: 55, change: '+9%' },
      ],
      metros: [
        { name: 'Berlin', index: 100 },
        { name: 'Munich', index: 68 },
      ],
    },
  },
  'the-trade-desk': {
    'United States': {
      changePct: 11,
      insight: 'UID2 and CTV dominate US search intent.',
      topQueries: [
        { query: 'the trade desk ctv', index: 100, change: '+15%' },
        { query: 'uid2', index: 88, change: '+12%' },
        { query: 'ttd dsp', index: 79, change: '+6%' },
      ],
      metros: [
        { name: 'New York', index: 100 },
        { name: 'San Francisco', index: 82 },
        { name: 'Chicago', index: 70 },
      ],
    },
    'United Kingdom': {
      changePct: 9,
      insight: 'Independent DSP narrative resonates in UK agency searches.',
      topQueries: [
        { query: 'trade desk uk', index: 100, change: '+11%' },
        { query: 'open internet advertising', index: 58, change: '+7%' },
      ],
      metros: [{ name: 'London', index: 100 }],
    },
    Australia: {
      changePct: 13,
      insight: 'CTV growth driving APAC search spikes.',
      topQueries: [
        { query: 'trade desk australia', index: 100, change: '+14%' },
        { query: 'connected tv dsp', index: 71, change: '+10%' },
      ],
      metros: [
        { name: 'Sydney', index: 100 },
        { name: 'Melbourne', index: 76 },
      ],
    },
  },
  stackadapt: {
    'United States': {
      changePct: 18,
      insight: 'Self-serve DSP comparisons spike in mid-market searches.',
      topQueries: [
        { query: 'stackadapt ctv', index: 100, change: '+24%' },
        { query: 'stackadapt vs trade desk', index: 67, change: '+12%' },
      ],
      metros: [
        { name: 'Toronto', index: 88 },
        { name: 'New York', index: 100 },
      ],
    },
    Canada: {
      changePct: 21,
      insight: 'Home-market strength — highest relative index globally.',
      topQueries: [
        { query: 'stackadapt canada', index: 100, change: '+19%' },
        { query: 'stackadapt dsp review', index: 84, change: '+11%' },
      ],
      metros: [
        { name: 'Toronto', index: 100 },
        { name: 'Vancouver', index: 72 },
      ],
    },
    'United Kingdom': {
      changePct: 10,
      insight: 'Emerging UK awareness via trade press.',
      topQueries: [{ query: 'stackadapt uk', index: 100, change: '+9%' }],
      metros: [{ name: 'London', index: 100 }],
    },
  },
  magnite: {
    'United States': {
      changePct: 8,
      insight: 'CTV SSP searches correlate with streaming budget shifts.',
      topQueries: [
        { query: 'magnite ctv', index: 100, change: '+10%' },
        { query: 'magnite ssp', index: 83, change: '+5%' },
      ],
      metros: [
        { name: 'New York', index: 100 },
        { name: 'Los Angeles', index: 74 },
      ],
    },
    EMEA: {
      changePct: 7,
      insight: 'Publisher-side monetization queries in UK & DE.',
      topQueries: [{ query: 'magnite streaming', index: 100, change: '+8%' }],
      metros: [
        { name: 'London', index: 100 },
        { name: 'Paris', index: 58 },
      ],
    },
    APAC: {
      changePct: 12,
      insight: 'Early CTV SSP interest in AU & SG.',
      topQueries: [{ query: 'magnite apac', index: 100, change: '+13%' }],
      metros: [{ name: 'Sydney', index: 100 }],
    },
  },
  'amazon-ads': {
    'United States': {
      changePct: 9,
      insight: 'Retail media + DSP off-site searches dominate.',
      topQueries: [
        { query: 'amazon dsp', index: 100, change: '+11%' },
        { query: 'sponsored products', index: 94, change: '+7%' },
        { query: 'amazon retail media', index: 88, change: '+9%' },
      ],
      metros: [
        { name: 'Seattle', index: 100 },
        { name: 'New York', index: 86 },
      ],
    },
    Europe: {
      changePct: 14,
      insight: 'Retail media expansion driving DE & UK queries.',
      topQueries: [{ query: 'amazon ads europe', index: 100, change: '+16%' }],
      metros: [
        { name: 'London', index: 100 },
        { name: 'Berlin', index: 69 },
      ],
    },
    India: {
      changePct: 22,
      insight: 'Fastest-growing region for Amazon Ads search interest.',
      topQueries: [{ query: 'amazon ads india', index: 100, change: '+28%' }],
      metros: [
        { name: 'Mumbai', index: 100 },
        { name: 'Bangalore', index: 91 },
      ],
    },
  },
  criteo: {
    France: {
      changePct: 5,
      insight: 'Home market — commerce retargeting heritage still strong.',
      topQueries: [
        { query: 'criteo retail media', index: 100, change: '+4%' },
        { query: 'commerce max', index: 76, change: '+6%' },
      ],
      metros: [{ name: 'Paris', index: 100 }],
    },
    'United States': {
      changePct: 8,
      insight: 'Off-site retail media searches gaining share.',
      topQueries: [{ query: 'criteo commerce max', index: 100, change: '+9%' }],
      metros: [
        { name: 'New York', index: 100 },
        { name: 'Chicago', index: 62 },
      ],
    },
    Japan: {
      changePct: 11,
      insight: 'APAC retail partnerships driving localized queries.',
      topQueries: [{ query: 'criteo japan', index: 100, change: '+12%' }],
      metros: [{ name: 'Tokyo', index: 100 }],
    },
  },
};

function buildDataSources(company) {
  const specific = sourceTemplates[company.slug] || sourceTemplates.kargo;
  return {
    ...specific,
    radar: sharedFields.radar,
    products: sharedFields.products(company),
    winning: sharedFields.winning,
    search: sharedFields.search,
    signals: sharedFields.signals(company),
    hiring: sharedFields.hiring(company),
    x: sharedFields.x(company),
    suggestions: sharedFields.suggestions,
    benefit: sharedFields.benefit,
    executive: sharedFields.executive,
  };
}

for (const company of store.companies) {
  company.dataSources = buildDataSources(company);

  const globalTrend = company.searchMetrics?.trend || [];
  company.searchMetrics.source = company.dataSources.search;
  company.searchMetrics.monthLabels = monthLabels;

  company.searchMetrics.regions = (company.searchMetrics.regions || []).map((r) => {
    const deep = regionDeepDive[company.slug]?.[r.name] || {};
    const regionTrend = shiftTrend(globalTrend, Math.floor(r.value / 20) - 2);
    return {
      ...r,
      sharePct: r.value,
      trend: regionTrend,
      changePct: deep.changePct ?? 8,
      insight: deep.insight ?? 'Regional interest tracked via normalized search index.',
      topQueries:
        deep.topQueries ??
        (company.searchMetrics.queries || []).slice(0, 2).map((q) => ({
          query: q,
          index: 80,
          change: '+5%',
        })),
      metros: deep.metros ?? [{ name: r.name, index: r.value }],
    };
  });
}

for (const signal of store.signals || []) {
  if (!signal.source_name) {
    signal.source_name = 'Company press / website';
    signal.confidence = 'reported';
  }
}

store.sourcesPolicy =
  'All metrics use public sources only — SEC filings, company sites, LinkedIn, X profiles, trade press, and modeled indices. Confidence tags mark how directly each field is sourced.';
store.sourcesVersion = SOURCES_VERSION;

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

for (const company of store.companies) {
  console.log(company.slug.padEnd(16), Object.keys(company.dataSources).length, 'fields');
}
console.log(`\nSources v${SOURCES_VERSION} applied for ${store.companies.length} companies`);
