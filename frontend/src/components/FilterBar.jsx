export function FilterSelect({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`filter-field ${className}`.trim()}>
      <span className="filter-field__label">{label}</span>
      <select
        className="filter-field__control filter-field__control--select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterSearch({
  label = 'Search',
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
  inputClassName = '',
  ...props
}) {
  return (
    <label className={`filter-field filter-field--search ${className}`.trim()}>
      <span className="filter-field__label">{label}</span>
      <input
        type="search"
        className={`filter-field__control filter-field__control--search ${inputClassName}`.trim()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
}

export function FilterClear({ onClick, children = 'Clear filters', className = '' }) {
  return (
    <button type="button" className={`filter-bar__clear ${className}`.trim()} onClick={onClick}>
      {children}
    </button>
  );
}

export function FilterBar({ children, className = '', onClear, showClear = false }) {
  return (
    <div className={`filter-bar ${className}`.trim()} role="toolbar" aria-label="Filters">
      <div className="filter-bar__fields">{children}</div>
      {showClear && onClear && <FilterClear onClick={onClear} />}
    </div>
  );
}
