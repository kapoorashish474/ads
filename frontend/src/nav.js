/** Which sections are visible while we polish one page at a time. */
export const NAV_FOCUS = {
  groups: ['reference', 'dashboard', 'planning', 'signals', 'search', 'social'],
  routes: ['/dashboard', '/sources', '/planning', '/signals', '/search', '/social'],
  hideReload: true,
};

const ALL_NAV_GROUPS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'overview', end: true },
      { to: '/revenue', label: 'Revenue', icon: 'revenue' },
      { to: '/products', label: 'Products', icon: 'products' },
    ],
  },
  {
    id: 'signals',
    label: 'Signals',
    items: [{ to: '/signals', label: 'Signals', icon: 'signals', end: true }],
  },
  {
    id: 'search',
    label: 'Search',
    items: [{ to: '/search', label: 'Search', icon: 'search', end: true }],
  },
  {
    id: 'social',
    label: 'Social',
    items: [{ to: '/social', label: 'Social', icon: 'social', end: true }],
  },
  {
    id: 'intel',
    label: 'Market intel',
    items: [
      { to: '/signals', label: 'Signals', icon: 'signals', end: true },
      { to: '/search', label: 'Search', icon: 'search', end: true },
      { to: '/social', label: 'Social', icon: 'social', end: true },
    ],
  },
  {
    id: 'planning',
    label: 'Planning',
    items: [{ to: '/planning', label: 'Planning', icon: 'suggestions', end: true }],
  },
  {
    id: 'reference',
    label: 'Sources',
    items: [{ to: '/sources', label: 'Data sources', icon: 'sources', end: true }],
  },
];

export function isNavRouteEnabled(path) {
  return NAV_FOCUS.routes.includes(path);
}

export const navGroups = ALL_NAV_GROUPS.filter((g) => NAV_FOCUS.groups.includes(g.id)).map((g) => ({
  ...g,
  items: g.items.filter((item) => NAV_FOCUS.routes.includes(item.to)),
}));

export function matchNavPath(pathname, to, end) {
  if (end) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function activeNavGroup(pathname) {
  return navGroups.find((g) => g.items.some((item) => matchNavPath(pathname, item.to, item.end))) || navGroups[0];
}

export function pageScope(pathname) {
  for (const group of ALL_NAV_GROUPS) {
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
