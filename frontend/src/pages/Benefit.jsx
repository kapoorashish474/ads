import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loading, ErrorState, Empty } from '../components/ui';
import { api } from '../api';

export default function Benefit() {
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .benefitCorpus()
      .then(setBenefit)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;

  const corpus = benefit?.corpus || {};
  const breakdown = corpus.timeBreakdown || [];
  const hours = corpus.researchBaselineHours || 0;
  const includes = corpus.includes || [];

  return (
    <div className="page page--benefit">
      <header className="benefit-header">
        <h1>Benefit</h1>
        <p className="benefit-header__lede">
          <strong className="benefit-header__hours">~{hours}h</strong> of manual competitive research
          included for <em>every</em> company in the watch list — not per-company totals.
        </p>
      </header>

      <section className="benefit-section">
        <div className="benefit-section__head">
          <h2>Where the time goes</h2>
          <span className="muted">Standard corpus depth</span>
        </div>
        {breakdown.length === 0 ? (
          <Empty message="Run node server/scripts/enrich-benefit.js to seed benefit estimates." />
        ) : (
          <div className="benefit-section__table">
            <table className="table table--compact benefit-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Hours</th>
                  <th>Per company</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.task}>
                    <td>{row.task}</td>
                    <td className="benefit-table__hours">{row.hours}h</td>
                    <td className="benefit-table__note muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {includes.length > 0 && (
        <section className="benefit-section">
          <div className="benefit-section__head">
            <h2>What every company gets</h2>
          </div>
          <ul className="benefit-outcomes">
            {includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="benefit-company-link muted">
            Company-specific priorities live on{' '}
            <Link to="/suggestions">Suggestions</Link> and <Link to="/brief">Brief</Link> — use the
            company selector there.
          </p>
        </section>
      )}

      <details className="benefit-details">
        <summary>How hours are estimated</summary>
        <p className="benefit-methodology__text">
          {benefit?.policy ||
            'Estimated manual effort to build one company profile at the standard depth in this watch list.'}
        </p>
      </details>
    </div>
  );
}
