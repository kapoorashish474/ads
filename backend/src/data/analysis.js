const { competitors, kargoBaseline } = require('./competitors');
const { signals } = require('./signals');
const { opportunities } = require('./opportunities');
const { sources } = require('./sources');
const { quarterlyMoves, quarters } = require('./quarters');
const { learnings } = require('./learnings');

const GAP_MOVES = {
  aiOptimization: {
    why: 'Leaders productize goal-based bidding; public hiring and launches prove it.',
    move: 'Ship goal → optimize for high-impact formats.',
    effort: 'Medium',
    impact: 'High',
    opportunityId: 'opp-001',
  },
  retailMedia: {
    why: 'Public retail-media ARR and RMN deals are pulling brand budgets.',
    move: 'Bridge RMN audiences into offsite high-impact creative.',
    effort: 'Low',
    impact: 'High',
    opportunityId: 'opp-003',
  },
  identity: {
    why: 'Peer graphs (UID2, commerce IDs) show up in patents and product posts.',
    move: 'Deepen partner ID integrations; don’t rebuild a full graph.',
    effort: 'Medium',
    impact: 'Medium',
    opportunityId: 'opp-003',
  },
  ctv: {
    why: 'CTV remains a public investment theme across DSPs and SSPs.',
    move: 'Pair Kargo creative with ClearLine / premium CTV paths.',
    effort: 'Low',
    impact: 'Medium',
    opportunityId: 'opp-006',
  },
  measurement: {
    why: 'Attention language is spreading in public conference agendas.',
    move: 'Publish a short attention → brand-outcomes method card.',
    effort: 'Low',
    impact: 'Medium',
    opportunityId: 'opp-004',
  },
  creative: {
    why: 'Kargo leads high-impact creative; peers are closing via generative tooling.',
    move: 'Productize generative variants inside Kargo formats.',
    effort: 'Medium',
    impact: 'High',
    opportunityId: 'opp-002',
  },
  mobileHighImpact: {
    why: 'Public scores still favor Kargo on high-impact mobile.',
    move: 'Defend with proof packs; extend formats into CTV/commerce.',
    effort: 'Low',
    impact: 'High',
    opportunityId: 'opp-002',
  },
};

function capabilityGaps() {
  const dims = Object.keys(kargoBaseline.capabilityScores);
  return dims
    .map((dim) => {
      const kargo = kargoBaseline.capabilityScores[dim];
      const peerMax = Math.max(...competitors.map((c) => c.capabilityScores[dim] || 0));
      const peerAvg = Math.round(
        competitors.reduce((s, c) => s + (c.capabilityScores[dim] || 0), 0) / competitors.length
      );
      const leader = competitors.reduce((best, c) =>
        (c.capabilityScores[dim] || 0) > (best.capabilityScores[dim] || 0) ? c : best
      );
      const advice = GAP_MOVES[dim] || {
        why: 'Derived from public capability signals vs peer max.',
        move: 'Review linked opportunities.',
        effort: 'Medium',
        impact: 'Medium',
      };
      return {
        dimension: dim,
        label: dim
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (s) => s.toUpperCase())
          .replace(/^Ai /, 'AI '),
        kargo,
        peerAvg,
        peerMax,
        gapToLeader: kargo - peerMax,
        scopeToImprove: Math.max(0, peerMax - kargo),
        status: kargo >= peerMax ? 'leading' : 'scope',
        leaderId: leader.id,
        leaderName: leader.name,
        leaderScore: leader.capabilityScores[dim],
        whyItMatters: advice.why,
        recommendedMove: advice.move,
        effort: advice.effort,
        impact: advice.impact,
        opportunityId: advice.opportunityId || null,
        publicOnly: true,
      };
    })
    .sort((a, b) => b.scopeToImprove - a.scopeToImprove || a.gapToLeader - b.gapToLeader);
}

function scopeMap() {
  return {
    title: 'Scope to improve',
    policy:
      'Public sources only. No confidential, internal, or customer data. Scores from public signal clusters.',
    kargo: kargoBaseline,
    gaps: capabilityGaps(),
  };
}

/** @deprecated alias — prefer scopeMap */
function lagMap() {
  return scopeMap();
}

function topMoves(limit = 3) {
  return [...opportunities]
    .filter((o) => o.status === 'open' || o.status === 'watching')
    .sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return p[a.priority] - p[b.priority] || b.confidence - a.confidence;
    })
    .slice(0, limit)
    .map((o) => ({
      id: o.id,
      title: o.title,
      priority: o.priority,
      confidence: o.confidence,
      effort: o.effort,
      impact: o.impact,
      move: o.move,
      whyItMatters: o.whyItMatters,
      evidenceCount: o.evidenceIds.length,
      competitorsPressuring: o.competitorsPressuring,
    }));
}

function dashboardSummary() {
  const byImpact = signals.reduce((acc, s) => {
    acc[s.impactOnKargo] = (acc[s.impactOnKargo] || 0) + 1;
    return acc;
  }, {});

  const byTier = competitors.reduce((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1;
    return acc;
  }, {});

  const avgConfidence =
    opportunities.reduce((s, o) => s + o.confidence, 0) / opportunities.length;

  const latestQuarter = quarters[0];
  const quarterMoves = quarterlyMoves.filter((m) => m.quarter === latestQuarter);

  return {
    headline: 'What should we build next to stay ahead?',
    policy: 'Public sources only — every claim is source-marked with confidence.',
    generatedAt: new Date().toISOString(),
    metrics: {
      competitorsTracked: competitors.length,
      activeSources: sources.filter((s) => s.status === 'active').length,
      signalsLast14d: signals.length,
      openOpportunities: opportunities.filter((o) => o.status === 'open').length,
      avgOpportunityConfidence: Math.round(avgConfidence * 100),
      highImpactSignals: byImpact.high || 0,
      quartersTracked: quarters.length,
    },
    competitorMix: byTier,
    impactMix: byImpact,
    topMoves: topMoves(3),
    scopeMap: capabilityGaps().filter((g) => g.scopeToImprove > 0).slice(0, 5),
    lagMap: capabilityGaps().filter((g) => g.scopeToImprove > 0).slice(0, 5),
    radar: {
      kargo: Object.entries(kargoBaseline.capabilityScores).map(([dimension, value]) => ({
        label: dimension.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).split(' ')[0],
        dimension,
        value,
      })),
      peerMax: Object.keys(kargoBaseline.capabilityScores).map((dimension) => ({
        label: dimension.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).split(' ')[0],
        dimension,
        value: Math.max(...competitors.map((c) => c.capabilityScores[dimension] || 0)),
      })),
    },
    latestQuarter,
    quarterPreview: quarterMoves.slice(0, 6),
    quarters,
    learningsPreview: learnings.slice(0, 3),
    kargo: kargoBaseline,
  };
}

function competitorDetail(id) {
  const competitor = competitors.find((c) => c.id === id);
  if (!competitor) return null;

  const relatedSignals = signals
    .filter((s) => s.competitorId === id)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const relatedOpps = opportunities.filter((o) => o.competitorsPressuring.includes(id));
  const relatedQuarters = quarterlyMoves.filter((m) => m.competitorId === id);
  const relatedLearnings = learnings.filter((l) =>
    l.from.toLowerCase().includes(competitor.name.split(' ')[0].toLowerCase()) ||
    competitor.name.toLowerCase().includes(l.from.toLowerCase().split(' ')[0])
  );

  const comparison = Object.keys(kargoBaseline.capabilityScores).map((dim) => ({
    dimension: dim,
    label: dim.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
    kargo: kargoBaseline.capabilityScores[dim],
    competitor: competitor.capabilityScores[dim],
    delta: kargoBaseline.capabilityScores[dim] - competitor.capabilityScores[dim],
  }));

  return {
    competitor,
    kargo: kargoBaseline,
    comparison,
    signals: relatedSignals,
    opportunities: relatedOpps,
    quarterlyMoves: relatedQuarters,
    learnings: relatedLearnings,
    llmBrief: {
      confidence: relatedSignals.length
        ? Math.round(
            (relatedSignals.reduce((s, x) => s + x.confidence, 0) / relatedSignals.length) * 100
          ) / 100
        : 0.5,
      summary: `${competitor.name}: ${competitor.tier} ${competitor.category}. Watch level: ${competitor.watchLevel}. ${relatedSignals.length} public signals. Opportunity score ${competitor.opportunityScore}/100.`,
      watchFor: competitor.focus,
    },
  };
}

function opportunityDetail(id) {
  const opp = opportunities.find((o) => o.id === id);
  if (!opp) return null;

  const evidence = opp.evidenceIds
    .map((eid) => signals.find((s) => s.id === eid))
    .filter(Boolean);

  const pressuring = opp.competitorsPressuring
    .map((cid) => competitors.find((c) => c.id === cid))
    .filter(Boolean);

  const relatedLearnings = learnings.filter((l) => l.opportunityId === id);

  const sourcesUsed = [
    ...new Map(
      evidence.map((e) => [
        e.sourceId,
        {
          id: e.sourceId,
          name: e.sourceName,
          type: e.sourceType,
          url: e.sourceUrl,
        },
      ])
    ).values(),
  ];

  return {
    opportunity: opp,
    evidence,
    competitors: pressuring,
    sources: sourcesUsed,
    learnings: relatedLearnings,
    confidenceBreakdown: {
      overall: opp.confidence,
      evidenceCount: evidence.length,
      strongEvidence: evidence.filter((e) => e.evidenceStrength === 'strong').length,
      avgSignalConfidence: evidence.length
        ? Math.round(
            (evidence.reduce((s, e) => s + e.confidence, 0) / evidence.length) * 100
          ) / 100
        : 0,
      note: 'Public sources only. Confidence = corroboration across independent marked sources.',
    },
  };
}

function quartersPayload(quarter) {
  let moves = [...quarterlyMoves];
  if (quarter) moves = moves.filter((m) => m.quarter === quarter);
  moves.sort((a, b) => b.confidence - a.confidence);
  return {
    policy: 'Public sources only. Every move is source-marked.',
    quarters,
    selected: quarter || quarters[0],
    count: moves.length,
    moves,
  };
}

function evidenceBundle(ids = []) {
  const evidence = ids.map((id) => signals.find((s) => s.id === id)).filter(Boolean);
  return {
    policy: 'Public sources only.',
    evidence,
    sources: [
      ...new Map(
        evidence.map((e) => [
          e.sourceId,
          { id: e.sourceId, name: e.sourceName, type: e.sourceType, url: e.sourceUrl },
        ])
      ).values(),
    ],
  };
}

module.exports = {
  capabilityGaps,
  lagMap,
  scopeMap,
  topMoves,
  dashboardSummary,
  competitorDetail,
  opportunityDetail,
  quartersPayload,
  evidenceBundle,
  learnings,
};
