// Empty VITE_API_URL (Docker/nginx) uses same-origin /api proxy.
// Local vite defaults to the Express server on :5000.
const API_URL =
  import.meta.env.VITE_API_URL !== undefined
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:5000';

async function get(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  dashboard: () => get('/api/dashboard'),
  competitors: (tier) => get(`/api/competitors${tier ? `?tier=${tier}` : ''}`),
  competitor: (id) => get(`/api/competitors/${id}`),
  signals: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/api/signals${qs ? `?${qs}` : ''}`);
  },
  signal: (id) => get(`/api/signals/${id}`),
  opportunities: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/api/opportunities${qs ? `?${qs}` : ''}`);
  },
  opportunity: (id) => get(`/api/opportunities/${id}`),
  sources: () => get('/api/sources'),
  gaps: () => get('/api/analysis/gaps'),
  lagMap: () => get('/api/scope-map'),
  scopeMap: () => get('/api/scope-map'),
  quarters: (quarter) => get(`/api/quarters${quarter ? `?quarter=${encodeURIComponent(quarter)}` : ''}`),
  learnings: () => get('/api/learnings'),
  evidence: (ids = []) => get(`/api/evidence?ids=${ids.join(',')}`),
};
