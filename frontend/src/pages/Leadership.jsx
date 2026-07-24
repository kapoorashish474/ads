import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';
import { useExecutive } from '../hooks/useExecutive';

const TYPE_LABELS = {
  hire: 'New hire',
  peer_move: 'Peer move',
  departure: 'Departure',
};

export default function Leadership() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const { executive, loading, error } = useExecutive(slug);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError || error) return <ErrorState message={ctxError || error} />;
  if (!data || !executive) return null;

  const { company, peers } = data;
  const moves = executive.leadership || [];
  const ownMoves = moves.filter((m) => m.company_slug === company.slug);
  const peerMoves = moves.filter((m) => m.company_slug !== company.slug);

  const nameMap = Object.fromEntries([company, ...peers].map((c) => [c.slug, c.name]));

  return (
    <div className="page page--leadership">
      <div className="hero hero--compact">
        <h1>Leadership moves</h1>
        <p className="lede">
          Executive hires and peer leadership shifts that signal strategic direction — extends LinkedIn
          hiring with curated people moves.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-3">
        <Stat label="Total moves" value={moves.length} />
        <Stat label="Your company" value={ownMoves.length} hint="Hires & role changes" />
        <Stat label="Peer moves" value={peerMoves.length} hint="Competitive signals" />
      </div>

      <Card title="Leadership timeline" subtitle="Most recent first" collapsible defaultOpen>
        {moves.length === 0 ? (
          <Empty message="No leadership moves in corpus." />
        ) : (
          <ul className="leadership-list">
            {moves.map((m) => (
              <li key={`${m.date}-${m.name}-${m.company_slug}`} className="leadership-list__item">
                <div className="leadership-list__meta">
                  <Pill tone={m.type === 'peer_move' ? 'launch' : 'partnership'}>
                    {TYPE_LABELS[m.type] || m.type}
                  </Pill>
                  <span className="muted">{m.date}</span>
                  <span className="leadership-list__co">{nameMap[m.company_slug] || m.company_slug}</span>
                </div>
                <strong>{m.name}</strong>
                <span className="muted"> · {m.role}</span>
                <p>{m.summary}</p>
              </li>
            ))}
          </ul>
        )}
        <SourceFootnote
          source={{
            label: 'Curated from public LinkedIn listings, press, and industry news',
            confidence: 'reported',
            asOf: '2026-07',
          }}
        />
      </Card>
    </div>
  );
}
