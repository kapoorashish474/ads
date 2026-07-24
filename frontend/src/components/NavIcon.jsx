const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
};

const icons = {
  overview: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="1.5" {...stroke} />
      <rect x="13" y="3" width="8" height="5" rx="1.5" {...stroke} />
      <rect x="13" y="10" width="8" height="11" rx="1.5" {...stroke} />
      <rect x="3" y="13" width="8" height="8" rx="1.5" {...stroke} />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6" {...stroke} />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" {...stroke} />
      <path d="M12 12 4 8M12 12l8-4M12 12v9" {...stroke} />
    </svg>
  ),
  signals: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8Z" {...stroke} />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="11" cy="11" r="6" {...stroke} />
      <path d="m16 16 5 5" {...stroke} />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" {...stroke} />
      <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4" {...stroke} />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 4l16 16M20 4 4 20" {...stroke} strokeWidth="2" />
    </svg>
  ),
  suggestions: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10c.6.5 1 1.2 1 2h6c0-.8.4-1.5 1-2a6 6 0 0 0-4-10Z" {...stroke} />
    </svg>
  ),
  benefit: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M4 18V8l8-4 8 4v10" {...stroke} />
      <path d="M9 14l2 2 4-4" {...stroke} />
    </svg>
  ),
  sources: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8l-6-6Z" {...stroke} />
      <path d="M14 2v6h6" {...stroke} />
    </svg>
  ),
};

export function NavIcon({ name, variant = 'sidebar' }) {
  const icon = icons[name];
  if (!icon) return null;
  return <span className={`nav-icon nav-icon--${variant}`}>{icon}</span>;
}

export default NavIcon;
