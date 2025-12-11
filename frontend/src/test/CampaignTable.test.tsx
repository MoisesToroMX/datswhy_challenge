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
  let handlePaginationChange: ReturnType<typeof vi.fn>

  beforeEach(() => {
    handleViewDetail = vi.fn()
    handlePaginationChange = vi.fn()
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
      expect(container.querySelector('.skeleton')).toBeInTheDocument()
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

    it('renders multiple skeleton rows', () => {
      const { container } = render(
        <CampaignTable
          data={[]}
          loading={true}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      const skeletons = container.querySelectorAll('.skeleton')
      expect(skeletons.length).toBe(5)
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

    it('renders empty state description', () => {
      render(
        <CampaignTable
          data={[]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, total: 0 }}
        />
      )
      expect(
        screen.getByText('Intenta ajustar los filtros de búsqueda')
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

    it('renders sites count with label', () => {
      const campaign = createMockCampaign({ sitesCount: 10 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('10 sitios')).toBeInTheDocument()
    })

    it('renders periods count with label', () => {
      const campaign = createMockCampaign({ periodsCount: 3 })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByText('3 períodos')).toBeInTheDocument()
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

  describe('View Detail Button', () => {
    it('renders view button for each row', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(screen.getByRole('button', { name: /ver/i })).toBeInTheDocument()
    })

    it('calls onViewDetail with campaign when clicked', () => {
      const campaign = createMockCampaign({ name: 'Clickable Campaign' })
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      fireEvent.click(screen.getByRole('button', { name: /ver/i }))
      expect(handleViewDetail).toHaveBeenCalledWith(campaign)
    })

    it('calls correct campaign for multiple rows', () => {
      const campaigns = [
        createMockCampaign({ name: 'First' }),
        createMockCampaign({ name: 'Second' })
      ]
      render(
        <CampaignTable
          data={campaigns}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      const buttons = screen.getAllByRole('button', { name: /ver/i })
      fireEvent.click(buttons[1])
      expect(handleViewDetail).toHaveBeenCalledWith(campaigns[1])
    })
  })

  describe('Pagination', () => {
    it('renders pagination container', () => {
      const campaign = createMockCampaign()
      const { container } = render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(
        container.querySelector('.pagination-container')
      ).toBeInTheDocument()
    })

    it('displays current page number', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, current: 2 }}
        />
      )
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('displays total pages', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, total: 15, pageSize: 5 }}
        />
      )
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('disables previous button on first page', () => {
      const campaign = createMockCampaign()
      const { container } = render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, current: 1 }}
        />
      )
      const prevBtn = container.querySelector('.pagination-btn')
      expect(prevBtn).toBeDisabled()
    })

    it('enables next button when more pages exist', () => {
      const campaign = createMockCampaign()
      const { container } = render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={{ ...defaultPagination, current: 1, total: 15 }}
        />
      )
      const buttons = container.querySelectorAll('.pagination-btn')
      const nextBtn = buttons[1]
      expect(nextBtn).not.toBeDisabled()
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
      expect(screen.getByText('Fecha Inicio')).toBeInTheDocument()
      expect(screen.getByText('Fecha Fin')).toBeInTheDocument()
      expect(screen.getByText('Impactos')).toBeInTheDocument()
      expect(screen.getByText('Alcance')).toBeInTheDocument()
      expect(screen.getByText('Sitios')).toBeInTheDocument()
      expect(screen.getByText('Períodos')).toBeInTheDocument()
      expect(screen.getByText('Acciones')).toBeInTheDocument()
    })
  })

  describe('Header Content', () => {
    it('renders header content when provided', () => {
      const campaign = createMockCampaign()
      render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
          headerContent={<div data-testid="custom-header">Custom Header</div>}
        />
      )
      expect(screen.getByTestId('custom-header')).toBeInTheDocument()
    })

    it('does not render header section when not provided', () => {
      const campaign = createMockCampaign()
      const { container } = render(
        <CampaignTable
          data={[campaign]}
          loading={false}
          onViewDetail={handleViewDetail}
          pagination={defaultPagination}
        />
      )
      expect(
        container.querySelector('[data-testid="custom-header"]')
      ).not.toBeInTheDocument()
    })
  })
})
