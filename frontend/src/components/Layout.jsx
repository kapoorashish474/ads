import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { formatDate } from '../api';
import { activeNavGroup, matchNavPath, navGroups } from '../nav';

function NavGroup({ group, pathname, expanded, onToggle }) {
  const isActiveGroup = group.items.some((item) => matchNavPath(pathname, item.to, item.end));
  const isOpen = expanded[group.id] ?? isActiveGroup;

  return (
    <div className={`nav-group ${isActiveGroup ? 'nav-group--active' : ''}`}>
      <button
        type="button"
        className="nav-group__toggle"
        onClick={() => onToggle(group.id)}
        aria-expanded={isOpen}
      >
        <span>{group.label}</span>
        <span className="nav-group__chevron">{isOpen ? '▾' : '▸'}</span>
      </button>
      {isOpen && (
        <div className="nav-group__items">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav__link active' : 'nav__link')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { companies, slug, setSlug, data, refreshing, refresh, loading } = useCompany();
  const company = data?.company;
  const location = useLocation();
  const activeGroup = activeNavGroup(location.pathname);

  const [expanded, setExpanded] = useState(() => ({ [activeGroup.id]: true }));

  useEffect(() => {
    setExpanded((prev) => ({ ...prev, [activeGroup.id]: true }));
  }, [activeGroup.id]);

  function toggleGroup(id) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark">A</span>
          <div>
            <strong>Ads Research</strong>
            <span>Competitive intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav scroll-y" aria-label="Main navigation">
          {navGroups.map((group) => (
            <NavGroup
              key={group.id}
              group={group}
              pathname={location.pathname}
              expanded={expanded}
              onToggle={toggleGroup}
            />
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <label className="field">
              <span>Company</span>
              <select value={slug} onChange={(e) => setSlug(e.target.value)} disabled={loading}>
                {companies.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            {company && (
              <p className="meta">
                {company.type} · Updated {formatDate(company.refreshedAt)}
              </p>
            )}
          </div>
          <button type="button" className="btn" onClick={refresh} disabled={refreshing || loading}>
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
        </header>

        <div className="page-tabs scroll-x" role="tablist" aria-label={`${activeGroup.label} pages`}>
          {activeGroup.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'page-tab active' : 'page-tab')}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
