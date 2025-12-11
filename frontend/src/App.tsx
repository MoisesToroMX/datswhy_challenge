/// <reference types="vite/client" />
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { CampaignsPage } from './pages/CampaignsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import './index.css'

export const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8
        }
      }}
    >
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Navigate to="/campaigns" replace />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
