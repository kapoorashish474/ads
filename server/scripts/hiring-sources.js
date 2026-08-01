/** Public ATS endpoints for verified open-role ingestion. */

export const HIRING_SOURCES = {
  kargo: {
    type: 'kargo',
    careersUrl: 'https://www.kargo.com/careers',
    boardUrl: 'https://www.linkedin.com/company/kargo/jobs/',
  },
  'the-trade-desk': {
    type: 'greenhouse',
    token: 'thetradedesk',
    boardUrl: 'https://www.linkedin.com/company/the-trade-desk/jobs/',
  },
  stackadapt: {
    type: 'greenhouse',
    token: 'stackadapt',
    boardUrl: 'https://www.linkedin.com/company/stackadapt/jobs/',
  },
  magnite: {
    type: 'workday',
    host: 'https://osv-rubicon.wd5.myworkdayjobs.com',
    tenant: 'osv_rubicon',
    site: 'MagniteCareers',
    boardUrl: 'https://www.linkedin.com/company/magnite/jobs/',
  },
  'amazon-ads': {
    type: 'amazon-jobs',
    boardUrl: 'https://www.linkedin.com/jobs/search/?keywords=Amazon%20Ads&f_C=1586',
    searchParams: {
      'business_category[]': 'Advertising',
      primary_search_label: 'advertising.team-amazon-ads',
    },
  },
  criteo: {
    type: 'criteo-careers',
    careersUrl: 'https://careers.criteo.com/en/jobs/',
    boardUrl: 'https://www.linkedin.com/company/criteo/jobs/',
  },
};

export function inferRegion(location) {
  if (!location) return 'Unknown';
  const loc = location.trim();
  const lower = loc.toLowerCase();

  const rules = [
    { region: 'United States', re: /\b(united states|usa|u\.s\.|,\s*(al|ak|az|ar|ca|co|ct|de|fl|ga|hi|id|il|in|ia|ks|ky|la|me|md|ma|mi|mn|ms|mo|mt|ne|nv|nh|nj|nm|ny|nc|nd|oh|ok|or|pa|ri|sc|sd|tn|tx|ut|vt|va|wa|wv|wi|wy))\b/i },
    { region: 'Canada', re: /\b(canada|toronto|montreal|vancouver|ottawa|,\s*(on|qc|bc|ab|mb|sk|ns|nb))\b/i },
    { region: 'United Kingdom', re: /\b(united kingdom|england|london|uk\b)/i },
    { region: 'France', re: /\b(france|paris|grenoble|lyon)\b/i },
    { region: 'Germany', re: /\b(germany|berlin|munich|hamburg)\b/i },
    { region: 'India', re: /\b(india|bangalore|bengaluru|gurgaon|gurugram|hyderabad|mumbai|delhi)\b/i },
    { region: 'Japan', re: /\b(japan|tokyo|osaka)\b/i },
    { region: 'Australia', re: /\b(australia|sydney|melbourne|victoria|brisbane)\b/i },
    { region: 'Singapore', re: /\b(singapore)\b/i },
    { region: 'Spain', re: /\b(spain|barcelona|madrid)\b/i },
    { region: 'Netherlands', re: /\b(netherlands|amsterdam)\b/i },
    { region: 'APAC', re: /\b(apac|japac|asia pacific)\b/i },
    { region: 'EMEA', re: /\b(emea|europe)\b/i },
  ];

  for (const { region, re } of rules) {
    if (re.test(loc)) return region;
  }

  if (loc.includes(';')) return loc.split(';').map((p) => p.trim()).filter(Boolean)[0];
  if (loc.includes(',')) {
    const parts = loc.split(',').map((p) => p.trim());
    return parts[parts.length - 1];
  }
  return loc;
}

export function normalizeDepartment(raw, title = '') {
  const value = (raw || '').trim();
  const t = title.toLowerCase();

  if (value) {
    const primary = value.split(/\s[-–—]\s/)[0].trim();
    const map = {
      'Client Services': 'Customer Success',
      Commercial: 'Sales',
      'Internal IT': 'Engineering',
      People: 'Operations',
      Operations: 'Operations',
      Finance: 'Operations',
      Engineering: 'Engineering',
      Sales: 'Sales',
      Marketing: 'Marketing',
      Product: 'Product',
      'Product Marketing': 'Marketing',
      'Business Development': 'Business Development',
      'Customer Success': 'Customer Success',
      'Software Engineering': 'Engineering',
      'Data Science': 'Data',
      'Product Management': 'Product',
    };
    if (map[primary]) return map[primary];
    if (map[value]) return map[value];
    return primary;
  }

  if (/engineer|developer|software|scientist|architect|infrastructure|devops|sde\b|ml\b|data engineer/i.test(t)) {
    return 'Engineering';
  }
  if (/account executive|sales|account director|partner manager|business development/i.test(t)) {
    return 'Sales';
  }
  if (/product manager|product designer|product marketing/i.test(t)) {
    return 'Product';
  }
  if (/marketing|demand gen|brand/i.test(t)) {
    return 'Marketing';
  }
  if (/customer success|client services|account manager|account strategist|campaign manager/i.test(t)) {
    return 'Customer Success';
  }
  if (/operations|ad ops|recruiter|finance|legal|hr\b|people/i.test(t)) {
    return 'Operations';
  }
  if (/analyst|data/i.test(t)) {
    return 'Data';
  }
  return 'Other';
}

export function inferWorkplace(text) {
  const lower = (text || '').toLowerCase();
  if (/\bremote\b/.test(lower)) return 'Remote';
  if (/\bon[- ]site\b/.test(lower)) return 'On-site';
  if (/\bhybrid\b/.test(lower)) return 'Hybrid';
  return null;
}

export function toIsoDate(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
