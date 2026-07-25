import { useSearchParams } from 'react-router-dom';
import CompareModeBar from '../components/CompareModeBar';
import { NavIcon } from '../components/NavIcon';
import { useCompany } from '../context/CompanyContext';
import Signals from './Signals';
import SearchPage from './SearchPage';
import LinkedInPage from './LinkedInPage';
import XPage from './XPage';

const SECTIONS = [
  { id: 'signals', label: 'Signals', icon: 'signals' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'social', label: 'Social', icon: 'social' },
];

const SOCIAL_CHANNELS = [
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { id: 'x', label: 'X', icon: 'x' },
];

export default function IntelPage() {
  const { data, compareMode, setCompareMode } = useCompany();
  const [params, setParams] = useSearchParams();
  const section = SECTIONS.some((s) => s.id === params.get('section'))
    ? params.get('section')
    : 'signals';
  const channel = SOCIAL_CHANNELS.some((c) => c.id === params.get('channel'))
    ? params.get('channel')
    : 'linkedin';

  const companyName = data?.company?.name || 'your company';
  const peerCount = data?.peers?.length || 0;

  function setSection(next) {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('section', next);
      if (next !== 'social') p.delete('channel');
      return p;
    });
  }

  function setChannel(next) {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      p.set('section', 'social');
      p.set('channel', next);
      return p;
    });
  }

  return (
    <div className="page page--intel">
      <header className="intel-header">
        <div className="intel-header__top">
          <div className="intel-header__title">
            <h1>Market intel</h1>
            <p className="intel-header__meta">
              {compareMode ? `${companyName} vs ${peerCount} peers` : companyName}
            </p>
          </div>
          <CompareModeBar
            compact
            compareMode={compareMode}
            onChange={setCompareMode}
            peerCount={peerCount}
          />
        </div>

        <div className="intel-header__nav scroll-x">
          <div className="intel-nav" role="tablist" aria-label="Market intel sections">
            <div className="intel-nav__group">
              {SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={section === item.id}
                  className={section === item.id ? 'intel-tab active' : 'intel-tab'}
                  onClick={() => setSection(item.id)}
                >
                  <NavIcon name={item.icon} variant="intel" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {section === 'social' && (
              <div className="intel-nav__group intel-nav__group--channels" role="tablist" aria-label="Social channels">
                <span className="intel-nav__label">Channel</span>
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
            )}
          </div>
        </div>
      </header>

      <div className="intel-content">
        {section === 'signals' && <Signals embedded />}
        {section === 'search' && <SearchPage embedded />}
        {section === 'social' && channel === 'linkedin' && <LinkedInPage embedded />}
        {section === 'social' && channel === 'x' && <XPage embedded />}
      </div>
    </div>
  );
}
