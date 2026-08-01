import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { enrichHiringRecord } from './linkedin-hiring-links.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const nameMap = Object.fromEntries(store.companies.map((c) => [c.slug, c.name]));

store.hiring = (store.hiring || [])
  .sort((a, b) => b.posted_at.localeCompare(a.posted_at))
  .map((job, i) => {
    const { id: _id, company_name: _cn, source: _s, source_name: _sn, confidence: _c, linkedin_company_url: _l, source_url: _u, linkedin_search_url: _ls, ...core } = job;
    return enrichHiringRecord(core, nameMap[job.company_slug], i + 1);
  });

store.hiringPolicy =
  store.hiringPolicy ||
  'Open roles are live listings from public careers feeds. Re-run `node server/scripts/fetch-verified-hiring.js` to refresh verified data.';

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log(`Fixed ${store.hiring.length} hiring links`);
