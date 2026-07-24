import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { formatDate } from '../api';
import { activeNavGroup, matchNavPath, navGroups } from '../nav';
import CompareModeBar from './CompareModeBar';
import { NavIcon } from './NavIcon';

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
        <span className="nav-group__chevron" aria-hidden>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      <div className="nav-group__items">
        <div className="nav-group__items-inner">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav__link active' : 'nav__link')}
            >
              <span className="nav__icon" aria-hidden>
                <NavIcon name={item.icon} variant="sidebar" />
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { companies, slug, setSlug, data, refreshing, refresh, loading, compareMode, setCompareMode } = useCompany();
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
          <span className="brand__mark" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 18V6l8-3 8 3v12l-8 3-8-3Z" stroke="currentColor" strokeWidth="1.75" />
              <path d="M12 3v18M4 6l8 3 8-3" stroke="currentColor" strokeWidth="1.75" />
            </svg>
          </span>
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
          <button type="button" className="btn btn--primary" onClick={refresh} disabled={refreshing || loading}>
            <span className={`btn__icon ${refreshing ? 'btn__icon--spin' : ''}`} aria-hidden>↻</span>
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </button>
        </header>

        <div className="page-tabs scroll-x" role="tablist" aria-label={`${activeGroup.label} pages`}>
          <div className="page-tabs__inner">
            <div className="page-tabs__track">
              {activeGroup.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'page-tab active' : 'page-tab')}
                >
                  {item.icon && (
                    <span className="page-tab__icon" aria-hidden>
                      <NavIcon name={item.icon} variant="tab" />
                    </span>
                  )}
                  <span className="page-tab__label">{item.label}</span>
                </NavLink>
              ))}
            </div>
            {activeGroup.id === 'intel' && (
              <CompareModeBar
                compareMode={compareMode}
                onChange={setCompareMode}
                peerCount={data?.peers?.length || 0}
              />
            )}
          </div>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
