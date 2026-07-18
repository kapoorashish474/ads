const fs = require('fs');
const path = require('path');

const { competitors, kargoBaseline } = require('../src/data/competitors');
const { signals } = require('../src/data/signals');
const { opportunities } = require('../src/data/opportunities');
const { sources } = require('../src/data/sources');
const {
  dashboardSummary,
  competitorDetail,
  opportunityDetail,
  scopeMap,
  quartersPayload,
  evidenceBundle,
  learnings,
} = require('../src/data/analysis');

const outDir = path.join(__dirname, '../../Frontend/public/data');

function writeJson(relativePath, data) {
  const full = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

writeJson('dashboard.json', dashboardSummary());

writeJson('competitors.json', {
  kargo: kargoBaseline,
  competitors,
  dataPolicy: 'public-sources-only',
});

competitors.forEach((c) => {
  writeJson(`competitors/${c.id}.json`, competitorDetail(c.id));
});

writeJson('signals.json', {
  count: signals.length,
  signals,
  dataPolicy: 'public-sources-only',
});

signals.forEach((s) => {
  const source = sources.find((src) => src.id === s.sourceId);
  writeJson(`signals/${s.id}.json`, { signal: s, source });
});

writeJson('opportunities.json', {
  count: opportunities.length,
  opportunities,
  dataPolicy: 'public-sources-only',
});

opportunities.forEach((o) => {
  writeJson(`opportunities/${o.id}.json`, opportunityDetail(o.id));
});

writeJson('sources.json', {
  dataPolicy: 'public-sources-only',
  notice:
    'Intel uses only publicly available sources. No confidential, internal, or customer data is stored or displayed.',
  count: sources.length,
  sources: sources.map((s) => ({
    ...s,
    signalCount: signals.filter((sig) => sig.sourceId === s.id).length,
  })),
});

writeJson('scope-map.json', {
  ...scopeMap(),
  method:
    'Scope to improve = peer max − baseline. Derived from public signal clusters only — not private data.',
});

writeJson('quarters.json', quartersPayload());
quartersPayload().quarters.forEach((q) => {
  writeJson(`quarters/${q}.json`, quartersPayload(q));
});

writeJson('learnings.json', {
  dataPolicy: 'public-sources-only',
  count: learnings.length,
  learnings,
});

const evidenceIds = [...new Set(signals.slice(0, 20).map((s) => s.id))];
writeJson('evidence-sample.json', evidenceBundle(evidenceIds));

console.log(`Exported static data → ${outDir}`);
