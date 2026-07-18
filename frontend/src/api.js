const USE_STATIC =
  import.meta.env.VITE_USE_STATIC_DATA === 'true' ||
  (import.meta.env.PROD && import.meta.env.BASE_URL !== '/');
const BASE = import.meta.env.BASE_URL || '/';

const API_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5001';

let signalsCache = null;
let opportunitiesCache = null;

async function loadJson(path) {
  const res = await fetch(`${BASE}data/${path}`);
  if (!res.ok) throw new Error(`Static data ${res.status}: ${path}`);
  return res.json();
}

async function getStatic(path, params = {}) {
  if (path === '/api/dashboard') return loadJson('dashboard.json');
  if (path === '/api/competitors') {
    const data = await loadJson('competitors.json');
    if (params.tier) {
      return {
        ...data,
        competitors: data.competitors.filter((c) => c.tier === params.tier),
      };
    }
    return data;
  }
  if (path.startsWith('/api/competitors/')) {
    const id = path.split('/').pop();
    return loadJson(`competitors/${id}.json`);
  }
  if (path === '/api/signals') {
    if (!signalsCache) signalsCache = await loadJson('signals.json');
    let list = [...signalsCache.signals];
    const { competitorId, sourceId, impact, category, q } = params;
    if (competitorId) list = list.filter((s) => s.competitorId === competitorId);
    if (sourceId) list = list.filter((s) => s.sourceId === sourceId);
    if (impact) list = list.filter((s) => s.impactOnKargo === impact);
    if (category) list = list.filter((s) => s.category === category);
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(needle) ||
          s.summary.toLowerCase().includes(needle) ||
          s.tags.some((t) => t.toLowerCase().includes(needle))
      );
    }
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return { count: list.length, signals: list, dataPolicy: 'public-sources-only' };
  }
  if (path.startsWith('/api/signals/')) {
    const id = path.split('/').pop();
    return loadJson(`signals/${id}.json`);
  }
  if (path === '/api/opportunities') {
    if (!opportunitiesCache) opportunitiesCache = await loadJson('opportunities.json');
    let list = [...opportunitiesCache.opportunities];
    const { priority, status } = params;
    if (priority) list = list.filter((o) => o.priority === priority);
    if (status) list = list.filter((o) => o.status === status);
    list.sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return p[a.priority] - p[b.priority] || b.confidence - a.confidence;
    });
    return { count: list.length, opportunities: list, dataPolicy: 'public-sources-only' };
  }
  if (path.startsWith('/api/opportunities/')) {
    const id = path.split('/').pop();
    return loadJson(`opportunities/${id}.json`);
  }
  if (path === '/api/sources') return loadJson('sources.json');
  if (path === '/api/analysis/gaps' || path === '/api/scope-map' || path === '/api/lag-map') {
    return loadJson('scope-map.json');
  }
  if (path === '/api/quarters') {
    const quarter = params.quarter;
    if (quarter) return loadJson(`quarters/${quarter}.json`);
    return loadJson('quarters.json');
  }
  if (path === '/api/learnings') return loadJson('learnings.json');
  if (path === '/api/evidence') {
    const ids = String(params.ids || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!signalsCache) signalsCache = await loadJson('signals.json');
    const evidence = ids.map((id) => signalsCache.signals.find((s) => s.id === id)).filter(Boolean);
    const sourceMap = new Map();
    evidence.forEach((e) => {
      sourceMap.set(e.sourceId, {
        id: e.sourceId,
        name: e.sourceName,
        type: e.sourceType,
        url: e.sourceUrl,
      });
    });
    return { policy: 'Public sources only.', evidence, sources: [...sourceMap.values()] };
  }
  throw new Error(`No static handler for ${path}`);
}

async function getLive(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${API_URL}${path}${qs ? `?${qs}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

async function get(path, params = {}) {
  if (USE_STATIC) return getStatic(path, params);
  return getLive(path, params);
}

export const api = {
  dashboard: () => get('/api/dashboard'),
  competitors: (tier) => get('/api/competitors', tier ? { tier } : {}),
  competitor: (id) => get(`/api/competitors/${id}`),
  signals: (params = {}) => get('/api/signals', params),
  signal: (id) => get(`/api/signals/${id}`),
  opportunities: (params = {}) => get('/api/opportunities', params),
  opportunity: (id) => get(`/api/opportunities/${id}`),
  sources: () => get('/api/sources'),
  gaps: () => get('/api/analysis/gaps'),
  lagMap: () => get('/api/scope-map'),
  scopeMap: () => get('/api/scope-map'),
  quarters: (quarter) => get('/api/quarters', quarter ? { quarter } : {}),
  learnings: () => get('/api/learnings'),
  evidence: (ids = []) => get('/api/evidence', { ids: ids.join(',') }),
};
