import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';

const TAKEAWAY_LABELS = {
  strength: 'Strength',
  gap: 'Gap',
  implication: 'Implication',
};

export default function Products() {
  const { data, loading, error } = useCompany();
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { company, peers } = data;
  const products = company.products || [];
  const insights = company.productInsights;
  const ds = company.dataSources?.products;

  const categories = [
    ...new Set([company, ...peers].flatMap((c) => (c.products || []).map((p) => p.category))),
  ].sort();

  const categoryRows = categories.map((cat) => {
    const has = products.some((p) => p.category === cat);
    const peerNames = peers
      .filter((p) => (p.products || []).some((x) => x.category === cat))
      .map((p) => p.name);
    return { cat, has, peerNames, peerCount: peerNames.length };
  });

  const gaps = categoryRows.filter((r) => !r.has && r.peerCount > 0);

  return (
    <div className="page page--products">
      <div className="hero hero--compact">
        <h1>Products</h1>
        <p className="lede">
          Named product lines for {company.name} — category coverage vs {peers.length} peers.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-2">
        <Stat label="Product lines" value={products.length} hint="Public SKUs tracked" />
        <Stat label="Category gaps" value={gaps.length} hint="Peer categories you don't have" />
      </div>

      {insights && (
        <Card title="What this tells you" subtitle={insights.headline} collapsible defaultOpen>
          <div className="section-scroll scroll-y">
            <ul className="takeaway-list">
              {insights.takeaways.map((t) => (
                <li key={t.title} className={`takeaway takeaway--${t.type}`}>
                  <div className="takeaway__head">
                    <Pill tone={t.type === 'strength' ? 'launch' : t.type === 'gap' ? 'critical' : 'partnership'}>
                      {TAKEAWAY_LABELS[t.type]}
                    </Pill>
                    <strong>{t.title}</strong>
                  </div>
                  <p>{t.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      <div className="grid grid--2">
        <Card title={`${company.name} portfolio`} subtitle="Publicly marketed product lines" collapsible defaultOpen>
          {products.length === 0 ? (
            <Empty message="No products tracked for this company." />
          ) : (
            <div className="table-wrap table-wrap--flat">
              <table className="table product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Channels</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.name}>
                      <td className="product-table__name">
                        <strong>{p.name}</strong>
                        {p.description && <p className="muted table-note">{p.description}</p>}
                      </td>
                      <td>
                        <Pill>{p.category}</Pill>
                      </td>
                      <td className="muted">{(p.channels || []).join(' · ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <SourceFootnote source={ds} />
        </Card>

        <Card title="Category coverage" subtitle="Gaps vs peer set" collapsible defaultOpen>
          <div className="table-wrap table-wrap--scroll">
            <table className="table table--compact coverage-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>You</th>
                  <th>Peers with it</th>
                </tr>
              </thead>
              <tbody>
                {categoryRows.map((row) => (
                  <tr key={row.cat} className={!row.has && row.peerCount > 0 ? 'row--gap' : ''}>
                    <td>{row.cat}</td>
                    <td>
                      <span className={row.has ? 'coverage-ok' : 'coverage-gap'}>
                        {row.has ? 'Yes' : 'Gap'}
                      </span>
                    </td>
                    <td className="coverage-peers">
                      {row.peerCount === 0 ? (
                        <span className="muted">None in peer set</span>
                      ) : (
                        row.peerNames.join(', ')
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
