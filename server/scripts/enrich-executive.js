import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  EXECUTIVE_VERSION,
  executivePolicy,
  briefsBySlug,
  threatsBySlug,
  leadershipBySlug,
} from './executive-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

store.executive = {};
store.executivePolicy = executivePolicy;

for (const company of store.companies) {
  store.executive[company.slug] = {
    brief: briefsBySlug[company.slug] || { headline: company.tagline, decision: '' },
    threats: threatsBySlug[company.slug] || [],
    leadership: leadershipBySlug[company.slug] || [],
  };
}

store.executiveVersion = EXECUTIVE_VERSION;

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

for (const company of store.companies) {
  const e = store.executive[company.slug];
  console.log(
    company.slug.padEnd(16),
    `${e.threats.length} threats`.padEnd(12),
    `${e.leadership.length} leadership moves`
  );
}

console.log(`\nExecutive v${EXECUTIVE_VERSION} applied for ${store.companies.length} companies`);
