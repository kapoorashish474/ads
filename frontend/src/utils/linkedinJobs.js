export function hiringBoardUrl(job) {
  return job.linkedin_company_url || job.source_url;
}

export function hiringListingUrl(job) {
  return job.source_url || job.linkedin_company_url;
}

export function hiringSearchUrl(job) {
  return job.linkedin_search_url || hiringBoardUrl(job);
}
