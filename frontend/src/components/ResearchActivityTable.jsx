import { Link } from 'react-router-dom';
import { SourceFootnote } from './Source';

export default function ResearchActivityTable({ rows, asOfLabel }) {
  if (!rows?.length) return null;

  const hasAnyResearch = rows.some((row) => row.total > 0);

  return (
    <div className="research-activity">
      {!hasAnyResearch && (
        <p className="research-activity__empty muted">
          No dated signals, roles, or posts for this company in the corpus yet.
        </p>
      )}

      <div className="table-wrap research-activity__table-wrap">
        <table className="table table--compact table--research-activity">
          <colgroup>
            <col className="col-window" />
            <col className="col-focus" />
            <col className="col-research" />
          </colgroup>
          <thead>
            <tr>
              <th>Window</th>
              <th>Where they were busy</th>
              <th>Research tracked</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.months}>
                <td className="research-activity__window">
                  <strong>{row.label}</strong>
                  {asOfLabel && <span className="research-activity__through">through {asOfLabel}</span>}
                </td>
                <td className="research-activity__focus">{row.focus}</td>
                <td className="research-activity__counts">
                  <strong>{row.total}</strong>
                  {row.breakdown !== '—' && (
                    <span className="research-activity__breakdown">{row.breakdown}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="research-activity__footer">
        <SourceFootnote
          source={{
            label: 'Inferred from dated signals, LinkedIn roles, and X posts in the corpus',
            confidence: 'inferred',
            asOf: asOfLabel,
          }}
        />
        <Link to="/signals" className="research-activity__link">
          View signal feed →
        </Link>
      </footer>
    </div>
  );
}
