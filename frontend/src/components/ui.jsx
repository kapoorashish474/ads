import { useState } from 'react';

export function Card({
  title,
  subtitle,
  children,
  className = '',
  collapsible = false,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={`card ${collapsible && !open ? 'card--collapsed' : ''} ${className}`}>
      {(title || subtitle) && (
        <header className={`card__head ${collapsible ? 'card__head--toggle' : ''}`}>
          <div className="card__head-text">
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {collapsible && (
            <button
              type="button"
              className="card__toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? 'Collapse section' : 'Expand section'}
            >
              {open ? '−' : '+'}
            </button>
          )}
        </header>
      )}
      {(!collapsible || open) && <div className="card__body">{children}</div>}
    </section>
  );
}

export function Stat({ label, value, hint, source }) {
  return (
    <div className="stat">
      <span className="stat__label">{label}</span>
      <strong className="stat__value">{value}</strong>
      {hint && <span className="stat__hint">{hint}</span>}
      {source && (
        <span className="stat__source">
          {source.confidence && <span className={`pill pill--conf-${source.confidence}`}>{source.confidence}</span>}
        </span>
      )}
    </div>
  );
}

export function Pill({ tone = 'default', children }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

export function Loading() {
  return <div className="state">Loading…</div>;
}

export function ErrorState({ message }) {
  return <div className="state state--error">{message}</div>;
}

export function Empty({ message = 'No data yet.' }) {
  return <div className="state state--empty">{message}</div>;
}
