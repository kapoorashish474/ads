/** Client-side executive payload (mirrors server/executive.js). */

function avgRadar(company) {
  const radar = company.strengthRadar || [];
  if (!radar.length) return 0;
  return Math.round(radar.reduce((s, r) => s + r.value, 0) / radar.length);
}

function peerAvgRadar(peers) {
  if (!peers.length) return 0;
  return Math.round(peers.reduce((s, p) => s + avgRadar(p), 0) / peers.length);
}

function trendMomentum(trend) {
  if (!trend || trend.length < 4) {
    return { key: 'search', label: 'Search interest', score: 50, direction: 'flat', detail: 'Insufficient trend data' };
  }
  const recent = trend.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const prior = trend.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const pct = prior ? ((recent - prior) / prior) * 100 : 0;
  const score = Math.min(100, Math.max(0, Math.round(50 + pct)));
  const direction = pct > 5 ? 'up' : pct < -5 ? 'down' : 'flat';
  return {
    key: 'search',
    label: 'Search interest',
    score,
    direction,
    detail: `${direction === 'up' ? '+' : ''}${Math.round(pct)}% vs start of period`,
  };
}

function hiringMomentum(jobs, company, peers) {
  const focus = jobs.filter((j) => j.company_slug === company.slug).length;
  const peerAvg =
    peers.length > 0
      ? peers.reduce((s, p) => s + jobs.filter((j) => j.company_slug === p.slug).length, 0) / peers.length
      : 0;
  const delta = peerAvg ? ((focus - peerAvg) / peerAvg) * 100 : 0;
  const score = Math.min(100, Math.max(0, Math.round(50 + delta * 0.5)));
  const direction = delta > 8 ? 'up' : delta < -8 ? 'down' : 'flat';
  return {
    key: 'hiring',
    label: 'Hiring velocity',
    score,
    direction,
    detail: `${focus} open roles vs ${Math.round(peerAvg * 10) / 10} peer avg`,
  };
}

function signalMomentum(signals, company) {
  const watch = [company.slug, ...(company.peerSlugs || [])];
  const companySignals = signals.filter((s) => s.company_slug === company.slug);
  const peerSignals = signals.filter((s) => s.company_slug !== company.slug && watch.includes(s.company_slug));
  const ratio = peerSignals.length ? companySignals.length / (peerSignals.length / (company.peerSlugs?.length || 1)) : 1;
  const score = Math.min(100, Math.max(0, Math.round(45 + ratio * 12)));
  const direction = ratio > 1.1 ? 'up' : ratio < 0.9 ? 'down' : 'flat';
  return {
    key: 'signals',
    label: 'Signal activity',
    score,
    direction,
    detail: `${companySignals.length} company signals in corpus`,
  };
}

function radarMomentum(company, peers) {
  const focus = avgRadar(company);
  const peerAvg = peerAvgRadar(peers);
  const delta = focus - peerAvg;
  const score = Math.min(100, Math.max(0, focus));
  const direction = delta > 5 ? 'up' : delta < -5 ? 'down' : 'flat';
  return {
    key: 'position',
    label: 'Competitive position',
    score,
    direction,
    detail: `${focus}/100 avg radar vs ${peerAvg} peer avg`,
  };
}

function revenuePerEmployee(company) {
  if (!company.employees || !company.adRevenueUsd) return null;
  return Math.round(company.adRevenueUsd / company.employees);
}

function buildGaps(company, peers) {
  const gaps = [];
  const insights = company.productInsights?.takeaways || [];
  insights
    .filter((t) => t.type === 'gap')
    .forEach((t) => {
      gaps.push({
        area: t.title,
        severity: 'high',
        summary: t.body,
        source: 'product',
      });
    });

  (company.strengthRadar || []).forEach((ind) => {
    const peerVals = peers
      .map((p) => p.strengthRadar?.find((r) => r.label === ind.label)?.value)
      .filter((v) => v != null);
    if (!peerVals.length) return;
    const peerAvg = Math.round(peerVals.reduce((a, b) => a + b, 0) / peerVals.length);
    const delta = ind.value - peerAvg;
    if (delta < -8) {
      gaps.push({
        area: ind.label,
        severity: delta < -15 ? 'critical' : 'medium',
        summary: `${company.name} scores ${ind.value}/100 vs ${peerAvg} peer average on ${ind.label.toLowerCase()}.`,
        source: 'radar',
        score: ind.value,
        peerAvg,
      });
    }
  });

  return gaps.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2, low: 3 };
    return (p[a.severity] || 9) - (p[b.severity] || 9);
  });
}

function buildBriefChanges(store, company, peers) {
  const changes = [];
  const recentSignals = (store.signals || [])
    .filter((s) => [company.slug, ...peers.map((p) => p.slug)].includes(s.company_slug))
    .slice(0, 3);
  recentSignals.forEach((s) => {
    changes.push({
      type: 'signal',
      title: s.title,
      summary: s.summary,
      date: s.published_at,
      company: s.company_slug === company.slug ? company.name : peers.find((p) => p.slug === s.company_slug)?.name,
    });
  });
  return changes;
}

function buildOpportunities(company, gaps, suggestions) {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  const strengths = (company.productInsights?.takeaways || [])
    .filter((t) => t.type === 'strength')
    .slice(0, 2)
    .map((t) => ({ title: t.title, summary: t.body }));

  if (strengths.length === 0 && company.winning?.[0]) {
    strengths.push({
      title: 'Core advantage',
      summary: company.winning[0].text,
    });
  }

  const actions = suggestions
    .filter((s) => s.status === 'open' && ['high', 'critical'].includes(s.priority))
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 2)
    .map((s) => ({
      title: s.title,
      summary: s.thesis,
      priority: s.priority,
      lane: s.lane,
      fastPath: s.fast_path,
    }));

  if (strengths.length === 0 && actions.length === 0 && gaps.length === 0) {
    strengths.push({
      title: 'Maintain differentiation',
      summary: company.winning?.[0]?.text || 'No critical gaps flagged in current corpus.',
    });
  }

  return { strengths, actions };
}

export function buildExecutivePayload(store, company, peers) {
  const slug = company.slug;
  const exec = store.executive?.[slug] || {};
  const signals = (store.signals || []).filter((s) =>
    [company.slug, ...(company.peerSlugs || [])].includes(s.company_slug)
  );
  const jobs = (store.hiring || []).filter((j) =>
    [company.slug, ...(company.peerSlugs || [])].includes(j.company_slug)
  );
  const suggestions = (store.suggestions || []).filter((s) => s.subject_slug === slug);

  const dimensions = [
    trendMomentum(company.searchMetrics?.trend),
    hiringMomentum(jobs, company, peers),
    signalMomentum(signals, company),
    radarMomentum(company, peers),
  ];
  const overallScore = Math.round(dimensions.reduce((s, d) => s + d.score, 0) / dimensions.length);

  const gaps = buildGaps(company, peers);
  const changes = buildBriefChanges(store, company, peers);
  const opportunities = buildOpportunities(company, gaps, suggestions);
  const topThreats = (exec.threats || []).slice(0, 3);

  return {
    brief: {
      headline: exec.brief?.headline || company.suggestionSummary?.headline || company.tagline,
      decision: exec.brief?.decision || '',
      changes,
      threats: topThreats,
      opportunities,
      asOf: company.refreshedAt,
    },
    threats: exec.threats || [],
    momentum: {
      overallScore,
      direction: overallScore >= 58 ? 'up' : overallScore <= 42 ? 'down' : 'flat',
      dimensions,
      revenuePerEmployee: revenuePerEmployee(company),
      peerRevenuePerEmployee:
        peers.length > 0
          ? Math.round(
              peers.reduce((s, p) => s + (revenuePerEmployee(p) || 0), 0) / peers.filter((p) => revenuePerEmployee(p)).length
            )
          : null,
    },
    gaps,
    leadership: exec.leadership || [],
    policy: store.executivePolicy || '',
  };
}
