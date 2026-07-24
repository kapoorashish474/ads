import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const descriptions = {
  kargo: {
    'High-impact mobile': {
      description: 'Premium scroll-stopping mobile web and in-app units beyond standard IAB banners.',
      maturity: 'GA',
    },
    'Canvas CTV': {
      description: 'Interactive and brand-story CTV formats for premium streaming inventory.',
      maturity: 'GA',
    },
    'Attention analytics': {
      description: 'Cross-channel attention and viewability measurement for high-impact placements.',
      maturity: 'GA',
    },
  },
  'the-trade-desk': {
    Kokai: {
      description: 'AI-powered bidding and optimization across programmatic channels including CTV.',
      maturity: 'GA',
    },
    UID2: {
      description: 'Unified ID 2.0 identity framework for cookieless addressability on the open web.',
      maturity: 'GA',
    },
    'Unified ID': {
      description: 'Identity graph and activation for CTV and display buying in the Trade Desk UI.',
      maturity: 'GA',
    },
  },
  stackadapt: {
    'IVT Shield': {
      description: 'Invalid traffic filtering and quality controls across campaigns.',
      maturity: 'GA',
    },
    'Creative studio': {
      description: 'In-platform creative builder for display and native ad units.',
      maturity: 'GA',
    },
    'CTV hub': {
      description: 'Connected TV planning, trafficking, and reporting in one workflow.',
      maturity: 'GA',
    },
  },
  magnite: {
    'Magnite Streaming': {
      description: 'SSP for CTV and OTT — programmatic monetization for streaming publishers.',
      maturity: 'GA',
    },
    SpringServe: {
      description: 'Ad serving and yield management for CTV and video publishers.',
      maturity: 'GA',
    },
    ClearLine: {
      description: 'Curated marketplace and PMP deals for premium inventory access.',
      maturity: 'GA',
    },
  },
  'amazon-ads': {
    'Amazon DSP': {
      description: 'Demand-side platform for off-Amazon display, video, and CTV reach.',
      maturity: 'GA',
    },
    'Sponsored Products': {
      description: 'On-Amazon retail media placements in search and product detail pages.',
      maturity: 'GA',
    },
    'Amazon Marketing Cloud': {
      description: 'Clean-room analytics and audience insights tied to Amazon shopping signals.',
      maturity: 'GA',
    },
  },
  criteo: {
    'Commerce Max': {
      description: 'Retail media campaigns extended to off-site publisher inventory.',
      maturity: 'GA',
    },
    'Criteo DSP': {
      description: 'Open-web display and video buying with commerce intent signals.',
      maturity: 'GA',
    },
    'Audience activation': {
      description: 'First-party retailer audiences activated across channels and partners.',
      maturity: 'GA',
    },
  },
};

const insights = {
  kargo: {
    headline: 'Format specialist — strong creative story, lighter on identity and self-serve scale.',
    takeaways: [
      {
        type: 'strength',
        title: 'Differentiated formats',
        body: 'Two format products (mobile + CTV) vs most peers who lead with platforms or SSP pipes.',
      },
      {
        type: 'gap',
        title: 'No identity stack',
        body: 'Trade Desk ships UID2 and Unified ID — buyers expect identity bundled with scale platforms.',
      },
      {
        type: 'gap',
        title: 'Measurement only',
        body: 'Attention analytics covers measurement but peers also sell creative tooling (StackAdapt studio) or data clouds (Amazon AMC).',
      },
      {
        type: 'implication',
        title: 'Where to invest',
        body: 'Close CTV format parity with StackAdapt/Magnite narratives before expanding into identity or retail media adjacency.',
      },
    ],
  },
  'the-trade-desk': {
    headline: 'Full-stack programmatic — identity + AI bidding are the moat, not creative formats.',
    takeaways: [
      {
        type: 'strength',
        title: 'Identity leadership',
        body: 'Two identity products (UID2, Unified ID) — no peer in this set matches depth on cookieless.',
      },
      {
        type: 'strength',
        title: 'AI bidding narrative',
        body: 'Kokai is the flagship differentiator vs DSPs that compete on retail or format inventory.',
      },
      {
        type: 'gap',
        title: 'No format/creative SKUs',
        body: 'Kargo and StackAdapt win RFPs with named format products; TTD sells pipes not units.',
      },
      {
        type: 'implication',
        title: 'Competitive read',
        body: 'When buyers ask for high-impact units, TTD partners — it does not productize formats like Kargo.',
      },
    ],
  },
  stackadapt: {
    headline: 'Mid-market platform — quality, creative, and CTV in one self-serve box.',
    takeaways: [
      {
        type: 'strength',
        title: 'Creative + CTV combo',
        body: 'Creative studio plus CTV hub mirrors how mid-market buyers purchase — one login, multiple channels.',
      },
      {
        type: 'strength',
        title: 'Quality story',
        body: 'IVT Shield is a distinct SKU; Kargo lacks a named quality product in this registry.',
      },
      {
        type: 'gap',
        title: 'No identity product',
        body: 'Relies on third-party IDs while Trade Desk owns the identity narrative.',
      },
      {
        type: 'implication',
        title: 'Threat to Kargo',
        body: 'StackAdapt CTV hub directly competes for the same mid-market CTV budgets Kargo targets.',
      },
    ],
  },
  magnite: {
    headline: 'Sell-side CTV powerhouse — publisher pipes, not buyer-facing formats.',
    takeaways: [
      {
        type: 'strength',
        title: 'CTV stack depth',
        body: 'Streaming SSP + SpringServe ad server covers publisher monetization end-to-end.',
      },
      {
        type: 'strength',
        title: 'Premium access',
        body: 'ClearLine PMP product signals curated inventory — different buyer than Kargo formats.',
      },
      {
        type: 'gap',
        title: 'Weak creative narrative',
        body: 'Low creative-impact radar score; does not sell high-impact units to brands directly.',
      },
      {
        type: 'implication',
        title: 'Partner not competitor',
        body: 'Magnite supplies CTV pipes Kargo may integrate; overlap is narrative (CTV share) not SKU-for-SKU.',
      },
    ],
  },
  'amazon-ads': {
    headline: 'Retail media at scale — shopping data is the product, formats are secondary.',
    takeaways: [
      {
        type: 'strength',
        title: 'Commerce data cloud',
        body: 'Amazon Marketing Cloud is a data SKU none of the format-led peers can replicate.',
      },
      {
        type: 'strength',
        title: 'Full funnel',
        body: 'On-Amazon Sponsored Products plus off-Amazon DSP — only Criteo approaches this breadth.',
      },
      {
        type: 'gap',
        title: 'No publisher format story',
        body: 'Does not compete for high-impact mobile units — different RFP lane than Kargo.',
      },
      {
        type: 'implication',
        title: 'Budget risk',
        body: 'Retail media budgets pull performance dollars that might otherwise fund CTV format tests.',
      },
    ],
  },
  criteo: {
    headline: 'Commerce media challenger — retail off-site competes for performance budgets.',
    takeaways: [
      {
        type: 'strength',
        title: 'Commerce Max',
        body: 'Named retail off-site product — direct counter to Amazon DSP for non-Amazon retailers.',
      },
      {
        type: 'strength',
        title: 'Audience activation',
        body: 'Data SKU ties retailer first-party segments to open-web buying.',
      },
      {
        type: 'gap',
        title: 'Limited CTV footprint',
        body: 'Low CTV radar vs Magnite/Trade Desk; Criteo is not a format-led CTV vendor.',
      },
      {
        type: 'implication',
        title: 'Watch for bundling',
        body: 'If Criteo bundles Commerce Max with display, mid-market buyers may deprioritize standalone format vendors.',
      },
    ],
  },
};

for (const company of store.companies) {
  const desc = descriptions[company.slug] || {};
  company.products = (company.products || []).map((p) => ({
    ...p,
    ...(desc[p.name] || {
      description: `${p.name} — ${p.category} offering across ${(p.channels || []).join(', ') || 'multiple channels'}.`,
      maturity: 'GA',
    }),
  }));

  if (insights[company.slug]) {
    company.productInsights = insights[company.slug];
  }
}

store.productsPolicy =
  'Product lines sourced from public product pages, press releases, and platform documentation. Counts reflect named SKUs tracked — not every feature or beta.';

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log(`Enriched products for ${store.companies.length} companies`);
