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
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="brief" element={<Brief />} />
            <Route path="threats" element={<Navigate to="/brief" replace />} />
            <Route path="momentum" element={<Navigate to="/brief" replace />} />
            <Route path="gaps" element={<Navigate to="/brief" replace />} />
            <Route path="leadership" element={<Navigate to="/brief" replace />} />
            <Route index element={<Overview />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="products" element={<Products />} />
            <Route path="intel" element={<IntelPage />} />
            <Route path="signals" element={<Navigate to="/intel?section=signals" replace />} />
            <Route path="search" element={<Navigate to="/intel?section=search" replace />} />
            <Route path="linkedin" element={<Navigate to="/intel?section=social&channel=linkedin" replace />} />
            <Route path="x" element={<Navigate to="/intel?section=social&channel=x" replace />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="benefit" element={<Benefit />} />
            <Route path="sources" element={<SourcesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}
