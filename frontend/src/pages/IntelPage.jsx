import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { NavIcon } from '../components/NavIcon';
import { useCompany } from '../context/CompanyContext';
import Signals from './Signals';
import SearchPage from './SearchPage';
import LinkedInPage from './LinkedInPage';
import XPage from './XPage';

const SECTION_LABELS = {
  signals: 'Signals',
  search: 'Search',
  social: 'Social',
};

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

  const channelLabel = SOCIAL_CHANNELS.find((c) => c.id === channel)?.label;

  const sectionMeta =
    section === 'search'
      ? 'Modeled market attention · global and regional'
      : section === 'social' && channelLabel
        ? `${channelLabel} · this company only`
        : 'This company only';

  function setChannel(next) {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('channel', next);
      return p;
    });
  }

  return (
    <div className="page page--intel">
      <header className="intel-header">
        <div className="intel-header__top">
          <div className="intel-header__title">
            <h1>{SECTION_LABELS[section]}</h1>
            <p className="intel-header__meta">{sectionMeta}</p>
          </div>
        </div>

        {section === 'social' && (
          <div className="intel-header__nav scroll-x">
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
      </header>

      <div className="intel-content">
        {section === 'signals' && <Signals key={slug} embedded />}
        {section === 'search' && <SearchPage key={slug} embedded />}
        {section === 'social' && channel === 'linkedin' && <LinkedInPage key={slug} embedded />}
        {section === 'social' && channel === 'x' && <XPage key={slug} embedded />}
      </div>
    </div>
  );
}
