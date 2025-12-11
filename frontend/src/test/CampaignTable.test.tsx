import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CampaignTable } from '../components/CampaignTable'
import { CampaignListItem } from '../types/campaign'

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

const defaultPagination = {
  current: 1,
  pageSize: 5,
  total: 10,
  onChange: vi.fn()
}

describe('CampaignTable', () => {
  let handleViewDetail: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleViewDetail = vi.fn()
  })

  describe('Loading State', () => {
    it('renders skeleton when loading', () => {
      const { container } = render(
        <CampaignTable
          data={[]}
          loading={true}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(container.querySelector('.ant-skeleton')).toBeInTheDocument()
    })

    it('does not render table when loading', () => {
      render(
        <CampaignTable
          data={[]}
          loading={true}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('renders empty state message when no data', () => {
      render(
        <CampaignTable
          data={[]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, total: 0 }}
        />
      )
      expect(
        screen.getByText('No se encontraron campañas')
      ).toBeInTheDocument()
    })
  })

  describe('Data Rendering', () => {
    it('renders campaign name', () => {
      const campaign = createMockCampaign({ name: 'My Campaign' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('My Campaign')).toBeInTheDocument()
    })

    it('renders campaign type in uppercase', () => {
      const campaign = createMockCampaign({ campaignType: 'mensual' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('MENSUAL')).toBeInTheDocument()
    })

    it('renders formatted start date', () => {
      const campaign = createMockCampaign({ startDate: '2023-06-15T12:00:00' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('15/06/2023')).toBeInTheDocument()
    })

    it('renders formatted end date', () => {
      const campaign = createMockCampaign({ endDate: '2023-12-25T12:00:00' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('25/12/2023')).toBeInTheDocument()
    })

    it('renders people impacts with locale formatting', () => {
      const campaign = createMockCampaign({ peopleImpacts: 1234567 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('renders reach with locale formatting', () => {
      const campaign = createMockCampaign({ reach: 500000 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('500,000')).toBeInTheDocument()
    })

    it('renders sites count', () => {
      const campaign = createMockCampaign({ sitesCount: 10 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('renders periods count', () => {
      const campaign = createMockCampaign({ periodsCount: 3 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('renders multiple campaigns', () => {
      const campaigns = [
        createMockCampaign({ name: 'Campaign A' }),
        createMockCampaign({ name: 'Campaign B' }),
        createMockCampaign({ name: 'Campaign C' })
      ]
      render(
        <CampaignTable
          data={campaigns}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, total: 3 }}
        />
      )
      expect(screen.getByText('Campaign A')).toBeInTheDocument()
      expect(screen.getByText('Campaign B')).toBeInTheDocument()
      expect(screen.getByText('Campaign C')).toBeInTheDocument()
    })
  })

  describe('Row Click', () => {
    it('calls onViewDetail when row is clicked', () => {
      const campaign = createMockCampaign({ name: 'Clickable Campaign' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      const row = screen.getByText('Clickable Campaign').closest('tr')
      if (row) fireEvent.click(row)
      expect(handleViewDetail).toHaveBeenCalledWith(campaign)
    })
  })

  describe('Pagination', () => {
    it('displays pagination info', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText(/Mostrando/)).toBeInTheDocument()
    })

    it('renders ant design pagination', () => {
      const campaign = createMockCampaign()
      const { container } = render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, total: 15, pageSize: 5 }}
        />
      )
      expect(container.querySelector('.ant-pagination')).toBeInTheDocument()
    })
  })

  describe('Table Headers', () => {
    it('renders all column headers', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('Nombre')).toBeInTheDocument()
      expect(screen.getByText('Tipo')).toBeInTheDocument()
      expect(screen.getByText('Inicio')).toBeInTheDocument()
      expect(screen.getByText('Fin')).toBeInTheDocument()
      expect(screen.getByText('Impactos')).toBeInTheDocument()
      expect(screen.getByText('Alcance')).toBeInTheDocument()
      expect(screen.getByText('Sitios')).toBeInTheDocument()
      expect(screen.getByText('Períodos')).toBeInTheDocument()
    })
  })
})
