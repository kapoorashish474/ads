export default function IntelCompareTable({ rows, columns, focusSlug, valueLabel = 'Count' }) {
  return (
    <div className="table-wrap table-wrap--flat">
      <table className="table table--compact intel-compare">
        <thead>
          <tr>
            <th>Company</th>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            <th>{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className={row.slug === focusSlug ? 'row--focus' : ''}>
              <td className="intel-compare__name">{row.name}</td>
              {columns.map((col) => (
                <td key={col.key}>{row.breakdown?.[col.key] ?? 0}</td>
              ))}
              <td>
                <strong>{row.count}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
