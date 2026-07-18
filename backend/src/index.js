require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sources } = require('./data/sources');
const { competitors, kargoBaseline } = require('./data/competitors');
const { signals } = require('./data/signals');
const { opportunities } = require('./data/opportunities');
const { learnings } = require('./data/learnings');
const {
  dashboardSummary,
  competitorDetail,
  opportunityDetail,
  scopeMap,
  quartersPayload,
  evidenceBundle,
} = require('./data/analysis');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'intel',
    message: 'Competitive intelligence API running',
    dataPolicy: 'public-sources-only',
  });
});

app.get('/api/dashboard', (_req, res) => {
  res.json(dashboardSummary());
});

app.get('/api/competitors', (req, res) => {
  const { tier } = req.query;
  let list = competitors;
  if (tier) list = list.filter((c) => c.tier === tier);
  res.json({ kargo: kargoBaseline, competitors: list, dataPolicy: 'public-sources-only' });
});

app.get('/api/competitors/:id', (req, res) => {
  const detail = competitorDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Competitor not found' });
  res.json(detail);
});

app.get('/api/signals', (req, res) => {
  const { competitorId, sourceId, impact, category, q } = req.query;
  let list = [...signals];

  if (competitorId) list = list.filter((s) => s.competitorId === competitorId);
  if (sourceId) list = list.filter((s) => s.sourceId === sourceId);
  if (impact) list = list.filter((s) => s.impactOnKargo === impact);
  if (category) list = list.filter((s) => s.category === category);
  if (q) {
    const needle = String(q).toLowerCase();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(needle) ||
        s.summary.toLowerCase().includes(needle) ||
        s.tags.some((t) => t.toLowerCase().includes(needle))
    );
  }

  list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  res.json({ count: list.length, signals: list, dataPolicy: 'public-sources-only' });
});

app.get('/api/signals/:id', (req, res) => {
  const signal = signals.find((s) => s.id === req.params.id);
  if (!signal) return res.status(404).json({ error: 'Signal not found' });
  const source = sources.find((s) => s.id === signal.sourceId);
  res.json({ signal, source });
});

app.get('/api/opportunities', (req, res) => {
  const { priority, status } = req.query;
  let list = [...opportunities];
  if (priority) list = list.filter((o) => o.priority === priority);
  if (status) list = list.filter((o) => o.status === status);
  list.sort((a, b) => {
    const p = { critical: 0, high: 1, medium: 2, low: 3 };
    return p[a.priority] - p[b.priority] || b.confidence - a.confidence;
  });
  res.json({ count: list.length, opportunities: list, dataPolicy: 'public-sources-only' });
});

app.get('/api/opportunities/:id', (req, res) => {
  const detail = opportunityDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Opportunity not found' });
  res.json(detail);
});

app.get('/api/sources', (_req, res) => {
  res.json({
    dataPolicy: 'public-sources-only',
    notice:
      'Intel uses only publicly available sources. No confidential, internal, or customer data is stored or displayed.',
    count: sources.length,
    sources: sources.map((s) => ({
      ...s,
      signalCount: signals.filter((sig) => sig.sourceId === s.id).length,
    })),
  });
});

app.get('/api/analysis/gaps', (_req, res) => {
  res.json({
    ...scopeMap(),
    method:
      'Scope to improve = peer max − baseline. Derived from public signal clusters only — not private data.',
  });
});

app.get('/api/scope-map', (_req, res) => {
  res.json(scopeMap());
});

app.get('/api/lag-map', (_req, res) => {
  res.json(scopeMap());
});

app.get('/api/quarters', (req, res) => {
  res.json(quartersPayload(req.query.quarter));
});

app.get('/api/learnings', (_req, res) => {
  res.json({
    dataPolicy: 'public-sources-only',
    count: learnings.length,
    learnings,
  });
});

app.get('/api/evidence', (req, res) => {
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  res.json(evidenceBundle(ids));
});

app.listen(PORT, () => {
  console.log(`Intel API running on http://localhost:${PORT}`);
});
