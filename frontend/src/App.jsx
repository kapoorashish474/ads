import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Opportunities from './pages/Opportunities'
import OpportunityDetail from './pages/OpportunityDetail'
import Competitors from './pages/Competitors'
import CompetitorDetail from './pages/CompetitorDetail'
import Signals from './pages/Signals'
import Sources from './pages/Sources'
import Quarters from './pages/Quarters'
import ScopePage from './pages/ScopePage'
import Learnings from './pages/Learnings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="opportunities/:id" element={<OpportunityDetail />} />
          <Route path="competitors" element={<Competitors />} />
          <Route path="competitors/:id" element={<CompetitorDetail />} />
          <Route path="quarters" element={<Quarters />} />
          <Route path="scope" element={<ScopePage />} />
          <Route path="lag" element={<ScopePage />} />
          <Route path="learnings" element={<Learnings />} />
          <Route path="signals" element={<Signals />} />
          <Route path="sources" element={<Sources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
