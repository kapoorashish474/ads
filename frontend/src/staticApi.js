import { buildExecutivePayload } from './lib/executive.js';
import { buildBenefitCorpus, BENEFIT_POLICY } from './lib/benefit.js';

const DATA_URL = `${import.meta.env.BASE_URL}data/store.json`;

let storeCache = null;
let storePromise = null;

async function loadStore() {
  if (storeCache) return storeCache;
  if (!storePromise) {
    storePromise = fetch(DATA_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load research data (${res.status})`);
        return res.json();
      })
      .then((data) => {
        storeCache = data;
        if (!storeCache.usage) storeCache.usage = [];
        if (!storeCache.benefit) storeCache.benefit = {};
        return storeCache;
      });
  }
  return storePromise;
}

function getCompany(store, slug) {
  return store.companies.find((c) => c.slug === slug);
}

function refreshCompany(store, slug) {
  const company = getCompany(store, slug);
  if (!company) throw new Error('Company not found');

  const segments = company.revenueSegments || [];
  if (segments.length) {
    const i = Math.floor(Math.random() * segments.length);
    segments[i] = {
      ...segments[i],
      pct: Math.min(99, Math.max(1, segments[i].pct + (Math.random() > 0.5 ? 1 : -1))),
    };
  }

  const trend = company.searchMetrics?.trend || [];
  if (trend.length) {
    company.searchMetrics.trend = [
      ...trend.slice(1),
      Math.min(100, trend[trend.length - 1] + Math.floor(Math.random() * 4)),
    ];
  }

  company.refreshedAt = new Date().toISOString();
  store.usage.push({
    id: store.usage.length + 1,
    eventType: 'refresh',
    companySlug: slug,
    createdAt: new Date().toISOString(),
  });

  if (!store.benefit[slug]) {
    store.benefit[slug] = { views: 0, refreshes: 0, suggestionsAccepted: 0, validatedSignals: 0 };
  }
  store.benefit[slug].refreshes = (store.benefit[slug].refreshes || 0) + 1;

  return company;
}

export const staticApi = {
  companies: async () => {
    const store = await loadStore();
    return {
      companies: store.companies.map((c) => ({
        slug: c.slug,
        name: c.name,
        type: c.type,
        tier: c.tier,
        tagline: c.tagline,
        refreshedAt: c.refreshedAt,
      })),
    };
  },

  company: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    if (!company) throw new Error('Company not found');
    return { company };
  },

  peers: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    if (!company) throw new Error('Company not found');
    const peers = store.companies.filter((c) => company.peerSlugs.includes(c.slug));
    return { company, peers };
  },

  signals: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    const slugs = company ? [company.slug, ...company.peerSlugs] : [slug];
    const list = (store.signals || [])
      .filter((s) => slugs.includes(s.company_slug))
      .sort((a, b) => b.published_at.localeCompare(a.published_at));
    return { signals: list };
  },

  hiring: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    const slugs = company ? [company.slug, ...company.peerSlugs] : [slug];
    const list = (store.hiring || [])
      .filter((j) => slugs.includes(j.company_slug))
      .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
    return { jobs: list, policy: store.hiringPolicy || '' };
  },

  xPosts: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    const slugs = company ? [company.slug, ...company.peerSlugs] : [slug];
    const list = (store.xPosts || [])
      .filter((p) => slugs.includes(p.company_slug))
      .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
    return { posts: list, policy: store.xPolicy || '' };
  },

  suggestions: async (slug) => {
    const store = await loadStore();
    const list = (store.suggestions || [])
      .filter((s) => s.subject_slug === slug)
      .sort((a, b) => {
        const p = { critical: 0, high: 1, medium: 2, low: 3 };
        return p[a.priority] - p[b.priority];
      });
    return { suggestions: list };
  },

  benefitCorpus: async () => {
    const store = await loadStore();
    return {
      corpus: buildBenefitCorpus(store),
      policy: BENEFIT_POLICY,
    };
  },

  benefit: async (slug) => {
    const store = await loadStore();
    const usage = store.benefit?.[slug] || {
      views: 0,
      refreshes: 0,
      suggestionsAccepted: 0,
      validatedSignals: 0,
    };
    return {
      usage,
      corpus: buildBenefitCorpus(store),
      policy: BENEFIT_POLICY,
    };
  },

  policies: async () => {
    const store = await loadStore();
    return {
      research: store.researchPolicy || '',
      hiring: store.hiringPolicy || '',
      x: store.xPolicy || '',
      products: store.productsPolicy || '',
      suggestions: store.suggestionsPolicy || '',
      benefit: store.benefitPolicy || '',
      executive: store.executivePolicy || '',
      sources: store.sourcesPolicy || '',
    };
  },

  executive: async (slug) => {
    const store = await loadStore();
    const company = getCompany(store, slug);
    if (!company) throw new Error('Company not found');
    const peers = store.companies.filter((c) => company.peerSlugs.includes(c.slug));
    return buildExecutivePayload(store, company, peers);
  },

  refresh: async (slug) => {
    const store = await loadStore();
    const company = refreshCompany(store, slug);
    return { ok: true, refreshedAt: company.refreshedAt };
  },

  updateSuggestion: async (id, status) => {
    const store = await loadStore();
    const suggestion = store.suggestions.find((s) => s.id === Number(id));
    if (!suggestion) throw new Error('Suggestion not found');
    suggestion.status = status;
    if (status === 'accepted') {
      const sSlug = suggestion.subject_slug;
      if (!store.benefit[sSlug]) {
        store.benefit[sSlug] = { views: 0, refreshes: 0, suggestionsAccepted: 0, validatedSignals: 0 };
      }
      store.benefit[sSlug].suggestionsAccepted += 1;
    }
    store.usage.push({
      id: store.usage.length + 1,
      eventType: 'suggestion_update',
      companySlug: suggestion.subject_slug,
      meta: { suggestionId: suggestion.id, status },
      createdAt: new Date().toISOString(),
    });
    return { suggestion };
  },

  track: async (eventType, companySlug) => {
    const store = await loadStore();
    store.usage.push({
      id: store.usage.length + 1,
      eventType,
      companySlug,
      createdAt: new Date().toISOString(),
    });
    if (companySlug && eventType === 'view_company') {
      if (!store.benefit[companySlug]) {
        store.benefit[companySlug] = { views: 0, refreshes: 0, suggestionsAccepted: 0, validatedSignals: 0 };
      }
      store.benefit[companySlug].views = (store.benefit[companySlug].views || 0) + 1;
    }
    return { ok: true };
  },
};
