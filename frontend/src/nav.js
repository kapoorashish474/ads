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
    id: 'executive',
    label: 'Executive',
    items: [{ to: '/brief', label: 'Brief', icon: 'brief', end: true }],
  },
  {
    id: 'intel',
    label: 'Market intel',
    items: [{ to: '/intel', label: 'Feed', icon: 'signals', end: true }],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [
      { to: '/suggestions', label: 'Suggestions', icon: 'suggestions' },
      { to: '/benefit', label: 'Benefit', icon: 'benefit', scope: 'corpus' },
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

export function pageScope(pathname) {
  for (const group of navGroups) {
    for (const item of group.items) {
      if (matchNavPath(pathname, item.to, item.end)) {
        return item.scope || 'company';
      }
    }
  }
  return 'company';
}

export function allNavItems() {
  return navGroups.flatMap((g) => g.items);
}
