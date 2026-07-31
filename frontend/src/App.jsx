import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import SourcesPage from './pages/SourcesPage';
import Suggestions from './pages/Suggestions';
import IntelPage from './pages/IntelPage';

export default function App() {
  const base = import.meta.env.BASE_URL ?? '/';
  const basename = base === '/' ? undefined : base.replace(/\/$/, '');

  return (
    <CompanyProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="planning" element={<Suggestions />} />
            <Route path="signals" element={<IntelPage />} />
            <Route path="search" element={<IntelPage />} />
            <Route path="social" element={<IntelPage />} />
            <Route path="suggestions" element={<Navigate to="/planning" replace />} />
            <Route path="intel/signals" element={<Navigate to="/signals" replace />} />
            <Route path="intel/search" element={<Navigate to="/search" replace />} />
            <Route path="intel/social" element={<Navigate to="/social" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}
