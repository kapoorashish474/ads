export function countBySlug(items, slugField = 'company_slug') {
  const counts = {};
  items.forEach((item) => {
    const key = item[slugField];
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

export function compareRows(company, peers, counts) {
  return [company, ...peers]
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: counts[c.slug] || 0,
      isFocus: c.slug === company.slug,
    }))
    .sort((a, b) => b.count - a.count);
}

export function peerAverage(peers, counts) {
  if (!peers.length) return 0;
  const total = peers.reduce((sum, p) => sum + (counts[p.slug] || 0), 0);
  return Math.round((total / peers.length) * 10) / 10;
}

export function countByField(items, slugField, valueField) {
  const map = {};
  items.forEach((item) => {
    const slug = item[slugField];
    const val = item[valueField];
    if (!map[slug]) map[slug] = {};
    map[slug][val] = (map[slug][val] || 0) + 1;
  });
  return map;
}

export function focusRank(rows, focusSlug) {
  const idx = rows.findIndex((r) => r.slug === focusSlug);
  return idx >= 0 ? idx + 1 : null;
}

export function deltaVsPeers(focusCount, peerAvg) {
  const delta = Math.round((focusCount - peerAvg) * 10) / 10;
  if (delta > 0) return { text: `+${delta} vs peer avg`, tone: 'up' };
  if (delta < 0) return { text: `${delta} vs peer avg`, tone: 'down' };
  return { text: 'At peer avg', tone: 'neutral' };
}
