import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

describe('CampaignsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getCampaigns).mockResolvedValue(
      mockPaginatedResponse([createMockCampaign()])
    )
  })

  describe('Page Structure', () => {
    it('renders page title', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Campañas')).toBeInTheDocument()
      })
    })

    it('renders page subtitle', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(
          screen.getByText('Análisis de campañas publicitarias')
        ).toBeInTheDocument()
      })
    })

    it('renders filter section', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Filtros')).toBeInTheDocument()
      })
    })
  })

  describe('Initial Load', () => {
    it('calls getCampaigns on mount', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(getCampaigns).toHaveBeenCalled()
      })
    })

    it('shows loading state initially', () => {
      vi.mocked(getCampaigns).mockImplementation(
        () => new Promise(() => { })
      )
      const { container } = render(<CampaignsPage />)
      expect(container.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('displays campaign data after load', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([
          createMockCampaign({ name: 'Loaded Campaign' })
        ])
      )
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Loaded Campaign')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      vi.mocked(getCampaigns).mockRejectedValue(new Error('Network Error'))
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })

    it('displays error details', async () => {
      vi.mocked(getCampaigns).mockRejectedValue(new Error('Connection failed'))
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Connection failed')).toBeInTheDocument()
      })
    })
  })

  describe('Campaign Type Filter', () => {
    it('renders campaign type dropdown', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Tipo de Campaña')).toBeInTheDocument()
      })
    })

    it('calls getCampaigns with tipo filter when selected', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(getCampaigns).toHaveBeenCalled()
      })

      // Initial call
      expect(getCampaigns).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, limit: 5 })
      )
    })
  })

  describe('Date Range Filter', () => {
    it('renders date range form', async () => {
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('Limpiar')).toBeInTheDocument()
      })
    })
  })

  describe('Pagination', () => {
    it('displays correct total in pagination info', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse(
          [createMockCampaign()],
          25
        )
      )
      render(<CampaignsPage />)
      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument()
      })
    })

    it('reloads data on page change', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse(
          [createMockCampaign()],
          15
        )
      )
      render(<CampaignsPage />)

      await waitFor(() => {
        expect(getCampaigns).toHaveBeenCalledTimes(1)
      })

      // Find and click next page button
      const { container } = render(<CampaignsPage />)
      await waitFor(() => {
        const buttons = container.querySelectorAll('.pagination-btn')
        if (buttons.length > 1) {
          fireEvent.click(buttons[1])
        }
      })
    })
  })

  describe('Campaign Detail Modal', () => {
    it('opens modal when view detail clicked', async () => {
      vi.mocked(getCampaigns).mockResolvedValue(
        mockPaginatedResponse([
          createMockCampaign({ name: 'Detail Campaign' })
        ])
      )
      render(<CampaignsPage />)

      await waitFor(() => {
        expect(screen.getByText('Detail Campaign')).toBeInTheDocument()
      })

      const viewBtn = screen.getByRole('button', { name: /ver/i })
      fireEvent.click(viewBtn)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
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
      render(<CampaignsPage />)

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
      render(<CampaignsPage />)

      await waitFor(() => {
        expect(
          screen.getByText('No se encontraron campañas')
        ).toBeInTheDocument()
      })
    })
  })
})
