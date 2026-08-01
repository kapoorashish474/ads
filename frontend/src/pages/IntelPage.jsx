import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { NavIcon } from '../components/NavIcon';
import { useCompany } from '../context/CompanyContext';
import Signals from './Signals';
import SearchPage from './SearchPage';
import LinkedInPage from './LinkedInPage';
import XPage from './XPage';

const SOCIAL_CHANNELS = [
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { id: 'x', label: 'X', icon: 'x' },
];

const VALID_SECTIONS = ['signals', 'search', 'social'];

function sectionFromPath(pathname) {
  const segment = pathname.split('/').filter(Boolean).pop();
  return VALID_SECTIONS.includes(segment) ? segment : null;
}

export default function IntelPage() {
  const { pathname } = useLocation();
  const sectionParam = sectionFromPath(pathname);
  const { slug } = useCompany();
  const [params, setParams] = useSearchParams();

  if (!sectionParam) {
    return <Navigate to="/signals" replace />;
  }

  const section = sectionParam;
  const channel = SOCIAL_CHANNELS.some((c) => c.id === params.get('channel'))
    ? params.get('channel')
    : 'linkedin';

  function setChannel(next) {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('channel', next);
      return p;
    });
  }

  return (
    <div className="page page--intel">
      {section === 'social' && (
        <div className="intel-toolbar scroll-x">
          <div className="intel-nav" role="tablist" aria-label="Social channels">
            <div className="intel-nav__group intel-nav__group--channels">
              {SOCIAL_CHANNELS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={channel === item.id}
                  className={channel === item.id ? 'intel-tab intel-tab--channel active' : 'intel-tab intel-tab--channel'}
                  onClick={() => setChannel(item.id)}
                >
                  <NavIcon name={item.icon} variant="intel" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="intel-content">
        {section === 'signals' && <Signals key={slug} embedded />}
        {section === 'search' && <SearchPage key={slug} embedded />}
        {section === 'social' && channel === 'linkedin' && <LinkedInPage key={slug} embedded />}
        {section === 'social' && channel === 'x' && <XPage key={slug} embedded />}
      </div>
    </div>
  );
}
