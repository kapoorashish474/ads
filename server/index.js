import fs from 'fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadStore, saveStore, getCompany, refreshCompany } from './store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.join(__dirname, 'public');

const app = Fastify({ logger: false });
await app.register(cors, { origin: true });

app.get('/api/health', async () => ({ ok: true }));

app.get('/api/companies', async () => {
  const { companies } = loadStore();
  return {
    companies: companies.map((c) => ({
      slug: c.slug,
      name: c.name,
      type: c.type,
      tier: c.tier,
      tagline: c.tagline,
      refreshedAt: c.refreshedAt,
    })),
  };
});

app.get('/api/companies/:slug', async (req, reply) => {
  const company = getCompany(req.params.slug);
  if (!company) return reply.code(404).send({ error: 'Company not found' });
  return { company };
});

app.get('/api/companies/:slug/peers', async (req, reply) => {
  const company = getCompany(req.params.slug);
  if (!company) return reply.code(404).send({ error: 'Company not found' });
  const { companies } = loadStore();
  const peers = companies.filter((c) => company.peerSlugs.includes(c.slug));
  return { company, peers };
});

app.get('/api/companies/:slug/signals', async (req) => {
  const company = getCompany(req.params.slug);
  const slugs = company ? [company.slug, ...company.peerSlugs] : [req.params.slug];
  const { signals } = loadStore();
  const list = signals
    .filter((s) => slugs.includes(s.company_slug))
    .sort((a, b) => b.published_at.localeCompare(a.published_at));
  return { signals: list };
});

app.get('/api/companies/:slug/hiring', async (req) => {
  const company = getCompany(req.params.slug);
  const slugs = company ? [company.slug, ...company.peerSlugs] : [req.params.slug];
  const data = loadStore();
  const list = (data.hiring || [])
    .filter((j) => slugs.includes(j.company_slug))
    .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
  return { jobs: list, policy: data.hiringPolicy || '' };
});

app.get('/api/companies/:slug/x', async (req) => {
  const company = getCompany(req.params.slug);
  const slugs = company ? [company.slug, ...company.peerSlugs] : [req.params.slug];
  const data = loadStore();
  const list = (data.xPosts || [])
    .filter((p) => slugs.includes(p.company_slug))
    .sort((a, b) => b.posted_at.localeCompare(a.posted_at));
  return { posts: list, policy: data.xPolicy || '' };
});

app.get('/api/companies/:slug/suggestions', async (req) => {
  const { suggestions } = loadStore();
  const list = suggestions
    .filter((s) => s.subject_slug === req.params.slug)
    .sort((a, b) => {
      const p = { critical: 0, high: 1, medium: 2, low: 3 };
      return p[a.priority] - p[b.priority];
    });
  return { suggestions: list };
});

app.get('/api/companies/:slug/benefit', async (req) => {
  const data = loadStore();
  const slug = req.params.slug;
  const snapshot = data.benefit[slug] || {
    views: 0,
    refreshes: 0,
    suggestionsAccepted: 0,
    researchHoursSaved: 0,
    validatedSignals: 0,
    highlights: [],
  };
  const usage = data.usage
    .filter((u) => u.companySlug === slug)
    .reduce((acc, u) => {
      const row = acc.find((x) => x.event_type === u.eventType);
      if (row) row.count += 1;
      else acc.push({ event_type: u.eventType, count: 1 });
      return acc;
    }, []);
  return {
    snapshot,
    usage,
    refreshCount: snapshot.refreshes || 0,
  };
});

app.post('/api/companies/:slug/refresh', async (req, reply) => {
  try {
    const company = refreshCompany(req.params.slug);
    return { ok: true, refreshedAt: company.refreshedAt };
  } catch {
    return reply.code(404).send({ error: 'Company not found' });
  }
});

app.post('/api/usage', async (req, reply) => {
  const { eventType, companySlug, meta = {} } = req.body || {};
  if (!eventType) return reply.code(400).send({ error: 'eventType required' });
  const data = loadStore();
  data.usage.push({
    id: data.usage.length + 1,
    eventType,
    companySlug,
    meta,
    createdAt: new Date().toISOString(),
  });
  if (companySlug && eventType === 'view_company') {
    if (!data.benefit[companySlug]) {
      data.benefit[companySlug] = {
        views: 0,
        refreshes: 0,
        suggestionsAccepted: 0,
        researchHoursSaved: 0,
        validatedSignals: 0,
        highlights: [],
      };
    }
    data.benefit[companySlug].views += 1;
    data.benefit[companySlug].researchHoursSaved = Math.round(
      data.benefit[companySlug].views * 0.4
    );
  }
  saveStore();
  return { ok: true };
});

app.patch('/api/suggestions/:id', async (req, reply) => {
  const { status } = req.body || {};
  if (!['open', 'accepted', 'dismissed'].includes(status)) {
    return reply.code(400).send({ error: 'Invalid status' });
  }
  const data = loadStore();
  const suggestion = data.suggestions.find((s) => s.id === Number(req.params.id));
  if (!suggestion) return reply.code(404).send({ error: 'Suggestion not found' });
  suggestion.status = status;
  if (status === 'accepted') {
    const slug = suggestion.subject_slug;
    if (!data.benefit[slug]) data.benefit[slug] = { views: 0, refreshes: 0, suggestionsAccepted: 0, researchHoursSaved: 0, validatedSignals: 0, highlights: [] };
    data.benefit[slug].suggestionsAccepted += 1;
  }
  data.usage.push({
    id: data.usage.length + 1,
    eventType: 'suggestion_update',
    companySlug: suggestion.subject_slug,
    meta: { suggestionId: suggestion.id, status },
    createdAt: new Date().toISOString(),
  });
  saveStore();
  return { suggestion };
});

if (fs.existsSync(PUBLIC_DIR)) {
  await app.register(fastifyStatic, { root: PUBLIC_DIR, prefix: '/' });
  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api')) return reply.code(404).send({ error: 'Not found' });
    return reply.sendFile('index.html');
  });
}

app.listen({ port: PORT, host: '0.0.0.0' }, () => {
  loadStore();
  console.log(`Server http://0.0.0.0:${PORT}`);
});
