/** Balanced competitive research corpus — 6 companies, equal depth per entity. */

export const RESEARCH_VERSION = 2;

export { linkedinProfiles } from './linkedin-hiring-links.js';

export const signalsRaw = [
  // Kargo (8)
  { company_slug: 'kargo', published_at: '2026-07-19', type: 'partnership', title: 'Kargo gains programmatic control of HP Spotlight desktop format', summary: 'Publisher partnership expands high-impact desktop inventory for brand campaigns.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-07-10', type: 'launch', title: 'Kargo CTV Canvas units for streaming apps', summary: 'New interactive CTV formats aimed at premium publisher apps and FAST channels.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-06-30', type: 'partnership', title: 'BeReal × Kargo social engagement partnership', summary: 'Authentic social ad experiences for US brand advertisers on BeReal.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-06-12', type: 'product', title: 'Attention analytics dashboard refresh', summary: 'Cross-channel viewability and attention scoring for high-impact placements.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · product', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-05-05', type: 'product', title: 'ChatGPT integration for AI-native ad opportunities', summary: 'Early mover positioning in conversational AI ad surfaces.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-04-30', type: 'launch', title: 'Project KERA automates media buying end-to-end', summary: 'Workflow automation spanning creative execution and trafficking.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', published_at: '2026-03-18', type: 'partnership', title: 'Publisher yield partnership with major news group', summary: 'High-impact mobile units rolled out across top-tier publisher portfolio.', source_url: 'https://www.kargo.com/', source_name: 'Industry press', confidence: 'inferred' },
  { company_slug: 'kargo', published_at: '2026-02-08', type: 'product', title: 'Mobile scroll-stopping format pack v2', summary: 'Updated creative templates and trafficking specs for in-app and mobile web.', source_url: 'https://www.kargo.com/', source_name: 'Kargo · product', confidence: 'inferred' },
  // Trade Desk (8)
  { company_slug: 'the-trade-desk', published_at: '2026-07-22', type: 'product', title: 'Kokai AI bidding updates for CTV inventory', summary: 'Streaming-specific optimization models and reporting in Kokai platform.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'reported' },
  { company_slug: 'the-trade-desk', published_at: '2026-07-08', type: 'product', title: 'Kokai bidding updates for CTV', summary: 'Trade Desk highlights AI optimization for streaming inventory.', source_url: 'https://www.thetradedesk.com', source_name: 'Company press / website', confidence: 'reported' },
  { company_slug: 'the-trade-desk', published_at: '2026-06-25', type: 'partnership', title: 'CTV publisher data clean room integrations', summary: 'Unified reporting for programmatic buyers across major streaming publishers.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', published_at: '2026-06-10', type: 'product', title: 'UID2 adoption milestone in EMEA', summary: 'Identity footprint expansion for cookieless addressability in Europe.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', published_at: '2026-05-20', type: 'launch', title: 'OpenPath inventory path expansion', summary: 'Direct publisher connections reduce supply-chain friction for buyers.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'reported' },
  { company_slug: 'the-trade-desk', published_at: '2026-04-14', type: 'partnership', title: 'Retail media convergence with major grocer', summary: 'Off-site activation tied to first-party shopper data via partner integration.', source_url: 'https://investors.thetradedesk.com', source_name: 'Earnings / press', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', published_at: '2026-03-05', type: 'product', title: 'Unified ID 2.0 operator console refresh', summary: 'Identity governance tools for publishers and data partners.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'reported' },
  { company_slug: 'the-trade-desk', published_at: '2026-01-28', type: 'launch', title: 'Kokai general availability for enterprise buyers', summary: 'AI-driven bidding platform positioned as successor to legacy UI workflows.', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'reported' },
  // StackAdapt (8)
  // StackAdapt (8)
  { company_slug: 'stackadapt', published_at: '2026-07-19', type: 'launch', title: 'StackAdapt expands CTV creative suite', summary: 'New templates and dynamic creative for connected TV campaigns.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · press', confidence: 'reported' },
  { company_slug: 'stackadapt', published_at: '2026-07-10', type: 'launch', title: 'StackAdapt CTV creative template library', summary: 'Self-serve dynamic creative templates for mid-market CTV campaigns.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · press', confidence: 'reported' },
  { company_slug: 'stackadapt', published_at: '2026-06-22', type: 'product', title: 'IVT Shield quality controls v3', summary: 'Invalid traffic filtering across display, native, and CTV campaigns.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  { company_slug: 'stackadapt', published_at: '2026-06-05', type: 'partnership', title: 'CTV inventory expansion with streaming aggregator', summary: 'Mid-market buyers gain access to incremental FAST and OTT supply.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · press', confidence: 'inferred' },
  { company_slug: 'stackadapt', published_at: '2026-05-15', type: 'product', title: 'Creative studio AI-assisted templates', summary: 'In-platform builder speeds creative production for performance teams.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  { company_slug: 'stackadapt', published_at: '2026-04-08', type: 'launch', title: 'DooH planning module in platform', summary: 'Digital out-of-home added to omnichannel self-serve workflow.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · press', confidence: 'inferred' },
  { company_slug: 'stackadapt', published_at: '2026-03-12', type: 'partnership', title: 'Agency certification program expansion', summary: 'Partner enablement for mid-market agencies in US and Canada.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · news', confidence: 'inferred' },
  { company_slug: 'stackadapt', published_at: '2026-02-01', type: 'product', title: 'Cross-channel reporting unification', summary: 'Single dashboard for native, display, CTV, and audio performance.', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  // Magnite (8)
  { company_slug: 'magnite', published_at: '2026-07-18', type: 'product', title: 'Streaming SSP deal activation speed improvements', summary: 'Faster programmatic deal setup for CTV publishers and buyers.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', published_at: '2026-07-05', type: 'partnership', title: 'Magnite retail media partnership', summary: 'New retail media integrations for CTV publishers.', source_url: 'https://www.magnite.com', source_name: 'Company press / website', confidence: 'reported' },
  { company_slug: 'magnite', published_at: '2026-06-26', type: 'partnership', title: 'FAST channel programmatic access expansion', summary: 'Publisher monetization tools for free ad-supported streaming TV.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', published_at: '2026-06-08', type: 'launch', title: 'SpringServe ad server CTV yield features', summary: 'Header bidding and ad pod optimization for video publishers.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'reported' },
  { company_slug: 'magnite', published_at: '2026-05-22', type: 'partnership', title: 'Major broadcaster SSP renewal', summary: 'Long-term CTV monetization partnership with top-tier US broadcaster.', source_url: 'https://investors.magnite.com', source_name: 'Investor relations', confidence: 'inferred' },
  { company_slug: 'magnite', published_at: '2026-04-17', type: 'product', title: 'ClearLine curated marketplace refresh', summary: 'Premium PMP packages for brand-safe CTV and display inventory.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', published_at: '2026-03-25', type: 'launch', title: 'Live sports CTV programmatic packages', summary: 'Event-based ad products for sports streaming inventory.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · press', confidence: 'inferred' },
  { company_slug: 'magnite', published_at: '2026-02-14', type: 'product', title: 'Publisher analytics dashboard for CTV', summary: 'Yield and demand analytics for streaming sales teams.', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · product', confidence: 'inferred' },
  // Amazon Ads (8)
  { company_slug: 'amazon-ads', published_at: '2026-07-21', type: 'product', title: 'Amazon DSP off-site measurement refresh', summary: 'Cross-channel attribution for retail media campaigns off Amazon properties.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'inferred' },
  { company_slug: 'amazon-ads', published_at: '2026-07-01', type: 'launch', title: 'Amazon DSP off-site expansion', summary: 'Broader off-Amazon inventory and measurement tools.', source_url: 'https://advertising.amazon.com', source_name: 'Company press / website', confidence: 'reported' },
  { company_slug: 'amazon-ads', published_at: '2026-06-18', type: 'product', title: 'Sponsored Products AI bidding for sellers', summary: 'Automated bid optimization for marketplace search placements.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'inferred' },
  { company_slug: 'amazon-ads', published_at: '2026-06-02', type: 'launch', title: 'Amazon Marketing Cloud audience templates', summary: 'Pre-built analytics workflows for retail and CPG advertisers.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'reported' },
  { company_slug: 'amazon-ads', published_at: '2026-05-10', type: 'partnership', title: 'Prime Video ad inventory programmatic access', summary: 'Streaming ad slots available via Amazon DSP for brand advertisers.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · press', confidence: 'inferred' },
  { company_slug: 'amazon-ads', published_at: '2026-04-22', type: 'product', title: 'Sponsored Brands video format expansion', summary: 'Video units in search results for top-of-funnel brand campaigns.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · product', confidence: 'inferred' },
  { company_slug: 'amazon-ads', published_at: '2026-03-15', type: 'partnership', title: 'Third-party clean room integration for AMC', summary: 'Advertiser data onboarding partners for privacy-safe measurement.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · news', confidence: 'inferred' },
  { company_slug: 'amazon-ads', published_at: '2026-02-05', type: 'launch', title: 'Global retail media network expansion', summary: 'International marketplace ad products unified under Amazon Ads brand.', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · press', confidence: 'inferred' },
  // Criteo (8)
  { company_slug: 'criteo', published_at: '2026-07-17', type: 'product', title: 'Commerce Max off-site campaign tooling', summary: 'Self-serve workflows for retailer audiences on publisher inventory.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · news', confidence: 'inferred' },
  { company_slug: 'criteo', published_at: '2026-06-20', type: 'product', title: 'Commerce Max retailer network growth', summary: 'Additional retailers join off-site commerce media network.', source_url: 'https://www.criteo.com', source_name: 'Company press / website', confidence: 'reported' },
  { company_slug: 'criteo', published_at: '2026-06-08', type: 'partnership', title: 'EMEA retailer audience activation deals', summary: 'Cross-border retail media partnerships in UK, FR, and DE.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · news', confidence: 'inferred' },
  { company_slug: 'criteo', published_at: '2026-05-25', type: 'launch', title: 'Criteo Retail Media Platform unified UI', summary: 'On-site and off-site retail campaigns in one interface for brands.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · press', confidence: 'reported' },
  { company_slug: 'criteo', published_at: '2026-05-02', type: 'product', title: 'Criteo DSP commerce intent segments', summary: 'Shopping signal audiences for open-web display and video.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · product', confidence: 'inferred' },
  { company_slug: 'criteo', published_at: '2026-04-10', type: 'partnership', title: 'Major grocery chain retail media launch', summary: 'First-party shopper audiences activated off-site via Commerce Max.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · press', confidence: 'inferred' },
  { company_slug: 'criteo', published_at: '2026-03-20', type: 'product', title: 'AI creative optimization for retail campaigns', summary: 'Dynamic product ads tuned by real-time commerce signals.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · product', confidence: 'inferred' },
  { company_slug: 'criteo', published_at: '2026-02-18', type: 'launch', title: 'APAC retail media network expansion', summary: 'Japan and Australia retailer onboarding for Commerce Max.', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · press', confidence: 'inferred' },
];

/** @deprecated Synthetic hiring seed — use `node server/scripts/fetch-verified-hiring.js` instead. */
export const hiringRaw = [];

export const xPostsRaw = [
  { company_slug: 'kargo', text: 'Kargo gains programmatic control of HP Spotlight desktop ad format', theme: 'partnership', posted_at: '2026-07-19', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', text: 'BeReal and Kargo team up to bring authentic social engagement to US advertisers', theme: 'partnership', posted_at: '2026-06-30', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', text: 'Kargo announces integration with ChatGPT for AI-native advertising opportunities', theme: 'product', posted_at: '2026-05-05', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', text: 'Kargo launches Project KERA to automate end-to-end media buying and creative execution', theme: 'product', posted_at: '2026-04-30', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'reported' },
  { company_slug: 'kargo', text: 'Premium CTV Canvas formats — interactive brand stories on streaming apps', theme: 'CTV', posted_at: '2026-04-12', source_url: 'https://www.kargo.com/', source_name: 'Kargo · press', confidence: 'inferred' },
  { company_slug: 'kargo', text: 'Attention analytics — measuring what high-impact placements actually deliver', theme: 'thought-leadership', posted_at: '2026-03-08', source_url: 'https://www.kargo.com/', source_name: 'Kargo · blog', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'Kokai AI bidding and CTV optimization — platform updates for streaming buyers', theme: 'product', posted_at: '2026-07-22', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'UID2 and cookieless identity — open internet addressability POV', theme: 'thought-leadership', posted_at: '2026-07-16', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'CTV publisher integrations and unified reporting for programmatic buyers', theme: 'partnership', posted_at: '2026-07-08', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'OpenPath — simplifying the supply path for publishers and buyers', theme: 'product', posted_at: '2026-06-18', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'Retail media meets the open internet — convergence trends for 2026', theme: 'thought-leadership', posted_at: '2026-05-25', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'inferred' },
  { company_slug: 'the-trade-desk', text: 'Kokai general availability — AI-driven buying for enterprise advertisers', theme: 'launch', posted_at: '2026-04-02', source_url: 'https://www.thetradedesk.com/news', source_name: 'Trade Desk · news', confidence: 'reported' },
  { company_slug: 'stackadapt', text: 'Dynamic creative and CTV campaign tooling for mid-market advertisers', theme: 'product', posted_at: '2026-07-19', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · website', confidence: 'inferred' },
  { company_slug: 'stackadapt', text: 'Self-serve platform growth and hiring across Toronto and NYC', theme: 'hiring', posted_at: '2026-06-30', source_url: 'https://www.stackadapt.com/careers', source_name: 'StackAdapt · careers', confidence: 'inferred' },
  { company_slug: 'stackadapt', text: 'IVT Shield — invalid traffic protection across every channel', theme: 'product', posted_at: '2026-06-12', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  { company_slug: 'stackadapt', text: 'Creative studio updates — build display and native ads in-platform', theme: 'product', posted_at: '2026-05-20', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  { company_slug: 'stackadapt', text: 'Mid-market agencies — why self-serve DSP adoption is accelerating', theme: 'thought-leadership', posted_at: '2026-04-15', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · blog', confidence: 'inferred' },
  { company_slug: 'stackadapt', text: 'CTV hub — plan, launch, and report streaming campaigns in one workflow', theme: 'CTV', posted_at: '2026-03-22', source_url: 'https://www.stackadapt.com', source_name: 'StackAdapt · product', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'Streaming SSP updates — faster programmatic deal activation for CTV', theme: 'product', posted_at: '2026-07-18', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'Publisher monetization and FAST channel programmatic access', theme: 'partnership', posted_at: '2026-06-26', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'SpringServe yield optimization for CTV ad pods', theme: 'product', posted_at: '2026-06-05', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'Sell-side CTV scale — why independent SSPs matter for streaming', theme: 'thought-leadership', posted_at: '2026-05-12', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · blog', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'ClearLine curated deals — premium inventory for brand campaigns', theme: 'product', posted_at: '2026-04-18', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · news', confidence: 'inferred' },
  { company_slug: 'magnite', text: 'Live sports streaming — programmatic opportunities for publishers', theme: 'CTV', posted_at: '2026-03-10', source_url: 'https://www.magnite.com/news/', source_name: 'Magnite · press', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Amazon DSP off-Amazon measurement for retail media campaigns', theme: 'product', posted_at: '2026-07-20', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Sponsored Products and retail media learnings from peak shopping events', theme: 'thought-leadership', posted_at: '2026-07-12', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Amazon Marketing Cloud — clean-room analytics for CPG brands', theme: 'product', posted_at: '2026-06-20', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · site', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Prime Video ads — streaming reach via Amazon DSP', theme: 'CTV', posted_at: '2026-05-28', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · press', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Full-funnel retail media — from search to off-site display', theme: 'thought-leadership', posted_at: '2026-04-22', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · blog', confidence: 'inferred' },
  { company_slug: 'amazon-ads', text: 'Sponsored Brands video — brand storytelling in Amazon search', theme: 'product', posted_at: '2026-03-15', source_url: 'https://advertising.amazon.com', source_name: 'Amazon Ads · product', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'Commerce Max updates for off-site retail media campaigns', theme: 'product', posted_at: '2026-07-17', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · news', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'Retailer audience activation across EMEA partnerships', theme: 'partnership', posted_at: '2026-06-27', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · news', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'Retail media platform — unifying on-site and off-site for brands', theme: 'product', posted_at: '2026-06-08', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · press', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'Commerce intent audiences — open-web targeting with shopping signals', theme: 'product', posted_at: '2026-05-15', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · product', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'Retail media beyond Amazon — why independent networks matter', theme: 'thought-leadership', posted_at: '2026-04-20', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · blog', confidence: 'inferred' },
  { company_slug: 'criteo', text: 'APAC retail expansion — Commerce Max in Japan and Australia', theme: 'partnership', posted_at: '2026-03-12', source_url: 'https://www.criteo.com/news/', source_name: 'Criteo · press', confidence: 'inferred' },
];

export const companyPatches = {
  magnite: {
    revenueSegments: [
      { name: 'CTV streaming (Magnite Streaming)', value: 254, pct: 38 },
      { name: 'Display & mobile SSP', value: 147, pct: 22 },
      { name: 'SpringServe ad serving', value: 94, pct: 14 },
      { name: 'DV+ premium video', value: 80, pct: 12 },
      { name: 'Live events & sports CTV', value: 40, pct: 6 },
      { name: 'Data & identity', value: 33, pct: 5 },
      { name: 'Other supply tools', value: 20, pct: 3 },
    ],
    winning: [
      { text: 'Largest independent sell-side CTV scale', strength: 5 },
      { text: 'Publisher-first positioning', strength: 4 },
      { text: 'SpringServe + Streaming combined stack', strength: 4 },
    ],
    extraProduct: {
      name: 'Live Events CTV',
      category: 'CTV',
      channels: ['CTV', 'Sports'],
      description: 'Programmatic ad products for live sports and event-based streaming inventory.',
      maturity: 'GA',
    },
  },
  criteo: {
    revenueSegments: [
      { name: 'Off-site retail media', value: 608, pct: 32 },
      { name: 'Performance display', value: 532, pct: 28 },
      { name: 'On-site retail media', value: 266, pct: 14 },
      { name: 'Data & commerce audiences', value: 304, pct: 16 },
      { name: 'CTV & video extension', value: 114, pct: 6 },
      { name: 'Managed partnerships', value: 76, pct: 4 },
    ],
    winning: [
      { text: 'Commerce retargeting heritage', strength: 4 },
      { text: 'Retail media network expansion', strength: 4 },
      { text: 'Independent alternative to walled gardens', strength: 5 },
    ],
    extraProduct: {
      name: 'Criteo Retail Media Platform',
      category: 'Retail media',
      channels: ['On-site', 'Off-site'],
      description: 'Unified retail media buying for brands across retailer on-site and Commerce Max off-site.',
      maturity: 'GA',
    },
  },
  kargo: {
    extraProduct: {
      name: 'Publisher solutions',
      category: 'Supply',
      channels: ['Mobile web', 'In-app', 'CTV'],
      description: 'Yield optimization and high-impact ad products for premium publisher partners.',
      maturity: 'GA',
    },
  },
  'the-trade-desk': {
    extraProduct: {
      name: 'OpenPath',
      category: 'Supply path',
      channels: ['Display', 'Video', 'CTV'],
      description: 'Direct publisher connections that simplify supply path and improve transparency for buyers.',
      maturity: 'GA',
    },
  },
  stackadapt: {
    extraProduct: {
      name: 'DooH hub',
      category: 'Channels',
      channels: ['Digital out-of-home'],
      description: 'Out-of-home planning and buying integrated into the self-serve omnichannel platform.',
      maturity: 'Beta',
    },
  },
  'amazon-ads': {
    extraProduct: {
      name: 'Sponsored Brands',
      category: 'Retail media',
      channels: ['On-Amazon search'],
      description: 'Brand-focused placements in Amazon search results with logo, headline, and product carousel.',
      maturity: 'GA',
    },
  },
};

export const searchRegionDefaults = {
  metros: {
    'United States': ['New York', 'Los Angeles', 'Chicago'],
    'United Kingdom': ['London', 'Manchester', 'Birmingham'],
    Germany: ['Berlin', 'Munich', 'Hamburg'],
    Canada: ['Toronto', 'Vancouver', 'Montreal'],
    EMEA: ['London', 'Paris', 'Berlin'],
    Europe: ['Paris', 'Berlin', 'Amsterdam'],
    France: ['Paris', 'Lyon', 'Marseille'],
    Japan: ['Tokyo', 'Osaka', 'Nagoya'],
    India: ['Bangalore', 'Mumbai', 'Delhi'],
    APAC: ['Singapore', 'Sydney', 'Tokyo'],
  },
};
