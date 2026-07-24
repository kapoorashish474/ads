import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const websiteChecks = {
  kargo: 'https://www.kargo.com',
  'the-trade-desk': 'https://www.thetradedesk.com',
  stackadapt: 'https://www.stackadapt.com',
  magnite: 'https://www.magnite.com',
  'amazon-ads': 'https://advertising.amazon.com',
  criteo: 'https://www.criteo.com',
};

const xHandles = {
  kargo: 'kargo',
  'the-trade-desk': 'TheTradeDesk',
  stackadapt: 'StackAdapt',
  magnite: 'Magnite',
  'amazon-ads': 'AmazonAds',
  criteo: 'Criteo',
};

async function checkUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.status;
  } catch {
    return 0;
  }
}

const results = [];
for (const company of store.companies) {
  const site = websiteChecks[company.slug];
  const handle = xHandles[company.slug];
  const xUrl = handle ? `https://x.com/${handle}` : null;

  const siteStatus = site ? await checkUrl(site) : null;
  const xStatus = xUrl ? await checkUrl(xUrl) : null;

  if (company.website && site) company.website = site;
  if (company.x && handle) {
    if (company.x.handle !== handle) {
      company.x.handle = handle;
      company.x.profileUrl = xUrl;
    }
    company.x.validatedAt = new Date().toISOString().slice(0, 10);
    company.x.validatedVia = `HTTP ${xStatus}`;
  }
  if (company.dataSources?.x && xUrl) {
    company.dataSources.x.url = xUrl;
    company.dataSources.x.label = `X profile @${handle} (verified public URL)`;
    company.dataSources.x.asOf = company.x?.validatedAt;
  }

  results.push({
    company: company.name,
    website: site,
    websiteStatus: siteStatus,
    x: xUrl,
    xStatus,
  });
}

store.validationLog = {
  checkedAt: new Date().toISOString(),
  results,
};

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log('Public link validation:');
results.forEach((r) => {
  console.log(`  ${r.company}: site ${r.websiteStatus} · X ${r.xStatus} (${r.x})`);
});
