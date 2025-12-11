import { ConfigProvider, theme } from 'antd'
import { CampaignsPage } from './pages/CampaignsPage'
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
      <CampaignsPage />
    </ConfigProvider>
  )
}

export default App
