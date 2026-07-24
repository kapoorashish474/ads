import { useState } from 'react';
import { CollapseChevron } from './ui';

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
    <div className={`filter-bar ${open ? 'filter-bar--open' : 'filter-bar--closed'}`}>
      <button
        type="button"
        className="filter-bar__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="filter-bar__icon" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 6h16M7 12h10M10 18h4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="filter-bar__title">{title}</span>
        <span className="filter-bar__summary">
          {summary || (open ? 'Adjust filters below' : 'Click to show filters')}
        </span>
        <span className="collapse-control collapse-control--compact">
          <CollapseChevron open={open} />
        </span>
      </button>
      <div className={`filter-bar__collapse ${open ? 'filter-bar__collapse--open' : ''}`}>
        <div className="filter-bar__collapse-inner">
          <div className="filter-bar__body">{children}</div>
        </div>
      </div>
    </div>
  );
}
