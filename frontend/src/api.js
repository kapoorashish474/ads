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
  companies: () => request('/api/companies'),
  company: (slug) => request(`/api/companies/${slug}`),
  peers: (slug) => request(`/api/companies/${slug}/peers`),
  signals: (slug) => request(`/api/companies/${slug}/signals`),
  hiring: (slug) => request(`/api/companies/${slug}/hiring`),
  xPosts: (slug) => request(`/api/companies/${slug}/x`),
  suggestions: (slug) => request(`/api/companies/${slug}/suggestions`),
  benefit: (slug) => request(`/api/companies/${slug}/benefit`),
  refresh: (slug) => request(`/api/companies/${slug}/refresh`, { method: 'POST' }),
  updateSuggestion: (id, status) =>
    request(`/api/suggestions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  track: (eventType, companySlug, meta = {}) =>
    request('/api/usage', {
      method: 'POST',
      body: JSON.stringify({ eventType, companySlug, meta }),
    }),
};

export function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
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
