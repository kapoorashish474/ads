/** LinkedIn company profiles and hiring link builders (company-scoped, not generic search). */

export const linkedinProfiles = {
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
    linkedinCompanyId: '1586',
    searchKeyword: 'Amazon Ads',
  },
  criteo: {
    companyUrl: 'https://www.linkedin.com/company/criteo/',
    jobsUrl: 'https://careers.criteo.com/en/jobs/',
    handle: 'criteo',
  },
};

export function buildHiringLinks(job, companyName, profile) {
  const jobsUrl = profile?.jobsUrl || profile?.companyUrl || 'https://www.linkedin.com/jobs/';
  const role = job.title.split(',')[0].trim();
  const scopedKeyword = profile?.searchKeyword || `${role} ${companyName}`;

  const params = new URLSearchParams({
    keywords: scopedKeyword,
    location: job.location,
  });
  if (profile?.linkedinCompanyId) {
    params.set('f_C', profile.linkedinCompanyId);
  }

  return {
    linkedin_company_url: jobsUrl,
    source_url: jobsUrl,
    linkedin_search_url: `https://www.linkedin.com/jobs/search/?${params.toString()}`,
  };
}

export function enrichHiringRecord(job, companyName, id) {
  const profile = linkedinProfiles[job.company_slug];
  const links = buildHiringLinks(job, companyName, profile);
  const listingUrl = job.source_url && !job.source_url.includes('linkedin.com/jobs/search')
    ? job.source_url
    : links.source_url;

  return {
    id,
    ...job,
    company_name: companyName,
    source: job.source || 'careers',
    source_name: job.source_name || 'Company careers · verified listing',
    confidence: job.confidence || 'reported',
    linkedin_company_url: links.linkedin_company_url,
    source_url: listingUrl,
    linkedin_search_url: links.linkedin_search_url,
  };
}
