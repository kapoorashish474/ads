import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { linkedinProfiles } from './linkedin-hiring-links.js';
import {
  HIRING_SOURCES,
  inferRegion,
  normalizeDepartment,
  inferWorkplace,
  toIsoDate,
} from './hiring-sources.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');

const VERIFIED_AT = new Date().toISOString().slice(0, 10);

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ads-research/1.0 (+https://github.com/kapoorashish474/ads)',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${url} → HTTP ${res.status}`);
  }
  return res.json();
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'text/html,application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; ads-research/1.0)',
    },
  });
  if (!res.ok) {
    throw new Error(`${url} → HTTP ${res.status}`);
  }
  return res.text();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function baseJob(companySlug, fields) {
  return {
    company_slug: companySlug,
    confidence: 'reported',
    source: 'careers',
    verified_at: VERIFIED_AT,
    ...fields,
  };
}

async function fetchGreenhouse(companySlug, token) {
  const data = await fetchJson(`https://boards-api.greenhouse.io/v1/boards/${token}/jobs?content=true`);
  return (data.jobs || []).map((job) => {
    const category =
      job.metadata?.find((m) => m.name === 'Careers Site Category')?.value ||
      job.departments?.[0]?.name ||
      null;
    const workplace = inferWorkplace(job.content || job.location?.name || '');
    return baseJob(companySlug, {
      title: job.title.trim(),
      department: normalizeDepartment(category, job.title),
      location: job.location?.name || 'Unknown',
      region: inferRegion(job.location?.name || ''),
      workplace: workplace || 'Not specified',
      posted_at: toIsoDate(job.first_published || job.updated_at),
      source_url: job.absolute_url,
      source_name: 'Greenhouse · company careers',
      external_id: String(job.id),
    });
  });
}

async function fetchWorkday(companySlug, { host, tenant, site }) {
  const jobs = [];
  let offset = 0;
  const limit = 20;

  while (true) {
    const data = await fetchJson(`${host}/wday/cxs/${tenant}/${site}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appliedFacets: {}, limit, offset, searchText: '' }),
    });

    const batch = data.jobPostings || [];
    for (const job of batch) {
      const externalPath = job.externalPath || '';
      jobs.push(
        baseJob(companySlug, {
          title: job.title.trim(),
          department: normalizeDepartment(null, job.title),
          location: job.locationsText || 'Unknown',
          region: inferRegion(job.locationsText || ''),
          workplace: 'Not specified',
          posted_at: VERIFIED_AT,
          source_url: `${host}/en-US${externalPath}`,
          source_name: 'Workday · company careers',
          external_id: externalPath.split('_').pop() || externalPath,
        })
      );
    }

    if (batch.length < limit) break;
    offset += limit;
    await sleep(250);
  }

  return jobs;
}

async function fetchKargo(companySlug) {
  const html = await fetchText(HIRING_SOURCES.kargo.careersUrl);
  const cardRe =
    /href="\/careers\/(\d+)"[^>]*>\s*<span[^>]*job-title[^>]*>([^<]+)<\/span>\s*<span[^>]*department[^>]*>([^<]+)<\/span>\s*<span[^>]*location[^>]*>([^<]+)<\/span>/g;

  const jobs = new Map();
  let match;
  while ((match = cardRe.exec(html))) {
    const [, id, title, department, location] = match;
    jobs.set(id, baseJob(companySlug, {
      title: title.trim(),
      department: normalizeDepartment(department, title),
      location: location.trim(),
      region: inferRegion(location),
      workplace: 'Not specified',
      posted_at: VERIFIED_AT,
      source_url: `https://www.kargo.com/careers/${id}`,
      source_name: 'Kargo · careers site',
      external_id: id,
    }));
  }

  if (!jobs.size) {
    throw new Error('No Kargo listings parsed from careers page');
  }
  return [...jobs.values()];
}

async function fetchAmazonAds(companySlug) {
  const jobs = [];
  const pageSize = 100;
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const params = new URLSearchParams({
      offset: String(offset),
      result_limit: String(pageSize),
      ...HIRING_SOURCES['amazon-ads'].searchParams,
    });
    const data = await fetchJson(`https://www.amazon.jobs/en/search.json?${params.toString()}`);
    total = data.hits ?? 0;
    const batch = data.jobs || [];

    for (const job of batch) {
      const location = job.location || job.normalized_location || 'Unknown';
      jobs.push(
        baseJob(companySlug, {
          title: job.title.trim(),
          department: normalizeDepartment(job.job_category || job.team?.label, job.title),
          location,
          region: inferRegion(location),
          workplace: /remote/i.test(job.description || '') ? 'Remote' : 'Not specified',
          posted_at: toIsoDate(job.posted_date) || VERIFIED_AT,
          source_url: `https://www.amazon.jobs${job.job_path}`,
          source_name: 'Amazon Jobs · Amazon Ads team',
          external_id: job.id_icims || job.id,
        })
      );
    }

    if (!batch.length) break;
    offset += batch.length;
    await sleep(200);
  }

  return jobs;
}

async function fetchCriteo() {
  throw new Error(
    'Criteo careers site blocks automated ingest (Cloudflare). View live listings at https://careers.criteo.com/en/jobs/'
  );
}

function attachBoardLinks(job, companyName, profile) {
  const boardUrl = profile?.jobsUrl || HIRING_SOURCES[job.company_slug]?.boardUrl || job.source_url;
  const role = job.title.split(',')[0].trim();
  const scopedKeyword = profile?.searchKeyword || `${role} ${companyName}`;
  const params = new URLSearchParams({ keywords: scopedKeyword, location: job.location });
  if (profile?.linkedinCompanyId) params.set('f_C', profile.linkedinCompanyId);

  return {
    ...job,
    company_name: companyName,
    linkedin_company_url: boardUrl,
    linkedin_search_url: `https://www.linkedin.com/jobs/search/?${params.toString()}`,
  };
}

async function fetchCompanyJobs(companySlug) {
  const source = HIRING_SOURCES[companySlug];
  if (!source) throw new Error(`No hiring source configured for ${companySlug}`);

  switch (source.type) {
    case 'greenhouse':
      return fetchGreenhouse(companySlug, source.token);
    case 'workday':
      return fetchWorkday(companySlug, source);
    case 'kargo':
      return fetchKargo(companySlug);
    case 'amazon-jobs':
      return fetchAmazonAds(companySlug);
    case 'criteo-careers':
      return fetchCriteo();
    default:
      throw new Error(`Unsupported hiring source type: ${source.type}`);
  }
}

function updateCompanySources(store, counts) {
  for (const company of store.companies) {
    const profile = linkedinProfiles[company.slug];
    const source = HIRING_SOURCES[company.slug];
    if (profile) company.linkedin = profile;

    if (company.dataSources) {
      const count = counts[company.slug] || 0;
      const ingestNote = store.hiringIngestNotes?.[company.slug];
      company.dataSources.hiring = {
        label: count
          ? `${count} verified open roles from company careers pages`
          : 'Live listings on company careers site (automated ingest unavailable)',
        confidence: count ? 'reported' : 'reported',
        url: source?.careersUrl || source?.boardUrl || profile?.jobsUrl || null,
        asOf: VERIFIED_AT,
        category: 'Market intel',
        tab: 'LinkedIn',
        note:
          ingestNote ||
          'Live listings ingested from public ATS feeds (Greenhouse, Workday, Amazon Jobs, or company careers site).',
      };
    }
    company.refreshedAt = new Date().toISOString();
  }
}

function updateBenefitCoverage(store, counts) {
  const values = Object.values(counts);
  const avgRoles = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const corpusTotal = values.reduce((a, b) => a + b, 0);

  if (store.benefitCorpus?.researchCoverage) {
    store.benefitCorpus.researchCoverage.hiringRoles = avgRoles;
  }

  if (store.benefit && typeof store.benefit === 'object') {
    for (const slug of Object.keys(store.benefit)) {
      const row = counts[slug] || 0;
      if (store.benefit[slug]?.researchCoverage) {
        store.benefit[slug].researchCoverage.hiringRoles = row;
      }
      const hiringRow = store.benefit[slug]?.timeBreakdown?.find((r) => /hiring/i.test(r.task));
      if (hiringRow) {
        hiringRow.hours = Math.max(1, Math.round(row * 0.35));
        hiringRow.note = `${row} verified open roles`;
      }
    }
  }

  store.hiringCorpus = {
    verifiedAt: VERIFIED_AT,
    totalRoles: corpusTotal,
    perCompany: counts,
  };
}

async function main() {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
  const nameMap = Object.fromEntries(store.companies.map((c) => [c.slug, c.name]));
  const allJobs = [];
  const counts = {};
  const errors = [];

  for (const company of store.companies) {
    const slug = company.slug;
    try {
      const rows = await fetchCompanyJobs(slug);
      counts[slug] = rows.length;
      rows.forEach((job) => {
        allJobs.push(attachBoardLinks(job, nameMap[slug], linkedinProfiles[slug]));
      });
      console.log(`✓ ${slug.padEnd(16)} ${rows.length} verified roles`);
    } catch (err) {
      errors.push({ slug, message: err.message });
      counts[slug] = 0;
      console.warn(`✗ ${slug.padEnd(16)} ${err.message}`);
    }
  }

  if (errors.length) {
    store.hiringIngestNotes = Object.fromEntries(errors.map((e) => [e.slug, e.message]));
  } else {
    delete store.hiringIngestNotes;
  }

  if (!allJobs.length) {
    console.error('No verified hiring data fetched — store left unchanged.');
    process.exit(1);
  }

  allJobs.sort((a, b) => (b.posted_at || '').localeCompare(a.posted_at || ''));

  store.hiring = allJobs.map((job, i) => ({ id: i + 1, ...job }));
  store.hiringPolicy =
    'Open roles are live listings ingested from each company’s public careers feed (Greenhouse, Workday, Amazon Jobs, or careers site). Each row links to the verified posting URL. Counts and regions reflect current listings — re-run `node server/scripts/fetch-verified-hiring.js` to refresh.';

  updateCompanySources(store, counts);
  updateBenefitCoverage(store, counts);

  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));

  console.log(`\nStored ${store.hiring.length} verified roles (${VERIFIED_AT})`);
  if (errors.length) {
    console.warn('\nPartial ingest — fix these sources and re-run:');
    errors.forEach((e) => console.warn(`  ${e.slug}: ${e.message}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
