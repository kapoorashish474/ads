import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const summaries = {
  kargo: {
    headline: 'Close the CTV format gap while doubling down on creative impact — the core differentiator peers cannot copy.',
    focus: ['CTV product velocity', 'UK regional marketing', 'Commerce measurement partnerships'],
  },
  'the-trade-desk': {
    headline: 'Defend identity leadership and extend Kokai narrative into retail media convergence stories.',
    focus: ['UID2 ecosystem', 'CTV enterprise wins', 'Open internet positioning'],
  },
  stackadapt: {
    headline: 'Win mid-market CTV budgets with self-serve creative — direct threat to format-led vendors.',
    focus: ['CTV hub adoption', 'Creative studio differentiation', 'Quality & IVT story'],
  },
  magnite: {
    headline: 'Own the publisher monetization narrative — partner with format vendors rather than compete on creative.',
    focus: ['Streaming SSP deals', 'FAST channel growth', 'Publisher case studies'],
  },
  'amazon-ads': {
    headline: 'Extend retail media off-Amazon while educating brands on AMC measurement depth.',
    focus: ['DSP off-site scale', 'AMC adoption', 'Prime tentpole learnings'],
  },
  criteo: {
    headline: 'Counter Amazon with Commerce Max bundling and retailer-first audience activation.',
    focus: ['Off-site retail media', 'Retailer partnerships', 'Commerce vs search narrative'],
  },
};

const catalog = {
  kargo: [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'Accelerate CTV high-impact suite',
      thesis: 'StackAdapt and Magnite are winning CTV RFPs with named products; Kargo Canvas CTV needs faster template velocity.',
      fast_path: 'Ship two net-new CTV templates plus trafficking API docs this quarter.',
      evidence: [{ label: 'StackAdapt CTV hub', url: 'https://www.stackadapt.com' }, { label: 'Peer product gaps', url: 'https://www.kargo.com' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'high',
      title: 'Retail media measurement hooks',
      thesis: 'Amazon AMC and Criteo Commerce Max set buyer expectations for commerce-attributed formats.',
      fast_path: 'Pilot off-site attribution with one retail media partner.',
      evidence: [{ label: 'Amazon Marketing Cloud', url: 'https://advertising.amazon.com' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'Self-serve format builder beta',
      thesis: 'Creative impact radar lead is under-monetized without self-serve access for agencies.',
      fast_path: 'Launch closed beta for top 10 agency partners.',
      evidence: [{ label: 'Kargo product pages', url: 'https://www.kargo.com' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'high',
      title: 'Raise CTV share of voice',
      thesis: 'Signal volume and search interest lag StackAdapt despite comparable CTV investment.',
      fast_path: 'Publish POV series plus two streaming case studies in Q3.',
      evidence: [{ label: 'Search trend index', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'medium',
      title: 'Invest in UK search demand',
      thesis: 'UK regional interest is up double digits; localized proof points are scarce on site.',
      fast_path: 'UK publisher case study and Cannes follow-up tour.',
      evidence: [{ label: 'Regional search deep dive', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'medium',
      title: 'Align messaging to omnichannel',
      thesis: 'Homepage still reads mobile-first while buyers query CTV and mobile together.',
      fast_path: 'Refresh hero, sitemap, and SEO for omnichannel keywords.',
      evidence: [{ label: 'kargo.com positioning', url: 'https://www.kargo.com' }],
    },
  ],
  'the-trade-desk': [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'Expand Kokai CTV bidding surfaces',
      thesis: 'CTV scale radar is a strength — product marketing outpaces documented Kokai streaming features.',
      fast_path: 'Release Kokai CTV changelog and buyer enablement kit.',
      evidence: [{ label: 'Trade Desk news', url: 'https://www.thetradedesk.com/news' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'UID2 adoption dashboards for agencies',
      thesis: 'Identity is the moat; buyers need clearer UID2 coverage reporting in UI.',
      fast_path: 'Ship identity coverage widget in Kokai reporting.',
      evidence: [{ label: 'UID2 ecosystem', url: 'https://www.thetradedesk.com' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'medium',
      title: 'Retail media API parity',
      thesis: 'Amazon and Criteo bundle commerce data — TTD needs clearer off-site retail integrations.',
      fast_path: 'Document retail data partnerships in developer portal.',
      evidence: [{ label: 'Amazon DSP', url: 'https://advertising.amazon.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'high',
      title: 'Own the open internet narrative',
      thesis: 'Independent DSP positioning resonates in UK and AU search regions.',
      fast_path: 'Quarterly open internet index report for trade press.',
      evidence: [{ label: 'Investor narrative', url: 'https://investors.thetradedesk.com' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'medium',
      title: 'CTV enterprise proof points',
      thesis: 'Enterprise buyers compare TTD to Amazon on streaming — need named publisher wins.',
      fast_path: 'Two co-branded CTV case studies with major broadcasters.',
      evidence: [{ label: 'CTV signals feed', url: 'https://www.thetradedesk.com/news' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'low',
      title: 'Simplify Kokai messaging hierarchy',
      thesis: 'Kokai, UID2, and Unified ID create cognitive load for mid-market prospects.',
      fast_path: 'Single-page buyer journey map on website.',
      evidence: [{ label: 'Product pages', url: 'https://www.thetradedesk.com' }],
    },
  ],
  stackadapt: [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'Dynamic CTV creative at scale',
      thesis: 'CTV hub is the flagship — dynamic creative is the feature gap vs enterprise DSPs.',
      fast_path: 'GA dynamic CTV templates with creative studio integration.',
      evidence: [{ label: 'StackAdapt platform', url: 'https://www.stackadapt.com' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'IVT Shield cross-channel reporting',
      thesis: 'Quality SKU is unique in peer set — extend reporting across CTV and display.',
      fast_path: 'Unified quality dashboard in campaign UI.',
      evidence: [{ label: 'IVT Shield product', url: 'https://www.stackadapt.com' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'medium',
      title: 'Identity workflow integrations',
      thesis: 'Trade Desk UID2 story wins enterprise RFPs; StackAdapt needs partner identity paths.',
      fast_path: 'Ship UID2/LiveRamp connector roadmap publicly.',
      evidence: [{ label: 'Trade Desk identity', url: 'https://www.thetradedesk.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'high',
      title: 'Mid-market CTV case study blitz',
      thesis: 'Self-serve UX radar lead should translate to more public CTV wins.',
      fast_path: 'Four vertical case studies (auto, retail, finance, CPG) in 90 days.',
      evidence: [{ label: 'Customer stories', url: 'https://www.stackadapt.com' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'medium',
      title: 'Canada growth narrative',
      thesis: 'Toronto HQ is under-leveraged in US trade press versus US-born peers.',
      fast_path: 'Canada programmatic leadership report + event tour.',
      evidence: [{ label: 'Regional search', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'low',
      title: 'Clarify AI platform claims',
      thesis: 'AI messaging is broad — buyers want specific campaign outcomes tied to ML features.',
      fast_path: 'Rewrite homepage with three measurable AI use cases.',
      evidence: [{ label: 'stackadapt.com', url: 'https://www.stackadapt.com' }],
    },
  ],
  magnite: [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'FAST channel programmatic packages',
      thesis: 'Streaming SSP strength depends on FAST inventory packaging for buyers.',
      fast_path: 'Launch curated FAST PMP bundles in ClearLine.',
      evidence: [{ label: 'Magnite Streaming', url: 'https://www.magnite.com' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'SpringServe + SSP unified yield',
      thesis: 'Ad server plus SSP is the pitch — product integration depth wins renewals.',
      fast_path: 'Single yield dashboard across SpringServe and Magnite Streaming.',
      evidence: [{ label: 'SpringServe', url: 'https://www.magnite.com' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'medium',
      title: 'Buyer-facing creative impact tools',
      thesis: 'Creative impact radar is weak — publishers ask for format partners like Kargo.',
      fast_path: 'Partner marketplace for high-impact format vendors.',
      evidence: [{ label: 'Kargo format peer', url: 'https://www.kargo.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'high',
      title: 'Publisher monetization thought leadership',
      thesis: 'CTV scale radar is a strength — own the sell-side streaming revenue narrative.',
      fast_path: 'Quarterly streaming revenue pulse with named publisher partners.',
      evidence: [{ label: 'Magnite news', url: 'https://www.magnite.com/news/' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'medium',
      title: 'EMEA streaming proof points',
      thesis: 'EMEA search share is growing — localize case studies beyond US publishers.',
      fast_path: 'London and Paris publisher events with live demos.',
      evidence: [{ label: 'Regional search', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'low',
      title: 'Clarify DV+ vs Streaming positioning',
      thesis: 'Product naming (DV+, Streaming, ClearLine) confuses new buyer personas.',
      fast_path: 'Buyer-facing product map on magnite.com.',
      evidence: [{ label: 'Product pages', url: 'https://www.magnite.com' }],
    },
  ],
  'amazon-ads': [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'AMC clean-room template library',
      thesis: 'Data & identity radar is maxed — AMC is the product buyers ask about in enterprise deals.',
      fast_path: 'Ship five industry AMC query templates with docs.',
      evidence: [{ label: 'Amazon Marketing Cloud', url: 'https://advertising.amazon.com' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'Off-Amazon DSP measurement expansion',
      thesis: 'Retail media off-site is the growth segment — measurement is the blocker.',
      fast_path: 'Unified off-Amazon reporting in campaign manager.',
      evidence: [{ label: 'Amazon DSP', url: 'https://advertising.amazon.com' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'medium',
      title: 'High-impact format partnerships',
      thesis: 'Format vendors like Kargo win brand budgets Amazon does not productize.',
      fast_path: 'Pilot premium display format program for top advertisers.',
      evidence: [{ label: 'Format peer landscape', url: 'https://www.kargo.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'high',
      title: 'Prime tentpole playbooks',
      thesis: 'Prime Day and Q4 tentpoles drive search spikes — publish repeatable playbooks.',
      fast_path: 'Post-Prime Day benchmark report for advertisers.',
      evidence: [{ label: 'Search interest index', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'medium',
      title: 'India market education push',
      thesis: 'India is fastest-growing search region — localized education is thin.',
      fast_path: 'Hindi and English advertiser academy tracks for India.',
      evidence: [{ label: 'Regional search', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'low',
      title: 'Simplify Sponsored Products vs DSP story',
      thesis: 'On-Amazon vs off-Amazon split confuses mid-market brands entering retail media.',
      fast_path: 'Single funnel diagram on advertising.amazon.com.',
      evidence: [{ label: 'Amazon Ads site', url: 'https://advertising.amazon.com' }],
    },
  ],
  criteo: [
    {
      lane: 'engineering',
      type: 'build',
      priority: 'critical',
      title: 'Commerce Max off-site automation',
      thesis: 'Retail media off-site segment is 40% of revenue — automation wins retailer RFPs.',
      fast_path: 'Self-serve Commerce Max campaign wizard for retailers.',
      evidence: [{ label: 'Criteo Commerce Max', url: 'https://www.criteo.com' }],
    },
    {
      lane: 'engineering',
      type: 'differentiate',
      priority: 'high',
      title: 'Retailer audience API depth',
      thesis: 'Audience activation SKU must match Amazon AMC narrative for non-Amazon retailers.',
      fast_path: 'Publish audience API v2 with segment transparency docs.',
      evidence: [{ label: 'Criteo product news', url: 'https://www.criteo.com/news/' }],
    },
    {
      lane: 'engineering',
      type: 'catch_up',
      priority: 'medium',
      title: 'CTV commerce extensions',
      thesis: 'CTV radar lags peers — shoppable CTV pilots are table stakes for 2026 briefs.',
      fast_path: 'Beta shoppable CTV with two retail partners.',
      evidence: [{ label: 'Magnite CTV peer', url: 'https://www.magnite.com' }],
    },
    {
      lane: 'marketing',
      type: 'double',
      priority: 'high',
      title: 'Anti-Amazon commerce media narrative',
      thesis: 'Retailers need a story for off-site budgets outside Amazon walled garden.',
      fast_path: 'Commerce media independence report targeting retail CEOs.',
      evidence: [{ label: 'Investor materials', url: 'https://investors.criteo.com' }],
    },
    {
      lane: 'marketing',
      type: 'improve',
      priority: 'medium',
      title: 'France home market dominance',
      thesis: 'France is largest search region — double down on Paris retail partnerships.',
      fast_path: 'France retail media summit co-hosted with top grocer.',
      evidence: [{ label: 'Regional search', url: 'https://trends.google.com' }],
    },
    {
      lane: 'marketing',
      type: 'fix',
      priority: 'low',
      title: 'Unify retargeting heritage with Commerce Max',
      thesis: 'Legacy retargeting brand still surfaces in search — confuses Commerce Max positioning.',
      fast_path: 'Brand migration FAQ and SEO redirect plan.',
      evidence: [{ label: 'criteo.com', url: 'https://www.criteo.com' }],
    },
  ],
};

const items = [];
let id = 1;
for (const company of store.companies) {
  const list = catalog[company.slug] || [];
  company.suggestionSummary = summaries[company.slug] || {
    headline: 'Peer-informed priorities across marketing and engineering.',
    focus: [],
  };
  for (const item of list) {
    items.push({
      id: id++,
      status: 'open',
      subject_slug: company.slug,
      ...item,
    });
  }
}

store.suggestions = items;
store.suggestionsVersion = 2;
store.suggestionsPolicy =
  'Suggestions synthesized from peer compare, product gaps, search trends, and public signals. Priorities are directional — validate against your pipeline before resourcing.';

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log(`Seeded ${items.length} suggestions for ${store.companies.length} companies`);
