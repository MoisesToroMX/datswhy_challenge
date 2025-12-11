import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
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
  let handleViewDetail: Mock


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

      const skeleton = container.querySelector('.ant-skeleton')

      expect(skeleton).toBeTruthy()
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

      const table = screen.queryByRole('table')

      expect(table).toBeNull()
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

      const message = screen.getByText('No se encontraron campañas')

      expect(message).toBeTruthy()
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

      const nameElement = screen.getByText('My Campaign')

      expect(nameElement).toBeTruthy()
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

      const typeElement = screen.getByText('MENSUAL')

      expect(typeElement).toBeTruthy()
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

      const dateElement = screen.getByText('15/06/2023')

      expect(dateElement).toBeTruthy()
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

      const dateElement = screen.getByText('25/12/2023')

      expect(dateElement).toBeTruthy()
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

      const impactsElement = screen.getByText('1,234,567')

      expect(impactsElement).toBeTruthy()
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

      const reachElement = screen.getByText('500,000')

      expect(reachElement).toBeTruthy()
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

      const sitesElement = screen.getByText('10')

      expect(sitesElement).toBeTruthy()
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

      const periodsElement = screen.getByText('3')

      expect(periodsElement).toBeTruthy()
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

      const campaignA = screen.getByText('Campaign A')
      const campaignB = screen.getByText('Campaign B')
      const campaignC = screen.getByText('Campaign C')

      expect(campaignA).toBeTruthy()
      expect(campaignB).toBeTruthy()
      expect(campaignC).toBeTruthy()
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

      const paginationInfo = screen.getByText(/Mostrando/)

      expect(paginationInfo).toBeTruthy()
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

      const pagination = container.querySelector('.ant-pagination')

      expect(pagination).toBeTruthy()
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

      const headerName = screen.getByText('Nombre')
      const headerType = screen.getByText('Tipo')
      const headerStart = screen.getByText('Inicio')
      const headerEnd = screen.getByText('Fin')
      const headerImpacts = screen.getByText('Impactos')
      const headerReach = screen.getByText('Alcance')
      const headerSites = screen.getByText('Sitios')
      const headerPeriods = screen.getByText('Períodos')

      expect(headerName).toBeTruthy()
      expect(headerType).toBeTruthy()
      expect(headerStart).toBeTruthy()
      expect(headerEnd).toBeTruthy()
      expect(headerImpacts).toBeTruthy()
      expect(headerReach).toBeTruthy()
      expect(headerSites).toBeTruthy()
      expect(headerPeriods).toBeTruthy()
    })
  })
})
