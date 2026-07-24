export const SEGMENT_BUCKETS = [
  'CTV',
  'Display & mobile',
  'Retail media',
  'Data & identity',
  'Audio & other',
  'Other',
];

const SEGMENT_MAP = {
  'Mobile high-impact': 'Display & mobile',
  CTV: 'CTV',
  'Data & insights': 'Data & identity',
  Other: 'Other',
  'Display & native': 'Display & mobile',
  'Audio & other': 'Audio & other',
  'Data & identity': 'Data & identity',
  'Native & display': 'Display & mobile',
  'Audio & DOOH': 'Audio & other',
  'Managed service': 'Other',
  'Display SSP': 'Display & mobile',
  'DV+': 'Other',
  'Sponsored products & brands': 'Retail media',
  'Amazon DSP': 'Retail media',
  'Fire TV & video': 'CTV',
  'Retail media off-site': 'Retail media',
  'Performance display': 'Display & mobile',
  'Data & audiences': 'Data & identity',
};

export function bucketForSegment(name) {
  return SEGMENT_MAP[name] || 'Other';
}

/** Roll company segments into comparable buckets (% shares). */
export function normalizeSegmentMix(company) {
  const totals = Object.fromEntries(SEGMENT_BUCKETS.map((b) => [b, 0]));
  for (const seg of company.revenueSegments || []) {
    const bucket = bucketForSegment(seg.name);
    totals[bucket] += seg.pct || 0;
  }
  return totals;
}

export function peerAverageMix(peers) {
  if (!peers.length) return Object.fromEntries(SEGMENT_BUCKETS.map((b) => [b, 0]));
  const sums = Object.fromEntries(SEGMENT_BUCKETS.map((b) => [b, 0]));
  for (const peer of peers) {
    const mix = normalizeSegmentMix(peer);
    for (const b of SEGMENT_BUCKETS) {
      sums[b] += mix[b];
    }
  }
  return Object.fromEntries(
    SEGMENT_BUCKETS.map((b) => [b, Math.round((sums[b] / peers.length) * 10) / 10])
  );
}

export function segmentComparison(company, peers) {
  const yours = normalizeSegmentMix(company);
  const peerAvg = peerAverageMix(peers);
  return SEGMENT_BUCKETS.map((bucket) => ({
    bucket,
    yours: yours[bucket],
    peerAvg: peerAvg[bucket],
    delta: Math.round((yours[bucket] - peerAvg[bucket]) * 10) / 10,
  })).filter((row) => row.yours > 0 || row.peerAvg > 0);
}

export function segmentInsights(company, peers) {
  const rows = segmentComparison(company, peers);
  if (!rows.length) return null;

  const sorted = [...rows].sort((a, b) => b.delta - a.delta);
  const over = sorted.find((r) => r.delta >= 5);
  const under = [...sorted].reverse().find((r) => r.delta <= -5);

  return {
    over: over ? `${company.name} over-indexes on ${over.bucket} (+${over.delta} pts vs peers).` : null,
    under: under ? `Under-indexed on ${under.bucket} (${under.delta} pts vs peer avg).` : null,
  };
}
