import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [slug, setSlug] = useState('kargo');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.companies().then((r) => setCompanies(r.companies)).catch(() => {});
  }, []);

  const load = useCallback(async (companySlug) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.peers(companySlug);
      setData(result);
      api.track('view_company', companySlug, { tab: window.location.pathname });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(slug);
  }, [slug, load]);

  const refresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await api.refresh(slug);
      await load(slug);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        slug,
        setSlug,
        data,
        loading,
        refreshing,
        error,
        refresh,
        reload: () => load(slug),
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
