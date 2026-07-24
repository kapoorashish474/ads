import { Card, Stat, Loading, ErrorState, Pill, Empty } from '../components/ui';
import { BarChart } from '../components/Charts';
import { SourceFootnote } from '../components/Source';
import { useCompany } from '../context/CompanyContext';

const TAKEAWAY_LABELS = {
  strength: 'Strength',
  gap: 'Gap',
  implication: 'Implication',
};

function peerAvgCount(peers) {
  if (!peers.length) return 0;
  const total = peers.reduce((s, p) => s + (p.products || []).length, 0);
  return Math.round((total / peers.length) * 10) / 10;
}

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
  const coveredCategories = new Set(products.map((p) => p.category)).size;
  const peerAvg = peerAvgCount(peers);

  const landscape = [company, ...peers].flatMap((c) =>
    (c.products || []).map((p) => ({
      company: c.name,
      slug: c.slug,
      isFocus: c.slug === company.slug,
      ...p,
    }))
  );

  const counts = [company, ...peers].map((c) => ({
    name: c.name,
    count: (c.products || []).length,
    isFocus: c.slug === company.slug,
  }));

  return (
    <div className="page page--products">
      <div className="hero hero--compact">
        <h1>Products</h1>
        <p className="lede">
          Named product lines {company.name} sells publicly — what each SKU is, how it maps to peer
          categories, and where you lead or lag.
        </p>
      </div>

      <div className="grid grid--stats grid--stats-4">
        <Stat
          label="Products tracked"
          value={products.length}
          hint="Named SKUs from public pages — not every feature"
        />
        <Stat label="Categories covered" value={coveredCategories} hint="Distinct product types you ship" />
        <Stat label="Category gaps" value={gaps.length} hint="Peer categories you don't have" />
        <Stat label="Peer average" value={peerAvg} hint="Avg product lines per peer" />
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

      <Card
        title={`${company.name} portfolio`}
        subtitle="Each row is a publicly marketed product line"
        collapsible
        defaultOpen
      >
        {products.length === 0 ? (
          <Empty message="No products tracked for this company." />
        ) : (
          <div className="table-wrap table-wrap--flat">
            <table className="table product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>What it is</th>
                  <th>Category</th>
                  <th>Channels</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.name}>
                    <td className="product-table__name">{p.name}</td>
                    <td className="product-table__desc">{p.description || '—'}</td>
                    <td>
                      <Pill>{p.category}</Pill>
                    </td>
                    <td className="muted">{(p.channels || []).join(' · ') || '—'}</td>
                    <td>
                      <Pill tone="conf-reported">{p.maturity || 'GA'}</Pill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <SourceFootnote source={ds} />
      </Card>

      <div className="grid grid--2">
        <Card
          title="Product count vs peers"
          subtitle="Named lines tracked — bar height is SKU count, not revenue"
          collapsible
          defaultOpen
        >
          <BarChart
            horizontal
            categories={counts.map((c) => c.name)}
            series={[{ name: 'Product lines', data: counts.map((c) => c.count) }]}
            height={Math.max(200, counts.length * 36)}
          />
          <p className="card-note muted">
            Most peers show <strong>3</strong> because we track three flagship SKUs each — not their full catalog.
          </p>
        </Card>

        <Card
          title="Category coverage"
          subtitle="Do you ship what peers market in each category?"
          collapsible
          defaultOpen
        >
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

      <Card
        title="Peer product landscape"
        subtitle={`${landscape.length} product lines across ${peers.length + 1} companies`}
        collapsible
        defaultOpen={false}
      >
        <div className="table-wrap table-wrap--scroll">
          <table className="table product-table product-table--landscape">
            <thead>
              <tr>
                <th>Company</th>
                <th>Product</th>
                <th>Category</th>
                <th>Channels</th>
              </tr>
            </thead>
            <tbody>
              {landscape.map((row) => (
                <tr key={`${row.slug}-${row.name}`} className={row.isFocus ? 'row--focus' : ''}>
                  <td className="cell-company">{row.company}</td>
                  <td className="product-table__name">{row.name}</td>
                  <td>
                    <Pill>{row.category}</Pill>
                  </td>
                  <td className="muted">{(row.channels || []).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
