export const navGroups = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { to: '/', label: 'Overview', icon: 'overview', end: true },
      { to: '/revenue', label: 'Revenue', icon: 'revenue' },
      { to: '/products', label: 'Products', icon: 'products' },
    ],
  },
  {
    id: 'intel',
    label: 'Market intel',
    items: [
      { to: '/signals', label: 'Signals', icon: 'signals' },
      { to: '/search', label: 'Search', icon: 'search' },
      { to: '/linkedin', label: 'LinkedIn', icon: 'linkedin' },
      { to: '/x', label: 'X', icon: 'x' },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { to: '/suggestions', label: 'Suggestions', icon: 'suggestions' },
      { to: '/benefit', label: 'Benefit', icon: 'benefit' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    items: [{ to: '/sources', label: 'Sources', icon: 'sources' }],
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
