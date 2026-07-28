function parseAsOfMonth(asOf) {
  if (!asOf) return null;
  const iso = String(asOf);
  const match = iso.match(/^(\d{4})-(\d{2})/);
  if (!match) return null;
  return { year: parseInt(match[1], 10), month: parseInt(match[2], 10) - 1 };
}

function formatMonthYear(date) {
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function generateLabels(count, asOf) {
  const parsed = parseAsOfMonth(asOf);
  const end = parsed
    ? new Date(parsed.year, parsed.month, 1)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const labels = [];
  for (let i = count - 1; i >= 0; i--) {
    labels.push(formatMonthYear(new Date(end.getFullYear(), end.getMonth() - i, 1)));
  }
  return labels;
}

/** Trim or pad a trend so it lines up with chart labels (keep the most recent months). */
export function alignTrendToLength(trend, length) {
  const values = trend || [];
  if (!length) return [];
  if (!values.length) return Array(length).fill(0);
  if (values.length === length) return values;
  if (values.length > length) return values.slice(-length);
  return [...Array(length - values.length).fill(values[0]), ...values];
}

/** Rolling month labels ending at search as-of (or company refresh). */
export function searchTrendLabels(searchMetrics, fallbackAsOf) {
  const count = searchMetrics?.trend?.length || 12;
  const stored = searchMetrics?.monthLabels;
  const asOf = searchMetrics?.source?.asOf || searchMetrics?.asOf || fallbackAsOf;

  // Ignore legacy month-only labels (Jan, Feb, …) — require a year on every label.
  if (
    stored?.length === count &&
    stored.length > 0 &&
    stored.every((label) => /\d{4}/.test(String(label)))
  ) {
    return stored;
  }

  return generateLabels(count, asOf);
}

export function searchPeriodRange(searchMetrics, fallbackAsOf) {
  const aligned = alignSearchSeries(searchMetrics, fallbackAsOf);
  if (!aligned.period) return null;
  return aligned.period;
}

export function searchPeriodSubtitle(searchMetrics, fallbackAsOf) {
  const range = searchPeriodRange(searchMetrics, fallbackAsOf);
  if (!range) return 'Rolling 12 months · normalized index (0–100)';
  return `${range.start} – ${range.end} · normalized index (0–100)`;
}

export function searchLatestMonth(searchMetrics, fallbackAsOf) {
  const range = searchPeriodRange(searchMetrics, fallbackAsOf);
  return range?.end ?? null;
}

/**
 * Single source of truth for search charts and headline stats.
 * Keeps trend values and x-axis labels the same length and time window.
 */
export function alignSearchSeries(searchMetrics, fallbackAsOf, trendOverride) {
  const rawTrend = trendOverride ?? searchMetrics?.trend ?? [];
  const asOf = searchMetrics?.source?.asOf || searchMetrics?.asOf || fallbackAsOf;
  const windowSize = rawTrend.length || searchMetrics?.trend?.length || 12;
  const labels = searchTrendLabels(
    { ...searchMetrics, trend: rawTrend.length ? rawTrend : searchMetrics?.trend, monthLabels: searchMetrics?.monthLabels },
    fallbackAsOf
  );
  const n = Math.min(rawTrend.length || windowSize, labels.length) || windowSize;
  const alignedLabels = labels.slice(-n);
  const alignedTrend = alignTrendToLength(rawTrend.length ? rawTrend : searchMetrics?.trend || [], n);

  if (!alignedTrend.length) {
    return {
      trend: [],
      labels: [],
      focusIndex: null,
      startIndex: null,
      periodChange: null,
      period: null,
      asOf,
    };
  }

  const focusIndex = alignedTrend[alignedTrend.length - 1];
  const startIndex = alignedTrend[0];
  const periodChange =
    startIndex > 0 ? Math.round(((focusIndex - startIndex) / startIndex) * 100) : null;
  const period =
    alignedLabels.length >= 2
      ? { start: alignedLabels[0], end: alignedLabels[alignedLabels.length - 1], labels: alignedLabels }
      : null;

  return {
    trend: alignedTrend,
    labels: alignedLabels,
    focusIndex,
    startIndex,
    periodChange,
    period,
    asOf,
  };
}
