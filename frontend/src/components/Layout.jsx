import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useCompany } from '../context/CompanyContext';
import { activeNavGroup, matchNavPath, navGroups, pageScope, NAV_FOCUS } from '../nav';
import { NavIcon } from './NavIcon';
import CompanyPicker from './CompanyPicker';

function NavGroup({ group, pathname, expanded, onToggle }) {
  const isActiveGroup = group.items.some((item) => matchNavPath(pathname, item.to, item.end));
  const isOpen = expanded[group.id] ?? false;
  const activeItem = group.items.find((item) => matchNavPath(pathname, item.to, item.end));

  return (
    <div
      className={`nav-group ${isActiveGroup ? 'nav-group--active' : ''} ${isOpen ? 'nav-group--open' : 'nav-group--closed'}`}
    >
      <button
        type="button"
        className="nav-group__toggle"
        onClick={() => onToggle(group.id)}
        aria-expanded={isOpen}
      >
        <span className="nav-group__toggle-text">
          <span>{group.label}</span>
          {activeItem && !isOpen && (
            <span className="nav-group__active-hint">{activeItem.label}</span>
          )}
        </span>
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
  const { companies, slug, data, refreshing, refresh, loading } = useCompany();
  const location = useLocation();
  const activeGroup = activeNavGroup(location.pathname);
  const isCorpusPage = pageScope(location.pathname) === 'corpus';
  const activePage = activeGroup.items.find((item) => matchNavPath(location.pathname, item.to, item.end));
  const pageLabel = activePage?.label || activeGroup.label;
  const isSwitching = loading && Boolean(data);
  const activeCompany = companies.find((c) => c.slug === slug);

  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(navGroups.map((g) => [g.id, false]))
  );

  useEffect(() => {
    setExpanded((prev) => ({
      ...prev,
      [activeGroup.id]: true,
    }));
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

        {!isCorpusPage && <CompanyPicker />}

        <nav className="sidebar-nav scroll-y" aria-label="Main navigation">
          {navGroups.map((group) =>
            group.items.length === 1 ? (
              <NavLink
                key={group.items[0].to}
                to={group.items[0].to}
                end={group.items[0].end}
                className={({ isActive }) => (isActive ? 'nav__link nav__link--solo active' : 'nav__link nav__link--solo')}
              >
                <span className="nav__icon" aria-hidden>
                  <NavIcon name={group.items[0].icon} variant="sidebar" />
                </span>
                {group.label}
              </NavLink>
            ) : (
              <NavGroup
                key={group.id}
                group={group}
                pathname={location.pathname}
                expanded={expanded}
                onToggle={toggleGroup}
              />
            )
          )}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar__title">
            <h1 className="topbar__heading">{pageLabel}</h1>
            {!isCorpusPage && activeCompany && (
              <p className="topbar__context">{activeCompany.name}</p>
            )}
            {isCorpusPage && (
              <p className="topbar__context">All companies · shared research depth</p>
            )}
          </div>
          {!isCorpusPage && !NAV_FOCUS.hideReload && (
            <button type="button" className="btn btn--primary topbar__reload" onClick={refresh} disabled={refreshing || loading}>
              <span className={`btn__icon ${refreshing ? 'btn__icon--spin' : ''}`} aria-hidden>↻</span>
              {refreshing ? 'Reloading…' : 'Reload snapshot'}
            </button>
          )}
        </header>

        {activeGroup.items.length > 1 && activeGroup.id !== 'intel' && (
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
          </div>
        </div>
        )}

        <div className={`content ${isSwitching ? 'content--switching' : ''}`}>
          {isSwitching && (
            <div className="content-switch" role="status" aria-live="polite">
              <span className="spinner" aria-hidden />
              Updating for {activeCompany?.name || slug}…
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
