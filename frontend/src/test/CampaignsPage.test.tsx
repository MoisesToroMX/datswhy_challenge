import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

const renderPage = () => render(<CampaignsPage />)

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
      await waitFor(() => {
        expect(
          screen.getByText('Campaign Analytics App')
        ).toBeInTheDocument()
      })
    })

    it('renders page subtitle', async () => {
      renderPage()
      await waitFor(() => {
        expect(
          screen.getByText('Campañas Publicitarias')
        ).toBeInTheDocument()
      })
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
      expect(container.querySelector('.ant-skeleton')).toBeInTheDocument()
    })

    it('displays campaign data after load', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([
          createMockCampaign({ name: 'Loaded Campaign' })
        ])
      )
      
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Loaded Campaign')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      vi.mocked(getCampaigns).mockRejectedValue(new Error('Network Error'))
      renderPage()
      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument()
      })
    })
  })

  describe('Stat Cards', () => {
    it('renders campaign stats cards', async () => {
      renderPage()
      await waitFor(() => {
        expect(screen.getByText('Campañas Activas')).toBeInTheDocument()
        expect(screen.getByText('Impactos Totales')).toBeInTheDocument()
        expect(screen.getByText('Alcance Global')).toBeInTheDocument()
        expect(screen.getByText('Sitios Contratados')).toBeInTheDocument()
      })
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

      await waitFor(() => {
        expect(screen.getByText('Campaign A')).toBeInTheDocument()
        expect(screen.getByText('Campaign B')).toBeInTheDocument()
        expect(screen.getByText('Campaign C')).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('shows empty message when no campaigns', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([])
      )
      renderPage()

      await waitFor(() => {
        expect(
          screen.getByText('No se encontraron campañas')
        ).toBeInTheDocument()
      })
    })
  })
})
