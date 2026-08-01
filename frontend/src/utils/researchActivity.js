const THEME_PATTERNS = [
  { label: 'CTV & streaming', re: /\b(ctv|connected tv|streaming|fast|ott|video|canvas|prime video)\b/i },
  { label: 'AI & automation', re: /\b(ai|kokai|chatgpt|automation|generative|kera)\b/i },
  { label: 'Retail media', re: /\b(retail media|shopper|commerce|off-site|sponsored products|amc|dsp)\b/i },
  { label: 'Identity & data', re: /\b(uid2|identity|cookieless|clean room|first-party|data)\b/i },
  { label: 'Mobile & formats', re: /\b(mobile|in-app|high-impact|creative|format|scroll)\b/i },
  { label: 'Measurement', re: /\b(measurement|attribution|analytics|attention|viewability)\b/i },
  { label: 'Supply & SSP', re: /\b(ssp|publisher|inventory|supply|openpath|programmatic|yield)\b/i },
  { label: 'Social & platforms', re: /\b(social|bereal|partnership|integration|platform)\b/i },
];

export { THEME_PATTERNS };

const TYPE_LABELS = {
  launch: 'Launches',
  product: 'Product updates',
  partnership: 'Partnerships',
};

function parseDay(iso) {
  if (!iso) return null;
  const day = String(iso).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  return new Date(`${day}T12:00:00`);
}

function dayKey(iso) {
  if (!iso) return null;
  const day = String(iso).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

function monthsBefore(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() - months);
  return d;
}

function inWindow(iso, asOf, months) {
  const day = parseDay(iso);
  if (!day || !asOf) return false;
  return day >= monthsBefore(asOf, months) && day <= asOf;
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

function inferFocus({ signals, jobs, posts }) {
  if (!signals.length && !jobs.length && !posts.length) {
    return 'No dated public activity in corpus for this window';
  }

  const texts = [
    ...signals.map((s) => `${s.title} ${s.summary}`),
    ...jobs.map((j) => `${j.title} ${j.department}`),
    ...posts.map((p) => `${p.text || ''} ${p.theme || ''}`),
  ];

  const themes = scoreThemes(texts).slice(0, 3).map(([label]) => label);

  const types = {};
  signals.forEach((s) => {
    types[s.type] = (types[s.type] || 0) + 1;
  });
  const topTypes = Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([type]) => TYPE_LABELS[type] || type);

  const depts = {};
  jobs.forEach((j) => {
    if (j.department) depts[j.department] = (depts[j.department] || 0) + 1;
  });
  const topDept = Object.entries(depts).sort((a, b) => b[1] - a[1])[0];
  const hiring =
    topDept && topDept[1] >= 2 ? `${topDept[0]} hiring` : topDept ? `${topDept[0]} roles` : null;

  const focus = [...new Set([...themes, ...topTypes, hiring].filter(Boolean))].slice(0, 4);
  return focus.join(' · ');
}

function formatCounts({ signals, jobs, posts }) {
  const total = signals.length + jobs.length + posts.length;
  const parts = [];
  if (signals.length) parts.push(`${signals.length} signal${signals.length === 1 ? '' : 's'}`);
  if (jobs.length) parts.push(`${jobs.length} role${jobs.length === 1 ? '' : 's'}`);
  if (posts.length) parts.push(`${posts.length} post${posts.length === 1 ? '' : 's'}`);
  return { total, breakdown: parts.join(' · ') || '—' };
}

export function resolveResearchAsOf({ company, signals = [], jobs = [], posts = [], slug }) {
  const keys = [
    company?.refreshedAt,
    ...signals.filter((s) => s.company_slug === slug).map((s) => s.published_at),
    ...jobs.filter((j) => j.company_slug === slug).map((j) => j.posted_at),
    ...posts.filter((p) => p.company_slug === slug).map((p) => p.posted_at),
  ]
    .map(dayKey)
    .filter(Boolean);
  const latest = keys.sort().reverse()[0];
  return parseDay(latest) || new Date();
}

export function buildResearchActivityRows({ slug, signals = [], jobs = [], posts = [], asOf }) {
  const anchor = asOf instanceof Date && !Number.isNaN(asOf.getTime()) ? asOf : parseDay(asOf) || new Date();
  const companySignals = signals.filter((s) => s.company_slug === slug);
  const companyJobs = jobs.filter((j) => j.company_slug === slug);
  const companyPosts = posts.filter((p) => p.company_slug === slug);

  return [3, 6].map((months) => {
    const winSignals = companySignals.filter((s) => inWindow(s.published_at, anchor, months));
    const winJobs = companyJobs.filter((j) => inWindow(j.posted_at, anchor, months));
    const winPosts = companyPosts.filter((p) => inWindow(p.posted_at, anchor, months));
    const counts = formatCounts({
      signals: winSignals,
      jobs: winJobs,
      posts: winPosts,
    });

    return {
      months,
      label: months === 3 ? 'Last 3 months' : 'Last 6 months',
      focus: inferFocus({ signals: winSignals, jobs: winJobs, posts: winPosts }),
      total: counts.total,
      breakdown: counts.breakdown,
      signals: winSignals.length,
      jobs: winJobs.length,
      posts: winPosts.length,
    };
  });
}
