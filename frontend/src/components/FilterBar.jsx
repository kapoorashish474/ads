import { useState } from 'react';

export function FilterRow({ label, children }) {
  return (
    <div className="filter-row">
      {label && <span className="filters__label">{label}</span>}
      <div className="filter-row__chips scroll-x">{children}</div>
    </div>
  );
}

export function FilterBar({ title = 'Filters', defaultOpen = true, summary, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`filter-bar ${open ? 'filter-bar--open' : ''}`}>
      <button type="button" className="filter-bar__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="filter-bar__title">{title}</span>
        {!open && summary && <span className="filter-bar__summary">{summary}</span>}
        <span className="filter-bar__chevron" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="filter-bar__body">{children}</div>}
    </div>
  );
}
