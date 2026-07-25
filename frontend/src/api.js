import { staticApi } from './staticApi';

export const isStaticMode =
  import.meta.env.VITE_USE_STATIC_DATA === 'true' ||
  (import.meta.env.PROD && import.meta.env.BASE_URL !== '/');

const BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const { body, headers, ...rest } = options;
  const fetchHeaders = { ...headers };
  if (body !== undefined) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: fetchHeaders,
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  companies: () => (isStaticMode ? staticApi.companies() : request('/api/companies')),
  company: (slug) => (isStaticMode ? staticApi.company(slug) : request(`/api/companies/${slug}`)),
  peers: (slug) => (isStaticMode ? staticApi.peers(slug) : request(`/api/companies/${slug}/peers`)),
  signals: (slug) => (isStaticMode ? staticApi.signals(slug) : request(`/api/companies/${slug}/signals`)),
  hiring: (slug) => (isStaticMode ? staticApi.hiring(slug) : request(`/api/companies/${slug}/hiring`)),
  xPosts: (slug) => (isStaticMode ? staticApi.xPosts(slug) : request(`/api/companies/${slug}/x`)),
  suggestions: (slug) =>
    isStaticMode ? staticApi.suggestions(slug) : request(`/api/companies/${slug}/suggestions`),
  benefitCorpus: () => (isStaticMode ? staticApi.benefitCorpus() : request('/api/benefit')),
  benefit: (slug) =>
    isStaticMode ? staticApi.benefit(slug) : request(`/api/companies/${slug}/benefit`),
  executive: (slug) =>
    isStaticMode ? staticApi.executive(slug) : request(`/api/companies/${slug}/executive`),
  policies: () => (isStaticMode ? staticApi.policies() : request('/api/policies')),
  refresh: (slug) =>
    isStaticMode
      ? staticApi.refresh(slug)
      : request(`/api/companies/${slug}/refresh`, { method: 'POST' }),
  updateSuggestion: (id, status) =>
    isStaticMode
      ? staticApi.updateSuggestion(id, status)
      : request(`/api/suggestions/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        }),
  track: (eventType, companySlug, meta = {}) =>
    isStaticMode
      ? staticApi.track(eventType, companySlug, meta)
      : request('/api/usage', {
          method: 'POST',
          body: JSON.stringify({ eventType, companySlug, meta }),
        }),
};

export function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export function revenuePerEmployee(company) {
  if (!company?.employees || !company?.adRevenueUsd) return null;
  return Math.round(company.adRevenueUsd / company.employees);
}

export function peerAvgRevenuePerEmployee(peers) {
  const values = peers.map(revenuePerEmployee).filter((v) => v != null);
  if (!values.length) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

export function formatUsdPerEmployee(n) {
  if (n == null) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n.toLocaleString()}`;
}

export function revenuePerEmployeeHint(company, peers) {
  const rpe = revenuePerEmployee(company);
  const peerAvg = peerAvgRevenuePerEmployee(peers);
  if (rpe == null) return 'Ad revenue ÷ headcount';
  if (peerAvg == null) return 'Ad revenue ÷ headcount';
  const delta = Math.round(((rpe - peerAvg) / peerAvg) * 100);
  if (delta === 0) return `${formatUsdPerEmployee(peerAvg)} peer avg`;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}% vs ${formatUsdPerEmployee(peerAvg)} peer avg`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
