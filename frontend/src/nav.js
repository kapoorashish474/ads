export const navGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { to: '/', label: 'Overview', end: true },
      { to: '/revenue', label: 'Revenue' },
      { to: '/products', label: 'Products' },
    ],
  },
  {
    id: 'intel',
    label: 'Market intel',
    items: [
      { to: '/signals', label: 'Signals' },
      { to: '/search', label: 'Search' },
      { to: '/linkedin', label: 'LinkedIn' },
      { to: '/x', label: 'X' },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { to: '/suggestions', label: 'Suggestions' },
      { to: '/benefit', label: 'Benefit' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: [{ to: '/sources', label: 'Sources' }],
  },
];

export function matchNavPath(pathname, to, end) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function activeNavGroup(pathname) {
  return navGroups.find((g) => g.items.some((item) => matchNavPath(pathname, item.to, item.end))) || navGroups[0];
}

export function allNavItems() {
  return navGroups.flatMap((g) => g.items);
}
