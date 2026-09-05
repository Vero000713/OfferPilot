import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { InterviewDetailPage } from './pages/InterviewDetailPage'
import { InterviewListPage } from './pages/InterviewListPage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/interviews" element={<InterviewListPage />} />
        <Route path="/interviews/:id" element={<InterviewDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App
