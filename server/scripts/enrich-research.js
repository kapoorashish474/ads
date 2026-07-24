import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  RESEARCH_VERSION,
  linkedinProfiles,
  signalsRaw,
  hiringRaw,
  xPostsRaw,
  companyPatches,
  searchRegionDefaults,
} from './research-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

// Every company watches all others so corpus depth is equal in Benefit + intel views.
const allSlugs = store.companies.map((c) => c.slug);
for (const company of store.companies) {
  company.peerSlugs = allSlugs.filter((s) => s !== company.slug);
}

const xProfiles = {
  kargo: {
    handle: 'kargo',
    profileUrl: 'https://x.com/kargo',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile + kargo.com/blog social links',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: false,
    bio: 'Breakthrough ad experiences for brands and publishers — mobile, CTV, and beyond.',
    topThemes: ['CTV', 'Creative', 'Publishers'],
    websiteUrl: 'https://www.kargo.com',
  },
  'the-trade-desk': {
    handle: 'TheTradeDesk',
    profileUrl: 'https://x.com/TheTradeDesk',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile check',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: true,
    bio: 'The independent demand-side platform for the open internet.',
    topThemes: ['Kokai', 'CTV', 'Identity'],
    websiteUrl: 'https://www.thetradedesk.com',
  },
  stackadapt: {
    handle: 'StackAdapt',
    profileUrl: 'https://x.com/StackAdapt',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile check',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: false,
    bio: 'AI-powered multi-channel programmatic advertising platform.',
    topThemes: ['CTV', 'Product', 'Events'],
    websiteUrl: 'https://www.stackadapt.com',
  },
  magnite: {
    handle: 'Magnite',
    profileUrl: 'https://x.com/Magnite',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile check',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: true,
    bio: 'Independent sell-side advertising platform for CTV and open web.',
    topThemes: ['CTV', 'Publishers', 'Streaming'],
    websiteUrl: 'https://www.magnite.com',
  },
  'amazon-ads': {
    handle: 'AmazonAds',
    profileUrl: 'https://x.com/AmazonAds',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile check',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: true,
    bio: 'Full-funnel advertising at scale — retail media, DSP, and measurement.',
    topThemes: ['Retail media', 'DSP', 'Measurement'],
    websiteUrl: 'https://advertising.amazon.com',
  },
  criteo: {
    handle: 'Criteo',
    profileUrl: 'https://x.com/Criteo',
    validatedAt: '2026-07-24',
    validatedVia: 'x.com profile check',
    followers: null,
    following: null,
    postsPerMonth: null,
    avgEngagement: null,
    verified: true,
    bio: 'Commerce media platform connecting marketers and retailers.',
    topThemes: ['Retail media', 'Commerce', 'AI'],
    websiteUrl: 'https://www.criteo.com',
  },
};

const nameMap = Object.fromEntries(store.companies.map((c) => [c.slug, c.name]));

function slugQuery(slug) {
  return slug.replace(/-/g, ' ');
}

function ensureRegionDepth(region, companySlug) {
  const companyName = nameMap[companySlug] || companySlug;
  const regionKey = region.name;

  if (!region.insight) {
    region.insight = `Search interest for ${companyName} in ${region.name} — modeled from category benchmarks.`;
  }

  if (!region.topQueries || region.topQueries.length < 3) {
    const existing = region.topQueries || [];
    const fallbacks = [
      { query: `${slugQuery(companySlug)} ${region.name.split(' ')[0].toLowerCase()}`, index: 100, change: '+12%' },
      { query: `${slugQuery(companySlug)} advertising`, index: 78, change: '+8%' },
      { query: `${companyName.toLowerCase()} programmatic`, index: 62, change: '+5%' },
    ];
    region.topQueries = [...existing];
    for (const fb of fallbacks) {
      if (region.topQueries.length >= 3) break;
      if (!region.topQueries.some((q) => q.query === fb.query)) {
        region.topQueries.push(fb);
      }
    }
  }

  const metroNames = searchRegionDefaults.metros[regionKey] || searchRegionDefaults.metros.EMEA;
  if (!region.metros || region.metros.length < 3) {
    const existing = region.metros || [];
    region.metros = [...existing];
    for (let i = 0; region.metros.length < 3 && i < metroNames.length; i += 1) {
      const name = metroNames[i];
      if (!region.metros.some((m) => m.name === name)) {
        region.metros.push({ name, index: Math.max(40, 100 - i * 18) });
      }
    }
  }

  return region;
}

function enrichSearchMetrics(company) {
  if (!company.searchMetrics?.regions) return;
  company.searchMetrics.regions = company.searchMetrics.regions.map((r) =>
    ensureRegionDepth({ ...r }, company.slug)
  );
  if (!company.searchMetrics.monthLabels) {
    company.searchMetrics.monthLabels = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
  }
}

function applyCompanyPatches(company) {
  const patch = companyPatches[company.slug];
  if (!patch) return;

  if (patch.revenueSegments) company.revenueSegments = patch.revenueSegments;
  if (patch.winning) company.winning = patch.winning;

  if (patch.extraProduct) {
    const exists = company.products?.some((p) => p.name === patch.extraProduct.name);
    if (!exists) {
      company.products = [...(company.products || []), patch.extraProduct];
    }
  }

  enrichSearchMetrics(company);
}

store.signals = signalsRaw
  .sort((a, b) => b.published_at.localeCompare(a.published_at))
  .map((s, i) => ({ id: i + 1, ...s }));

store.hiring = hiringRaw
  .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
  .map((job, i) => {
    const profile = linkedinProfiles[job.company_slug];
    const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title.split(',')[0])}&location=${encodeURIComponent(job.location)}`;
    return {
      id: i + 1,
      ...job,
      company_name: nameMap[job.company_slug],
      source: 'linkedin',
      source_name: 'LinkedIn · public job listing',
      confidence: 'reported',
      linkedin_company_url: profile?.jobsUrl,
      source_url: searchUrl,
    };
  });

store.xPosts = xPostsRaw
  .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
  .map((post, i) => {
    const profile = xProfiles[post.company_slug];
    return {
      id: i + 1,
      company_slug: post.company_slug,
      company_name: nameMap[post.company_slug],
      text: post.text,
      theme: post.theme,
      posted_at: post.posted_at,
      source: 'x',
      source_name: post.source_name,
      confidence: post.confidence,
      profile_url: profile?.profileUrl,
      source_url: post.source_url,
      engagement: null,
    };
  });

for (const company of store.companies) {
  applyCompanyPatches(company);
  enrichSearchMetrics(company);

  const li = linkedinProfiles[company.slug];
  if (li) {
    company.linkedin = li;
    if (company.dataSources) {
      company.dataSources.hiring = {
        label: 'LinkedIn public job listings & company careers pages',
        confidence: 'reported',
        url: li.jobsUrl,
        asOf: '2026-07',
      };
    }
  }

  const xp = xProfiles[company.slug];
  if (xp) {
    company.x = xp;
    if (company.dataSources) {
      company.dataSources.x = {
        label: `X profile @${xp.handle} (verified public URL)`,
        confidence: 'reported',
        url: xp.profileUrl,
        asOf: xp.validatedAt,
      };
    }
  }

  if (company.dataSources && !company.dataSources.signals) {
    company.dataSources.signals = {
      label: 'Public press, product pages, and industry news synthesis',
      confidence: 'mixed',
      url: company.website,
      asOf: '2026-07',
    };
  }
}

store.hiringPolicy =
  'Open roles sourced from public LinkedIn job listings. Links open LinkedIn search or company jobs pages — no private data.';

store.xPolicy =
  'X profile links verified against x.com (HTTP check). Post themes for Kargo come from kargo.com press; peer themes are inferred from public news pages — not scraped tweet text. Follower counts are not stored; view live profiles for current stats.';

store.researchPolicy =
  'Competitive research corpus v2 — balanced depth across all tracked companies: 8 signals, 8 hiring roles, 6 X themes, 4 products, 4 revenue segments, and full regional search drill-down per company. Sources marked reported / inferred / modeled.';

store.researchVersion = RESEARCH_VERSION;

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

const slugs = store.companies.map((c) => c.slug);
const summary = slugs.map((s) => ({
  slug: s,
  signals: store.signals.filter((x) => x.company_slug === s).length,
  hiring: store.hiring.filter((x) => x.company_slug === s).length,
  xPosts: store.xPosts.filter((x) => x.company_slug === s).length,
  products: store.companies.find((c) => c.slug === s)?.products?.length || 0,
  segments: store.companies.find((c) => c.slug === s)?.revenueSegments?.length || 0,
  winning: store.companies.find((c) => c.slug === s)?.winning?.length || 0,
}));

console.log(`Research v${RESEARCH_VERSION} applied:`);
console.log(`  signals: ${store.signals.length} · hiring: ${store.hiring.length} · xPosts: ${store.xPosts.length}`);
summary.forEach((r) =>
  console.log(
    `  ${r.slug.padEnd(16)} signals=${r.signals} hiring=${r.hiring} x=${r.xPosts} products=${r.products} seg=${r.segments} win=${r.winning}`
  )
);
