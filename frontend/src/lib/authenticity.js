const CONFIDENCE_RANK = {
  reported: 0,
  estimated: 1,
  mixed: 2,
  inferred: 3,
  modeled: 4,
};

/** Pick the least-direct confidence when combining inputs (e.g. revenue ÷ headcount). */
export function derivedSource(...sources) {
  const valid = sources.filter(Boolean);
  if (!valid.length) return null;

  return valid.reduce((worst, src) => {
    const rank = CONFIDENCE_RANK[src.confidence] ?? 99;
    const worstRank = CONFIDENCE_RANK[worst.confidence] ?? 99;
    return rank > worstRank ? src : worst;
  });
}

/** Clarify labels for non-reported metrics at point of use. */
export function metricLabel(label, source) {
  const confidence = source?.confidence;
  if (confidence === 'modeled') return `Modeled ${label.toLowerCase()}`;
  if (confidence === 'inferred') return `Inferred ${label.toLowerCase()}`;
  if (confidence === 'mixed') return `${label} (mixed source)`;
  return label;
}

export function isVerifiedConfidence(confidence) {
  return confidence === 'reported' || confidence === 'estimated';
}
