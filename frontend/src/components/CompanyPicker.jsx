import { useCompany } from '../context/CompanyContext';

export default function CompanyPicker() {
  const { companies, slug, setSlug, loading } = useCompany();

  return (
    <section className="company-switch" aria-label="Focus company">
      <label className="company-switch__field">
        <span className="company-switch__field-label">Company</span>
        <select
          className="company-switch__select"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          disabled={loading || companies.length === 0}
          aria-label="Select company"
        >
          {companies.map((company) => (
            <option key={company.slug} value={company.slug}>
              {company.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
