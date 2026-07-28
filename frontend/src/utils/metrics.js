import { alignSearchSeries } from './searchLabels';

export function searchMomentum(trend, searchMetrics, fallbackAsOf) {
  const aligned = searchMetrics
    ? alignSearchSeries(searchMetrics, fallbackAsOf, trend)
    : null;
  if (!aligned?.trend?.length) return null;

  const { focusIndex: index, period } = aligned;
  const latestMonth = period?.end ?? null;
  const startMonth = period?.start ?? null;
  if (aligned.trend.length < 4) return { index, changePct: null, latestMonth, startMonth };

  const recent = aligned.trend.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prior = aligned.trend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const changePct = prior ? Math.round(((recent - prior) / prior) * 100) : null;
  return { index, changePct, latestMonth, startMonth };
}

export function peerRadarAverages(peers, indicators) {
  return (indicators || []).map((ind) => {
    const vals = peers
      .map((p) => p.strengthRadar?.find((r) => r.label === ind.label)?.value)
      .filter((v) => v != null);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  });
}

export function radarRank(company, peers) {
  const focus = company.strengthRadar || [];
  if (!focus.length) return null;
  const focusAvg = Math.round(focus.reduce((s, r) => s + r.value, 0) / focus.length);
  const peerAvgs = peers.map((p) => {
    const r = p.strengthRadar || [];
    return r.length ? r.reduce((s, x) => s + x.value, 0) / r.length : 0;
  });
  const above = peerAvgs.filter((v) => focusAvg > v).length;
  return { avg: focusAvg, rank: above + 1, total: peers.length + 1 };
}
