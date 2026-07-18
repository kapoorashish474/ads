import { NavLink, Outlet } from 'react-router-dom'
import './Layout.css'

const links = [
  { to: '/', label: 'Radar', end: true },
  { to: '/quarters', label: 'Quarters' },
  { to: '/scope', label: 'Scope' },
  { to: '/learnings', label: 'Playbooks' },
  { to: '/opportunities', label: 'Moves' },
  { to: '/competitors', label: 'Peers' },
  { to: '/signals', label: 'Signals' },
  { to: '/sources', label: 'Sources' },
]

export default function Layout() {
  return (
    <div className="shell">
      <div className="shell__glow" aria-hidden="true" />
      <header className="topbar">
        <div className="brand">
          <span className="brand__mark">K</span>
          <div className="brand__text">
            <strong>Kargo Intel</strong>
            <span>Public competitive radar</span>
          </div>
        </div>
        <nav className="nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar__meta">
          <span className="live-dot" />
          Public only
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
