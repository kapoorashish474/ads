import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.join(__dirname, '../data/store.json');
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const linkedinProfiles = {
  kargo: {
    companyUrl: 'https://www.linkedin.com/company/kargo/',
    jobsUrl: 'https://www.linkedin.com/company/kargo/jobs/',
    handle: 'kargo',
  },
  'the-trade-desk': {
    companyUrl: 'https://www.linkedin.com/company/the-trade-desk/',
    jobsUrl: 'https://www.linkedin.com/company/the-trade-desk/jobs/',
    handle: 'the-trade-desk',
  },
  stackadapt: {
    companyUrl: 'https://www.linkedin.com/company/stackadapt/',
    jobsUrl: 'https://www.linkedin.com/company/stackadapt/jobs/',
    handle: 'stackadapt',
  },
  magnite: {
    companyUrl: 'https://www.linkedin.com/company/magnite/',
    jobsUrl: 'https://www.linkedin.com/company/magnite/jobs/',
    handle: 'magnite',
  },
  'amazon-ads': {
    companyUrl: 'https://www.linkedin.com/company/amazon/',
    jobsUrl: 'https://www.linkedin.com/jobs/search/?keywords=Amazon%20Ads&f_C=1586',
    handle: 'amazon',
  },
  criteo: {
    companyUrl: 'https://www.linkedin.com/company/criteo/',
    jobsUrl: 'https://www.linkedin.com/company/criteo/jobs/',
    handle: 'criteo',
  },
};

const jobs = [
  { company_slug: 'kargo', title: 'Senior Software Engineer, CTV Platform', department: 'Engineering', location: 'New York, NY', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-18' },
  { company_slug: 'kargo', title: 'Account Executive, Enterprise', department: 'Sales', location: 'Chicago, IL', region: 'United States', workplace: 'Remote', posted_at: '2026-07-12' },
  { company_slug: 'kargo', title: 'Product Manager, High-Impact Formats', department: 'Product', location: 'London, UK', region: 'United Kingdom', workplace: 'Hybrid', posted_at: '2026-07-08' },
  { company_slug: 'kargo', title: 'Ad Operations Specialist', department: 'Operations', location: 'New York, NY', region: 'United States', workplace: 'On-site', posted_at: '2026-06-30' },
  { company_slug: 'the-trade-desk', title: 'Staff Engineer, Kokai Bidding', department: 'Engineering', location: 'Ventura, CA', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-20' },
  { company_slug: 'the-trade-desk', title: 'Director, CTV Partnerships', department: 'Business Development', location: 'New York, NY', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-14' },
  { company_slug: 'the-trade-desk', title: 'Solutions Consultant, EMEA', department: 'Sales', location: 'London, UK', region: 'United Kingdom', workplace: 'Hybrid', posted_at: '2026-07-05' },
  { company_slug: 'the-trade-desk', title: 'Data Scientist, Identity', department: 'Data', location: 'Seattle, WA', region: 'United States', workplace: 'Remote', posted_at: '2026-06-28' },
  { company_slug: 'stackadapt', title: 'Software Developer, CTV', department: 'Engineering', location: 'Toronto, ON', region: 'Canada', workplace: 'Hybrid', posted_at: '2026-07-19' },
  { company_slug: 'stackadapt', title: 'Customer Success Manager', department: 'Customer Success', location: 'Toronto, ON', region: 'Canada', workplace: 'Hybrid', posted_at: '2026-07-10' },
  { company_slug: 'stackadapt', title: 'Marketing Manager, Demand Gen', department: 'Marketing', location: 'New York, NY', region: 'United States', workplace: 'Remote', posted_at: '2026-07-02' },
  { company_slug: 'magnite', title: 'Engineering Manager, Streaming SSP', department: 'Engineering', location: 'New York, NY', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-17' },
  { company_slug: 'magnite', title: 'Publisher Account Director', department: 'Sales', location: 'Los Angeles, CA', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-11' },
  { company_slug: 'magnite', title: 'Product Marketing Lead, CTV', department: 'Marketing', location: 'London, UK', region: 'EMEA', workplace: 'Remote', posted_at: '2026-06-25' },
  { company_slug: 'amazon-ads', title: 'Senior Product Manager, Amazon DSP', department: 'Product', location: 'Seattle, WA', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-21' },
  { company_slug: 'amazon-ads', title: 'Applied Scientist, Ads ML', department: 'Engineering', location: 'New York, NY', region: 'United States', workplace: 'On-site', posted_at: '2026-07-15' },
  { company_slug: 'amazon-ads', title: 'Account Executive, Retail Media', department: 'Sales', location: 'London, UK', region: 'Europe', workplace: 'Hybrid', posted_at: '2026-07-06' },
  { company_slug: 'amazon-ads', title: 'Software Development Engineer, Sponsored Products', department: 'Engineering', location: 'Bangalore, India', region: 'India', workplace: 'Hybrid', posted_at: '2026-06-22' },
  { company_slug: 'criteo', title: 'Backend Engineer, Commerce Max', department: 'Engineering', location: 'Paris, France', region: 'France', workplace: 'Hybrid', posted_at: '2026-07-16' },
  { company_slug: 'criteo', title: 'Partner Manager, Retail Media', department: 'Business Development', location: 'New York, NY', region: 'United States', workplace: 'Hybrid', posted_at: '2026-07-09' },
  { company_slug: 'criteo', title: 'Data Analyst, Retail Insights', department: 'Data', location: 'Tokyo, Japan', region: 'Japan', workplace: 'Hybrid', posted_at: '2026-06-18' },
];

const nameMap = Object.fromEntries(store.companies.map((c) => [c.slug, c.name]));

store.hiring = jobs.map((job, i) => {
  const profile = linkedinProfiles[job.company_slug];
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title.split(',')[0])}&location=${encodeURIComponent(job.location)}`;
  return {
    id: i + 1,
    ...job,
    company_name: nameMap[job.company_slug],
    source: 'linkedin',
    source_name: 'LinkedIn · public job listing',
    confidence: 'reported',
    linkedin_company_url: profile?.jobsUrl,
    source_url: searchUrl,
  };
});

for (const company of store.companies) {
  const profile = linkedinProfiles[company.slug];
  if (profile) {
    company.linkedin = profile;
    if (company.dataSources) {
      company.dataSources.hiring = {
        label: 'LinkedIn public job listings & company careers pages',
        confidence: 'reported',
        url: profile.jobsUrl,
        asOf: '2026-07',
      };
    }
  }
}

store.hiringPolicy =
  'Open roles sourced from public LinkedIn job listings. Links open LinkedIn search or company jobs pages — no private data.';

fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
console.log(`Added ${store.hiring.length} hiring records`);
