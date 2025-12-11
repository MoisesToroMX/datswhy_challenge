import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CampaignsPage } from '../pages/CampaignsPage'
import { getCampaigns } from '../api/campaigns'
import { CampaignListItem } from '../types/campaign'

vi.mock('../api/campaigns', () => ({
  getCampaigns: vi.fn(),
  getSitesSummary: vi.fn(),
  getPeriodsSummary: vi.fn(),
  getCampaignSummary: vi.fn()
}))

const createMockCampaign = (
  overrides: Partial<CampaignListItem> = {}
): CampaignListItem => ({
  name: 'Test Campaign',
  campaignType: 'mensual',
  startDate: '2023-01-15T12:00:00',
  endDate: '2023-01-31T12:00:00',
  sitesCount: 5,
  periodsCount: 2,
  metroZoneUniverse: 1000,
  peopleImpacts: 5000,
  vehicleImpacts: 2000,
  calculatedFrequency: 1.5,
  averageFrequency: 1.2,
  reach: 800,
  sesAB: 0.1,
  sesC: 0.2,
  sesCPlus: 0.15,
  sesD: 0.25,
  sesDPlus: 0.2,
  sesE: 0.1,
  age0To14: 0.1,
  age15To19: 0.1,
  age20To24: 0.1,
  age25To34: 0.2,
  age35To44: 0.2,
  age45To64: 0.2,
  age65Plus: 0.1,
  men: 0.5,
  women: 0.5,
  ...overrides
})

const mockPaginatedResponse = (
  campaigns: CampaignListItem[],
  total: number = campaigns.length
) => ({
  data: campaigns,
  total,
  page: 0,
  pageSize: 5,
  totalPages: Math.ceil(total / 5)
})

const renderPage = () => render(
  <MemoryRouter>
    <CampaignsPage />
  </MemoryRouter>
)

describe('CampaignsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCampaigns).mockResolvedValue(
      mockPaginatedResponse([createMockCampaign()])
    )
  })

  describe('Page Structure', () => {
    it('renders app title', async () => {
      renderPage()

      const title = await screen.findByText('Campaign Analytics App')

      expect(title).toBeTruthy()
    })

    it('renders page subtitle', async () => {
      renderPage()

      const subtitle = await screen.findByText('Campañas Publicitarias')

      expect(subtitle).toBeTruthy()
    })
  })

  describe('Initial Load', () => {
    it('calls getCampaigns on mount', async () => {
      renderPage()

      await waitFor(() => {
        expect(getCampaigns).toHaveBeenCalled()
      })
    })

    it('shows loading state initially', () => {
      vi.mocked(getCampaigns).mockImplementation(
        () => new Promise(() => { })
      )

      const { container } = renderPage()
      const skeleton = container.querySelector('.ant-skeleton')

      expect(skeleton).toBeTruthy()
    })

    it('displays campaign data after load', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([
          createMockCampaign({ name: 'Loaded Campaign' })
        ])
      )

      renderPage()

      const campaignName = await screen.findByText('Loaded Campaign')

      expect(campaignName).toBeTruthy()
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      vi.mocked(getCampaigns).mockRejectedValue(new Error('Network Error'))

      renderPage()

      const errorMessage = await screen.findByText('Network Error')

      expect(errorMessage).toBeTruthy()
    })
  })

  describe('Stat Cards', () => {
    it('renders campaign stats cards', async () => {
      renderPage()

      const activeCampaigns = await screen.findByText('Campañas Activas')
      const totalImpacts = await screen.findByText('Impactos Totales')
      const totalReach = await screen.findByText('Alcance Global')
      const totalSites = await screen.findByText('Sitios Contratados')

      expect(activeCampaigns).toBeTruthy()
      expect(totalImpacts).toBeTruthy()
      expect(totalReach).toBeTruthy()
      expect(totalSites).toBeTruthy()
    })
  })

  describe('Multiple Campaigns', () => {
    it('renders all campaigns in list', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([
          createMockCampaign({ name: 'Campaign A' }),
          createMockCampaign({ name: 'Campaign B' }),
          createMockCampaign({ name: 'Campaign C' })
        ])
      )

      renderPage()

      const campaignA = await screen.findByText('Campaign A')
      const campaignB = await screen.findByText('Campaign B')
      const campaignC = await screen.findByText('Campaign C')

      expect(campaignA).toBeTruthy()
      expect(campaignB).toBeTruthy()
      expect(campaignC).toBeTruthy()
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no campaigns', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([])
      )

      renderPage()

      const emptyMessage = await screen.findByText('No se encontraron campañas')

      expect(emptyMessage).toBeTruthy()
    })
  })
})
