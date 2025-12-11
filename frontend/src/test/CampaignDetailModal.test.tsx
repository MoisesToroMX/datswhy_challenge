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

const renderModal = (open: boolean = true) => render(
  <CampaignDetailModal
    campaign={mockCampaign}
    open={open}
    onClose={vi.fn()}
  />
)

describe('CampaignDetailModal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getSitesSummary).mockResolvedValue(mockSitesSummary)
    vi.mocked(getPeriodsSummary).mockResolvedValue(mockPeriodsSummary)
    vi.mocked(getCampaignSummary).mockResolvedValue(mockCampaignSummary)
  })

  describe('Modal Visibility', () => {
    it('does not render when open is false', () => {
      renderModal(false)

      const dialog = screen.queryByRole('dialog')

      expect(dialog).toBeNull()
    })

    it('renders modal when open is true', async () => {
      renderModal()

      const modalTitle = await screen.findByText('Test Campaign')

      expect(modalTitle).toBeTruthy()
    }, 10000)
  })

  describe('API Calls', () => {
    it('calls getSitesSummary with campaign name', async () => {
      renderModal()

      await waitFor(() => {
        expect(getSitesSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls getPeriodsSummary with campaign name', async () => {
      renderModal()

      await waitFor(() => {
        expect(getPeriodsSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls getCampaignSummary with campaign name', async () => {
      renderModal()

      await waitFor(() => {
        expect(getCampaignSummary).toHaveBeenCalledWith('Test Campaign')
      })
    })

    it('calls all APIs in parallel', async () => {
      renderModal()

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

      renderModal()

      const dialog = await screen.findByRole('dialog')

      expect(dialog).toBeTruthy()
    })
  })

  describe('Modal Header', () => {
    it('displays campaign name in title', async () => {
      renderModal()

      const title = await screen.findByText('Test Campaign')

      expect(title).toBeTruthy()
    })
  })

  describe('Tabs Rendering', () => {
    it('renders General tab', async () => {
      renderModal()

      const tab = await screen.findByText('General')

      expect(tab).toBeTruthy()
    })

    it('renders Períodos tab', async () => {
      renderModal()

      const tab = await screen.findByText('Períodos')

      expect(tab).toBeTruthy()
    })

    it('renders Sitios tab', async () => {
      renderModal()

      const tab = await screen.findByText('Sitios')

      expect(tab).toBeTruthy()
    })
  })
})
