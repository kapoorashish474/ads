import { Link } from 'react-router-dom';
import { isStaticMode } from '../api';

export function AuthenticityNotice() {
  return (
    <details className="authenticity-bar">
      <summary>
        <span className="authenticity-bar__mark" aria-hidden>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 10v6M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        Data sources & confidence levels
      </summary>
      <div className="authenticity-bar__body">
        <p>
          Public-source research only. Each metric is tagged Reported, Estimated, Modeled, Inferred, or Mixed —{' '}
          {isStaticMode ? 'reload fetches the published snapshot' : 'reload never fabricates numbers'}.
          {' '}
          <Link to="/sources">View sources</Link>
        </p>
      </div>
    </details>
  );
}
