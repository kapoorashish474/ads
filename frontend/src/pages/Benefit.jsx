import { useEffect, useState } from 'react';
import { Card, Stat, Loading, ErrorState } from '../components/ui';
import { BarChart, LineChart } from '../components/Charts';
import { useCompany } from '../context/CompanyContext';
import { api } from '../api';

export default function Benefit() {
  const { slug, data, loading: ctxLoading, error: ctxError } = useCompany();
  const [benefit, setBenefit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .benefit(slug)
      .then(setBenefit)
      .finally(() => setLoading(false));
  }, [slug]);

  if (ctxLoading || loading) return <Loading />;
  if (ctxError) return <ErrorState message={ctxError} />;

  const snap = benefit?.snapshot || {};
  const usageData = benefit?.usage || [];

  return (
    <div className="page">
      <div className="hero hero--compact">
        <h1>Your benefit</h1>
        <p className="lede">How research data is helping {data?.company?.name}</p>
      </div>

      <div className="grid grid--stats">
        <Stat label="Deep dives" value={snap.views || 0} hint="Last 30 days" />
        <Stat label="Data refreshes" value={benefit?.refreshCount || 0} />
        <Stat label="Suggestions accepted" value={snap.suggestionsAccepted || 0} />
        <Stat label="Research hours saved" value={`~${snap.researchHoursSaved || 0}h`} hint="Estimated" />
      </div>

      <div className="grid grid--2">
        <Card title="Tool usage">
          <BarChart
            categories={usageData.map((u) => u.event_type) || ['views', 'refresh']}
            series={[
              {
                name: 'Events',
                data: usageData.length
                  ? usageData.map((u) => u.count)
                  : [snap.views || 0, benefit?.refreshCount || 0],
              },
            ]}
            height={240}
          />
        </Card>
        <Card title="Validated outcomes">
          <ul className="list list--plain">
            {(snap.highlights || []).map((h) => (
              <li key={h}>✓ {h}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Search attention for context" subtitle="Proxy for market pull on your brand">
        <LineChart
          labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
          series={[{ name: data?.company?.name, data: data?.company?.searchMetrics?.trend || [] }]}
        />
      </Card>
    </div>
  );
}
