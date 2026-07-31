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

  const { company } = data;
  const products = company.products || [];
  const insights = company.productInsights;
  const ds = company.dataSources?.products;

  return (
    <div className="page page--products">
      <div className="hero hero--compact">
        <h1>Products</h1>
        <p className="lede">Named product lines publicly marketed by {company.name}.</p>
      </div>

      <div className="grid grid--stats grid--stats-1">
        <Stat label="Product lines" value={products.length} hint="Public SKUs tracked" />
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

      <Card title="Product portfolio" subtitle="Publicly marketed product lines" collapsible defaultOpen>
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
    </div>
  );
}
