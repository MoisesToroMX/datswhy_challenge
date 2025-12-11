import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { CampaignDetailModal } from '../components/CampaignDetailModal'
import { CampaignListItem } from '../types/campaign'
import {
  getCampaignSummary,
  getPeriodsSummary,
  getSitesSummary
} from '../api/campaigns'

vi.mock('../api/campaigns')

const mockCampaign: CampaignListItem = {
  name: 'Test Campaign',
  campaignType: 'mensual',
  startDate: '2023-01-01T12:00:00',
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
  women: 0.5
}

const mockSitesSummary = {
  totalSites: 5,
  byType: [
    { furnitureType: 'Billboard', totalImpacts: 3000, count: 3 },
    { furnitureType: 'Mupie', totalImpacts: 2000, count: 2 }
  ],
  byMunicipality: [
    { municipality: 'CityA', totalImpacts: 4000, count: 4 },
    { municipality: 'CityB', totalImpacts: 1000, count: 1 }
  ]
}

const mockPeriodsSummary = {
  totalPeriods: 2,
  data: [
    { period: '2023-01', peopleImpacts: 2500, vehicleImpacts: 1000 },
    { period: '2023-02', peopleImpacts: 2500, vehicleImpacts: 1000 }
  ]
}

const mockCampaignSummary = {
  sesDistribution: [
    { label: 'AB', value: 0.1 },
    { label: 'C', value: 0.2 },
    { label: 'C+', value: 0.15 },
    { label: 'D', value: 0.25 },
    { label: 'D+', value: 0.2 },
    { label: 'E', value: 0.1 }
  ],
  ageDistribution: [
    { label: '0-14', value: 0.1 },
    { label: '15-19', value: 0.1 },
    { label: '20-24', value: 0.1 },
    { label: '25-34', value: 0.2 },
    { label: '35-44', value: 0.2 },
    { label: '45-64', value: 0.2 },
    { label: '65+', value: 0.1 }
  ],
  genderDistribution: [
    { label: 'Hombres', value: 0.5 },
    { label: 'Mujeres', value: 0.5 }
  ]
}

describe('CampaignDetailModal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getSitesSummary).mockResolvedValue(mockSitesSummary)
    vi.mocked(getPeriodsSummary).mockResolvedValue(mockPeriodsSummary)
    vi.mocked(getCampaignSummary).mockResolvedValue(mockCampaignSummary)
  })

  describe('Modal Visibility', () => {
    it('does not render when open is false', () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={false}
          onClose={vi.fn()}
        />
      )
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders modal when open is true', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('does not render when campaign is null', () => {
      render(
        <CampaignDetailModal
          campaign={null}
          open={true}
          onClose={vi.fn()}
        />
      )
      expect(screen.queryByText('Test Campaign')).not.toBeInTheDocument()
    })
  })

  describe('API Calls', () => {
    it('calls getSitesSummary with campaign name', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(getSitesSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls getPeriodsSummary with campaign name', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(getPeriodsSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls getCampaignSummary with campaign name', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(getCampaignSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls all APIs in parallel', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(getSitesSummary).toHaveBeenCalledTimes(1)
        expect(getPeriodsSummary).toHaveBeenCalledTimes(1)
        expect(getCampaignSummary).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner initially', async () => {
      vi.mocked(getSitesSummary).mockImplementation(
        () => new Promise(() => { })
      )
      vi.mocked(getPeriodsSummary).mockImplementation(
        () => new Promise(() => { })
      )
      vi.mocked(getCampaignSummary).mockImplementation(
        () => new Promise(() => { })
      )

      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Cargando datos...')).toBeInTheDocument()
      })
    })
  })

  describe('Modal Header', () => {
    it('displays campaign name in title', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(screen.getByText('Test Campaign')).toBeInTheDocument()
      })
    })

    it('displays subtitle text', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )
      await waitFor(() => {
        expect(
          screen.getByText('Análisis completo de rendimiento')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Close Functionality', () => {
    it('calls onClose when close button clicked', async () => {
      const handleClose = vi.fn()
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={handleClose}
        />
      )

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const closeBtn = screen.getByRole('button', { name: /close/i })
      if (closeBtn) {
        closeBtn.click()
        expect(handleClose).toHaveBeenCalled()
      }
    })
  })

  describe('Tabs Rendering', () => {
    it('renders tabs after loading', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Resumen')).toBeInTheDocument()
      })
    })

    it('renders Períodos tab', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Períodos')).toBeInTheDocument()
      })
    })

    it('renders Sitios tab', async () => {
      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Sitios')).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles API error gracefully', async () => {
      vi.mocked(getSitesSummary).mockRejectedValue(new Error('API Error'))
      vi.mocked(getPeriodsSummary).mockRejectedValue(new Error('API Error'))
      vi.mocked(getCampaignSummary).mockRejectedValue(new Error('API Error'))

      render(
        <CampaignDetailModal
          campaign={mockCampaign}
          open={true}
          onClose={vi.fn()}
        />
      )

      // Should not crash, tabs should still render
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })
})
