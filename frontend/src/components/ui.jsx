import { useState } from 'react';

export function CollapseChevron({ open }) {
  return (
    <span className={`collapse-chevron ${open ? 'collapse-chevron--open' : ''}`} aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Card({
  title,
  subtitle,
  children,
  className = '',
  collapsible = false,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const headContent = (
    <>
      <div className="card__head-text">
        {title && <h3>{title}</h3>}
        {subtitle && <p>{subtitle}</p>}
      </div>
      {collapsible && (
        <span className="collapse-control">
          <span className="collapse-control__label">{open ? 'Collapse' : 'Expand'}</span>
          <CollapseChevron open={open} />
        </span>
      )}
    </>
  );

  return (
    <section
      className={`card ${collapsible ? 'card--collapsible' : ''} ${collapsible && !open ? 'card--collapsed' : ''} ${className}`}
    >
      {collapsible ? (
        <button
          type="button"
          className="card__head card__head--toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {headContent}
        </button>
      ) : (
        (title || subtitle) && <header className="card__head">{headContent}</header>
      )}

      {collapsible ? (
        <div className={`card__collapse ${open ? 'card__collapse--open' : ''}`}>
          <div className="card__collapse-inner">
            <div className="card__body">{children}</div>
          </div>
        </div>
      ) : (
        <div className="card__body">{children}</div>
      )}
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
  return (
    <div className="state state--loading">
      <span className="spinner" aria-hidden />
      <span>Loading intelligence…</span>
    </div>
  );
}

export function ErrorState({ message }) {
  return <div className="state state--error">{message}</div>;
}

export function Empty({ message = 'No data yet.' }) {
  return <div className="state state--empty">{message}</div>;
}
