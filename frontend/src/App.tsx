import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/dashboard/Dashboard'
import SignalsPage from './components/signals/SignalsPage'
import ChartsPage from './components/charts/ChartsPage'
import SettingsPage from './components/settings/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="signals" element={<SignalsPage />} />
          <Route path="charts" element={<ChartsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
