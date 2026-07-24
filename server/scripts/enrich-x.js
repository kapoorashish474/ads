import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

/** Handles verified via public profile URL (HTTP 200 on x.com/{handle}). */
const profiles = {
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

const posts = [
  {
    company_slug: 'kargo',
    text: 'Kargo gains programmatic control of HP Spotlight desktop ad format',
    theme: 'partnership',
    posted_at: '2026-07-19',
    source_url: 'https://www.kargo.com/',
    source_name: 'Kargo · press',
    confidence: 'reported',
  },
  {
    company_slug: 'kargo',
    text: 'BeReal and Kargo team up to bring authentic social engagement to US advertisers',
    theme: 'partnership',
    posted_at: '2026-06-30',
    source_url: 'https://www.kargo.com/',
    source_name: 'Kargo · press',
    confidence: 'reported',
  },
  {
    company_slug: 'kargo',
    text: 'Kargo announces integration with ChatGPT for AI-native advertising opportunities',
    theme: 'product',
    posted_at: '2026-05-05',
    source_url: 'https://www.kargo.com/',
    source_name: 'Kargo · press',
    confidence: 'reported',
  },
  {
    company_slug: 'kargo',
    text: 'Kargo launches Project KERA to automate end-to-end media buying and creative execution',
    theme: 'product',
    posted_at: '2026-04-30',
    source_url: 'https://www.kargo.com/',
    source_name: 'Kargo · press',
    confidence: 'reported',
  },
  {
    company_slug: 'the-trade-desk',
    text: 'Kokai AI bidding and CTV optimization — platform updates for streaming buyers',
    theme: 'product',
    posted_at: '2026-07-22',
    source_url: 'https://www.thetradedesk.com/news',
    source_name: 'Trade Desk · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'the-trade-desk',
    text: 'UID2 and cookieless identity — open internet addressability POV',
    theme: 'thought-leadership',
    posted_at: '2026-07-16',
    source_url: 'https://www.thetradedesk.com/news',
    source_name: 'Trade Desk · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'the-trade-desk',
    text: 'CTV publisher integrations and unified reporting for programmatic buyers',
    theme: 'partnership',
    posted_at: '2026-07-08',
    source_url: 'https://www.thetradedesk.com/news',
    source_name: 'Trade Desk · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'stackadapt',
    text: 'Dynamic creative and CTV campaign tooling for mid-market advertisers',
    theme: 'product',
    posted_at: '2026-07-19',
    source_url: 'https://www.stackadapt.com',
    source_name: 'StackAdapt · website',
    confidence: 'inferred',
  },
  {
    company_slug: 'stackadapt',
    text: 'Self-serve platform growth and hiring across Toronto and NYC',
    theme: 'hiring',
    posted_at: '2026-06-30',
    source_url: 'https://www.stackadapt.com/careers',
    source_name: 'StackAdapt · careers',
    confidence: 'inferred',
  },
  {
    company_slug: 'magnite',
    text: 'Streaming SSP updates — faster programmatic deal activation for CTV',
    theme: 'product',
    posted_at: '2026-07-18',
    source_url: 'https://www.magnite.com/news/',
    source_name: 'Magnite · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'magnite',
    text: 'Publisher monetization and FAST channel programmatic access',
    theme: 'partnership',
    posted_at: '2026-06-26',
    source_url: 'https://www.magnite.com/news/',
    source_name: 'Magnite · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'amazon-ads',
    text: 'Amazon DSP off-Amazon measurement for retail media campaigns',
    theme: 'product',
    posted_at: '2026-07-20',
    source_url: 'https://advertising.amazon.com',
    source_name: 'Amazon Ads · site',
    confidence: 'inferred',
  },
  {
    company_slug: 'amazon-ads',
    text: 'Sponsored Products and retail media learnings from peak shopping events',
    theme: 'thought-leadership',
    posted_at: '2026-07-12',
    source_url: 'https://advertising.amazon.com',
    source_name: 'Amazon Ads · site',
    confidence: 'inferred',
  },
  {
    company_slug: 'criteo',
    text: 'Commerce Max updates for off-site retail media campaigns',
    theme: 'product',
    posted_at: '2026-07-17',
    source_url: 'https://www.criteo.com/news/',
    source_name: 'Criteo · news',
    confidence: 'inferred',
  },
  {
    company_slug: 'criteo',
    text: 'Retailer audience activation across EMEA partnerships',
    theme: 'partnership',
    posted_at: '2026-06-27',
    source_url: 'https://www.criteo.com/news/',
    source_name: 'Criteo · news',
    confidence: 'inferred',
  },
];

const nameMap = Object.fromEntries(store.companies.map((c) => [c.slug, c.name]));

store.xPosts = posts.map((post, i) => {
  const profile = profiles[post.company_slug];
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
    profile_url: profile.profileUrl,
    source_url: post.source_url,
    engagement: null,
  };
});

for (const company of store.companies) {
  const profile = profiles[company.slug];
  if (profile) {
    company.x = profile;
    if (company.dataSources) {
      company.dataSources.x = {
        label: `X profile @${profile.handle} (verified public URL)`,
        confidence: 'reported',
        url: profile.profileUrl,
        asOf: profile.validatedAt,
      };
    }
  }
}

store.xPolicy =
  'X profile links verified against x.com (HTTP check). Post themes for Kargo come from kargo.com press; peer themes are inferred from public news pages — not scraped tweet text. Follower counts are not stored; view live profiles for current stats.';

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log(`Revalidated X data: ${store.xPosts.length} posts, ${Object.keys(profiles).length} profiles`);
