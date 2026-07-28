import { Link } from 'react-router-dom';
import { isStaticMode } from '../api';

export function AuthenticityNotice() {
  return (
    <aside className="authenticity-bar" role="note">
      <span className="authenticity-bar__mark" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
          <path d="M12 10v6M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <p>
        Public-source research only. Each metric is tagged Reported, Estimated, Modeled, Inferred, or Mixed —{' '}
        {isStaticMode ? 'reload fetches the published snapshot' : 'reload never fabricates numbers'}.
        {' '}
        <Link to="/sources">View sources</Link>
      </p>
    </aside>
  );
}
