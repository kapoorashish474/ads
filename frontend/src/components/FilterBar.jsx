export function FilterSelect({ label, value, onChange, options, className = '' }) {
  return (
    <label className={`filter-select ${className}`.trim()}>
      <span className="filter-select__label">{label}</span>
      <select className="filter-select__input" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ children, className = '' }) {
  return <div className={`filter-toolbar ${className}`.trim()}>{children}</div>;
}
