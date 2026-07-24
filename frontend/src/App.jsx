import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Revenue from './pages/Revenue';
import Products from './pages/Products';
import Signals from './pages/Signals';
import SearchPage from './pages/SearchPage';
import Suggestions from './pages/Suggestions';
import Benefit from './pages/Benefit';
import SourcesPage from './pages/SourcesPage';
import LinkedInPage from './pages/LinkedInPage';
import XPage from './pages/XPage';

export default function App() {
  return (
    <CompanyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="products" element={<Products />} />
            <Route path="signals" element={<Signals />} />
            <Route path="linkedin" element={<LinkedInPage />} />
            <Route path="x" element={<XPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="suggestions" element={<Suggestions />} />
            <Route path="benefit" element={<Benefit />} />
            <Route path="sources" element={<SourcesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CompanyProvider>
  );
}
