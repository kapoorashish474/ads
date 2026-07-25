import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import Layout from './components/Layout';
import Brief from './pages/Brief';
import Overview from './pages/Overview';
import Revenue from './pages/Revenue';
import Products from './pages/Products';
import IntelPage from './pages/IntelPage';
import Suggestions from './pages/Suggestions';
import Benefit from './pages/Benefit';
import SourcesPage from './pages/SourcesPage';

export default function App() {
  const base = import.meta.env.BASE_URL ?? '/';
  const basename = base === '/' ? undefined : base.replace(/\/$/, '');

  return (
    <CompanyProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Brief />} />
            <Route path="brief" element={<Navigate to="/" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="threats" element={<Navigate to="/" replace />} />
            <Route path="momentum" element={<Navigate to="/" replace />} />
            <Route path="gaps" element={<Navigate to="/" replace />} />
            <Route path="leadership" element={<Navigate to="/" replace />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="products" element={<Products />} />
            <Route path="intel" element={<Navigate to="/intel/signals" replace />} />
            <Route path="intel/:section" element={<IntelPage />} />
            <Route path="signals" element={<Navigate to="/intel/signals" replace />} />
            <Route path="search" element={<Navigate to="/intel/search" replace />} />
            <Route path="linkedin" element={<Navigate to="/intel/social?channel=linkedin" replace />} />
            <Route path="x" element={<Navigate to="/intel/social?channel=x" replace />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="benefit" element={<Benefit />} />
            <Route path="sources" element={<SourcesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}
