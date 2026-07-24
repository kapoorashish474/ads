import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const SEED_PATH = process.env.SEED_PATH || path.join(__dirname, 'data', 'store.json');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

let store = null;

function seedFilePath() {
  return SEED_PATH;
}

function needsXRefresh(store, seed) {
  if (store.xPolicy !== seed.xPolicy) return true;
  return seed.companies.some((seedCo) => {
    const co = store.companies.find((c) => c.slug === seedCo.slug);
    return seedCo.x?.handle && co?.x?.handle !== seedCo.x.handle;
  });
}

export function loadStore() {
  if (store) return store;
  const seedFile = seedFilePath();
  if (!fs.existsSync(STORE_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(seedFile, STORE_PATH);
  }
  store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));

  const seed = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
  let migrated = false;

  if (!store.companies?.[0]?.dataSources) {
    for (const company of store.companies) {
      const seedCo = seed.companies.find((c) => c.slug === company.slug);
      if (seedCo?.dataSources) {
        company.dataSources = seedCo.dataSources;
        company.searchMetrics = seedCo.searchMetrics;
        migrated = true;
      }
    }
  }

  if (!store.hiring?.length && seed.hiring?.length) {
    store.hiring = seed.hiring;
    store.hiringPolicy = seed.hiringPolicy;
    migrated = true;
  }

  if (!store.xPosts?.length && seed.xPosts?.length) {
    store.xPosts = seed.xPosts;
    store.xPolicy = seed.xPolicy;
    migrated = true;
  } else if (seed.xPosts?.length && needsXRefresh(store, seed)) {
    store.xPosts = seed.xPosts;
    store.xPolicy = seed.xPolicy;
    migrated = true;
  }

  if (!store.productsPolicy && seed.productsPolicy) {
    store.productsPolicy = seed.productsPolicy;
    migrated = true;
  }

  for (const company of store.companies) {
    const seedCo = seed.companies.find((c) => c.slug === company.slug);
    if (seedCo?.linkedin && !company.linkedin) {
      company.linkedin = seedCo.linkedin;
      if (company.dataSources && seedCo.dataSources?.hiring) {
        company.dataSources.hiring = seedCo.dataSources.hiring;
      }
      migrated = true;
    }
    if (seedCo?.x && !company.x) {
      company.x = seedCo.x;
      if (company.dataSources && seedCo.dataSources?.x) {
        company.dataSources.x = seedCo.dataSources.x;
      }
      migrated = true;
    } else if (seedCo?.x && company.x?.handle !== seedCo.x.handle) {
      company.x = seedCo.x;
      if (company.dataSources && seedCo.dataSources?.x) {
        company.dataSources.x = seedCo.dataSources.x;
      }
      migrated = true;
    }
    if (seedCo?.productInsights && !company.productInsights) {
      company.productInsights = seedCo.productInsights;
      migrated = true;
    }
    if (seedCo?.products?.length && company.products?.length) {
      let productMigrated = false;
      for (const product of company.products) {
        const seedProduct = seedCo.products.find((p) => p.name === product.name);
        if (seedProduct?.description && !product.description) {
          product.description = seedProduct.description;
          product.maturity = seedProduct.maturity;
          productMigrated = true;
        }
      }
      if (productMigrated) migrated = true;
    }
  }

  if (migrated) saveStore();

  return store;
}

export function saveStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function getCompany(slug) {
  return loadStore().companies.find((c) => c.slug === slug);
}

export function refreshCompany(slug) {
  const data = loadStore();
  const company = data.companies.find((c) => c.slug === slug);
  if (!company) throw new Error('Company not found');

  const segments = company.revenueSegments || [];
  if (segments.length) {
    const i = Math.floor(Math.random() * segments.length);
    segments[i] = {
      ...segments[i],
      pct: Math.min(99, Math.max(1, segments[i].pct + (Math.random() > 0.5 ? 1 : -1))),
    };
  }

  const trend = company.searchMetrics?.trend || [];
  if (trend.length) {
    company.searchMetrics.trend = [
      ...trend.slice(1),
      Math.min(100, trend[trend.length - 1] + Math.floor(Math.random() * 4)),
    ];
  }

  company.refreshedAt = new Date().toISOString();
  data.usage.push({
    id: data.usage.length + 1,
    eventType: 'refresh',
    companySlug: slug,
    createdAt: new Date().toISOString(),
  });

  if (!data.benefit[slug]) {
    data.benefit[slug] = {
      views: 0,
      refreshes: 0,
      suggestionsAccepted: 0,
      researchHoursSaved: 0,
      validatedSignals: 0,
      highlights: [],
    };
  }
  data.benefit[slug].refreshes = (data.benefit[slug].refreshes || 0) + 1;

  saveStore();
  return company;
}
