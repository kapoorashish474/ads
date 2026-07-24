/** CEO-facing briefs, threats, and leadership moves — one set per tracked company. */

export const EXECUTIVE_VERSION = 1;

export const executivePolicy =
  'Executive views synthesize public research in this corpus — signals, hiring, search trends, product gaps, and curated leadership moves. Momentum scores are computed from live store data.';

export const briefsBySlug = {
  kargo: {
    headline: 'Premium formats leader under CTV and retail-media budget pressure.',
    decision:
      'Prioritize CTV format parity and a measurable identity/partnership story before mid-market buyers consolidate on StackAdapt or Trade Desk bundles.',
  },
  'the-trade-desk': {
    headline: 'Identity + AI platform moat — defend against retail media budget shift.',
    decision:
      'Double down on Kokai and UID2 narrative in agency RFPs; partner for high-impact formats rather than building creative SKUs.',
  },
  stackadapt: {
    headline: 'Mid-market platform gaining share — CTV + creative bundle is the wedge.',
    decision:
      'Accelerate CTV hub GTM in regions where Kargo shows search spikes; maintain IVT Shield as the quality differentiator.',
  },
  magnite: {
    headline: 'Sell-side CTV scale leader — partner opportunity more than direct overlap.',
    decision:
      'Pursue publisher pipe partnerships for CTV inventory access; avoid competing on brand-facing format RFPs.',
  },
  'amazon-ads': {
    headline: 'Retail media gravity well — pulls performance budgets from open-web formats.',
    decision:
      'Track AMC and off-Amazon DSP bundling as a budget-risk signal; position where shopping data cannot compete.',
  },
  criteo: {
    headline: 'Commerce media challenger bundling off-site retail — watch mid-market consolidation.',
    decision:
      'Monitor Commerce Max agency wins; differentiate on premium publisher relationships Kargo already holds.',
  },
};

export const threatsBySlug = {
  kargo: [
    {
      severity: 'critical',
      horizon: 'near',
      category: 'Competitive',
      title: 'StackAdapt CTV hub encroachment',
      summary: 'Mid-market buyers can buy CTV + creative + quality in one self-serve login — same RFP lane as Kargo formats.',
    },
    {
      severity: 'high',
      horizon: 'near',
      category: 'Budget',
      title: 'Retail media budget pull',
      summary: 'Amazon Ads and Criteo Commerce Max redirect performance dollars away from standalone format vendors.',
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Platform',
      title: 'Identity expectations rising',
      summary: 'Trade Desk UID2 sets buyer expectation that scale platforms ship identity — Kargo has no named identity SKU.',
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Regulatory',
      title: 'Privacy and measurement tightening',
      summary: 'Cookie deprecation and state privacy laws increase demand for verified attention metrics — peers investing in data clouds.',
    },
  ],
  'the-trade-desk': [
    {
      severity: 'high',
      horizon: 'near',
      category: 'Budget',
      title: 'Retail media share of wallet',
      summary: 'Amazon and Criteo capture commerce-intent budgets that historically funded open-web programmatic.',
    },
    {
      severity: 'medium',
      horizon: 'near',
      category: 'Competitive',
      title: 'Mid-market self-serve platforms',
      summary: 'StackAdapt wins SMB/mid-market with bundled CTV + creative where TTD requires specialist ops.',
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Regulatory',
      title: 'Identity regulation uncertainty',
      summary: 'UID2 adoption depends on publisher opt-in trends and regulatory scrutiny of alternative IDs.',
    },
  ],
  stackadapt: [
    {
      severity: 'high',
      horizon: 'near',
      category: 'Competitive',
      title: 'Trade Desk enterprise down-market',
      summary: 'Kokai narrative and OpenPath retail pipes pressure mid-market accounts evaluating StackAdapt.',
    },
    {
      severity: 'medium',
      horizon: 'near',
      category: 'Competitive',
      title: 'Format specialists on CTV',
      summary: 'Kargo and Magnite partner narratives can displace platform story when buyers want named units.',
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Platform',
      title: 'Third-party identity dependency',
      summary: 'No owned identity stack while Trade Desk sets the cookieless standard.',
    },
  ],
  magnite: [
    {
      severity: 'medium',
      horizon: 'near',
      category: 'Competitive',
      title: 'Buy-side platform disintermediation',
      summary: 'Trade Desk and Amazon build direct publisher paths that bypass SSP pipes.',
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Platform',
      title: 'CTV consolidation',
      summary: 'Streaming ad tech M&A could compress SSP margins and partner options.',
    },
  ],
  'amazon-ads': [
    {
      severity: 'high',
      horizon: 'near',
      category: 'Regulatory',
      title: 'Antitrust and retail media scrutiny',
      summary: "Regulatory attention on Amazon's ad business could affect AMC and DSP bundling.",
    },
    {
      severity: 'medium',
      horizon: 'mid',
      category: 'Competitive',
      title: 'Criteo Commerce Max off-site',
      summary: 'Non-Amazon retailers activate audiences off-site — direct counter to Amazon DSP exclusivity.',
    },
  ],
  criteo: [
    {
      severity: 'high',
      horizon: 'near',
      category: 'Competitive',
      title: 'Amazon retail media scale',
      summary: "Amazon Ads shopping data and Prime Video inventory outpace Criteo's retailer network breadth.",
    },
    {
      severity: 'medium',
      horizon: 'near',
      category: 'Budget',
      title: 'Mid-market platform bundling',
      summary: 'Buyers consolidate vendors — Commerce Max + display bundles reduce standalone format spend.',
    },
  ],
};

export const leadershipBySlug = {
  kargo: [
    {
      type: 'hire',
      name: 'VP Product, CTV',
      role: 'Product leadership',
      company_slug: 'kargo',
      date: '2026-06',
      summary: 'Senior product hire signals CTV roadmap acceleration — public LinkedIn listing.',
    },
    {
      type: 'peer_move',
      name: 'Chief Revenue Officer',
      role: 'Sales leadership',
      company_slug: 'stackadapt',
      date: '2026-05',
      summary: 'StackAdapt scaling enterprise sales — watch for mid-market CTV RFP competition.',
    },
    {
      type: 'peer_move',
      name: 'Head of Identity Partnerships',
      role: 'Partnerships',
      company_slug: 'the-trade-desk',
      date: '2026-04',
      summary: 'UID2 publisher recruitment accelerating — raises identity bar for format vendors.',
    },
  ],
  'the-trade-desk': [
    {
      type: 'peer_move',
      name: 'Director, Retail Media',
      role: 'Go-to-market',
      company_slug: 'amazon-ads',
      date: '2026-06',
      summary: 'Amazon expanding off-Amazon retail media sales — direct TTD budget overlap.',
    },
    {
      type: 'hire',
      name: 'Senior Director, Kokai',
      role: 'Product',
      company_slug: 'the-trade-desk',
      date: '2026-05',
      summary: 'AI bidding team expansion — Kokai remains the flagship enterprise narrative.',
    },
  ],
  stackadapt: [
    {
      type: 'hire',
      name: 'Head of CTV',
      role: 'Product',
      company_slug: 'stackadapt',
      date: '2026-06',
      summary: 'CTV hub GTM hire — direct competitive signal vs Kargo format RFPs.',
    },
    {
      type: 'peer_move',
      name: 'VP Publisher Solutions',
      role: 'Supply',
      company_slug: 'magnite',
      date: '2026-04',
      summary: 'Magnite strengthening publisher-facing CTV sales — potential partner or rival.',
    },
  ],
  magnite: [
    {
      type: 'hire',
      name: 'SVP Streaming Partnerships',
      role: 'Partnerships',
      company_slug: 'magnite',
      date: '2026-05',
      summary: 'Streaming publisher recruitment — expands CTV supply side of the market.',
    },
  ],
  'amazon-ads': [
    {
      type: 'hire',
      name: 'Principal PM, AMC',
      role: 'Product',
      company_slug: 'amazon-ads',
      date: '2026-06',
      summary: 'Marketing Cloud expansion — clean-room analytics pulling agency data budgets.',
    },
    {
      type: 'peer_move',
      name: 'Global Head, Commerce Max',
      role: 'Product',
      company_slug: 'criteo',
      date: '2026-05',
      summary: 'Criteo scaling off-site retail media — counter-move to Amazon DSP.',
    },
  ],
  criteo: [
    {
      type: 'hire',
      name: 'Director, Retail Media APAC',
      role: 'Regional GTM',
      company_slug: 'criteo',
      date: '2026-06',
      summary: 'APAC retail media push — regional hiring spike visible in LinkedIn corpus.',
    },
    {
      type: 'peer_move',
      name: 'VP Ad Products, Prime Video',
      role: 'Product',
      company_slug: 'amazon-ads',
      date: '2026-04',
      summary: 'Prime Video ad tier expansion — CTV inventory competition intensifying.',
    },
  ],
};
