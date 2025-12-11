import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Card,
  Col,
  ConfigProvider,
  Grid,
  Input,
  Modal,
  Popover,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Button
} from 'antd'
import { CampaignTable } from '../components/CampaignTable'
import { DateRangeForm, DateRangeFormRef } from '../components/DateRangeForm'
import { CampaignDetailModal } from '../components/CampaignDetailModal'
import { CampaignListItem } from '../types/campaign'
import { getCampaigns } from '../api/campaigns'

const { Title, Text } = Typography

const THEME = {
  BACKGROUND: '#202225',
  PANEL: '#2F3136',
  CARD: '#36393F',
  HOVER: '#40444B',
  TEXT_MAIN: '#FFFFFF',
  TEXT_SECONDARY: '#B9BBBE',
  TEXT_MUTED: '#B9BBBE',
  ACCENT_BLUE: '#3B82F6',
  ACCENT_GREEN: '#3BA55C',
  BORDER: '#202225'
}

const INFO_PARAGRAPHS = [
  '<strong>Campaign Analytics App</strong> es una plataforma diseñada ' +
  'para la visualización y análisis de campañas publicitarias.',
  'Permite a los usuarios monitorear métricas clave como impactos, ' +
  'alcance, y distribución por sitios y períodos.',
  'Utilice los filtros avanzados para desglosar la información por ' +
  'tipo de campaña o rangos de fecha específicos.'
]

interface StatCardConfig {
  title: string
  value: string | number
  icon: string
  color: string
}

const GoogleIcon = (
  { name, style }: { name: string; style?: React.CSSProperties }
) => (
  <span
    className='material-icons-outlined'
    style={{ verticalAlign: 'middle', ...style }}
  >
    {name}
  </span>
)

const StatCard = ({ title, value, icon, color }: StatCardConfig) => (
  <Card
    size='small'
    styles={{ body: { padding: '16px 20px', height: '100%' } }}
    variant='borderless'
    style={{
      background: THEME.CARD,
      borderBottom: `2px solid ${color}`,
      boxShadow: '0 1px 0 rgba(4,4,5,0.2),' +
        '0 1.5px 0 rgba(6,6,7,0.05),' +
        '0 2px 0 rgba(4,4,5,0.05)'
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8
      }}
    >
      <GoogleIcon name={icon} style={{ color: color, fontSize: 18 }} />
      <Text
        style={{
          fontSize: 13,
          color: THEME.TEXT_SECONDARY,
          fontWeight: 600
        }}
      >
        {title}
      </Text>
    </div>
    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: THEME.TEXT_MAIN
      }}
    >
      {value}
    </div>
  </Card>
)

const campaignTypeOptions = [
  {
    value: 'mensual',
    label: (
      <Space>
        <GoogleIcon name='calendar_view_month' style={{ fontSize: 16 }} />
        Mensual
      </Space>
    )
  },
  {
    value: 'catorcenal',
    label: (
      <Space>
        <GoogleIcon name='schedule' style={{ fontSize: 16 }} />
        Catorcenal
      </Space>
    )
  }
]

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<CampaignListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [campaignType, setCampaignType] = useState<string | undefined>()
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [search, setSearch] = useState<string>('')
  const [debouncedSearch, setDebouncedSearch] = useState<string>('')
  const [selectedCampaign, setSelectedCampaign] =
    useState<CampaignListItem | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)

  const { useBreakpoint } = Grid
  const screens = useBreakpoint()
  const dateRangeRef = useRef<DateRangeFormRef>(null)

  const handleClearAllFilters = () => {
    setCampaignType(undefined)
    setStartDate(null)
    setEndDate(null)
    setSearch('')
    setDebouncedSearch('')
    setPage(1)
    dateRangeRef.current?.reset()
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let isCancelled = false

    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getCampaigns(
          page - 1,
          pageSize,
          campaignType,
          startDate ?? undefined,
          endDate ?? undefined,
          debouncedSearch ?? undefined
        )

        if (isCancelled) return
        setCampaigns(response.data)
        setTotal(response.total)
      } catch (err) {
        if (isCancelled) return
        const message = err instanceof Error
          ? err.message
          : 'Error al cargar las campañas'
        setError(message)
        setCampaigns([])
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    fetchCampaigns()

    return () => {
      isCancelled = true
    }
  }, [page, pageSize, campaignType, startDate, endDate, debouncedSearch])

  const stats = useMemo(() => {
    const totalImpacts = campaigns.reduce(
      (total, { peopleImpacts = 0 }) => total + peopleImpacts,
      0
    )
    const totalReach = campaigns.reduce(
      (total, { reach = 0 }) => total + reach,
      0
    )
    const totalSites = campaigns.reduce(
      (total, { sitesCount = 0 }) => total + sitesCount,
      0
    )

    return { totalImpacts, totalReach, totalSites }
  }, [campaigns])

  const statCards: StatCardConfig[] = [
    {
      title: 'Campañas Activas',
      value: total,
      icon: 'dataset',
      color: THEME.ACCENT_BLUE
    },
    {
      title: 'Impactos Totales',
      value: stats.totalImpacts.toLocaleString(),
      icon: 'people',
      color: THEME.ACCENT_GREEN
    },
    {
      title: 'Alcance Global',
      value: stats.totalReach.toLocaleString(),
      icon: 'public',
      color: THEME.ACCENT_BLUE
    },
    {
      title: 'Sitios Contratados',
      value: stats.totalSites,
      icon: 'place',
      color: THEME.ACCENT_GREEN
    }
  ]

  const handleCampaignTypeChange = (value: string | undefined) => {
    setCampaignType(value)
    setPage(1)
  }

  const handleDateRangeSubmit = (
    start: string | null,
    end: string | null
  ) => {
    setStartDate(start)
    setEndDate(end)
    setPage(1)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleViewDetail = (campaign: CampaignListItem) => {
    setSelectedCampaign(campaign)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedCampaign(null)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const filterThemeConfig = {
    token: {
      colorBgContainer: THEME.BACKGROUND,
      colorBorder: THEME.BACKGROUND,
      colorTextPlaceholder: THEME.TEXT_SECONDARY,
      colorText: THEME.TEXT_MAIN,
      colorPrimary: THEME.ACCENT_BLUE
    }
  }

  const renderCampaignTypeSelect = (width: number | string) => (
    <ConfigProvider theme={filterThemeConfig}>
      <Select
        placeholder='Tipo'
        allowClear
        style={{ width }}
        value={campaignType}
        onChange={handleCampaignTypeChange}
        options={campaignTypeOptions}
      />
    </ConfigProvider>
  )

  const renderClearButton = () => (
    <Tooltip title='Limpiar filtros'>
      <Button
        type='text'
        onClick={handleClearAllFilters}
        icon={
          <GoogleIcon
            name='delete_outline'
            style={{ color: THEME.TEXT_MUTED }}
          />
        }
        style={{ background: 'transparent' }}
      />
    </Tooltip>
  )

  const renderDesktopFilters = () => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        flexShrink: 0
      }}
    >
      {renderCampaignTypeSelect(180)}
      <div style={{ width: 'auto' }}>
        <DateRangeForm ref={dateRangeRef} onSubmit={handleDateRangeSubmit} />
      </div>
      {renderClearButton()}
    </div>
  )

  const renderMobileFilters = () => (
    <>
      <Popover
        trigger='click'
        placement='bottomRight'
        overlayInnerStyle={{
          background: THEME.CARD,
          border: `1px solid ${THEME.BORDER}`
        }}
        content={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              width: 250,
              padding: 8
            }}
          >
            {renderCampaignTypeSelect('100%')}
            <DateRangeForm
              ref={dateRangeRef}
              onSubmit={handleDateRangeSubmit}
            />
          </div>
        }
      >
        <Button
          icon={
            <GoogleIcon
              name='filter_list'
              style={{ color: THEME.TEXT_MAIN }}
            />
          }
          style={{
            background: THEME.BACKGROUND,
            border: 'none',
            color: THEME.TEXT_MAIN
          }}
        >
          Filtros
        </Button>
      </Popover>
      {renderClearButton()}
    </>
  )

  return (
    <ConfigProvider
      theme={{ token: { fontFamily: "'Google Sans', sans-serif" } }}
    >
      <div style={{ background: THEME.BACKGROUND, color: THEME.TEXT_MAIN }}>
        <div
          style={{
            background: THEME.PANEL,
            padding: '16px 24px',
            borderBottom: `1px solid ${THEME.BACKGROUND}`
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <GoogleIcon
                name='analytics'
                style={{ fontSize: 24, color: THEME.ACCENT_BLUE }}
              />
              <div>
                <Title
                  level={4}
                  style={{
                    color: THEME.TEXT_MAIN,
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700
                  }}
                >
                  Campaign Analytics App
                </Title>
              </div>
            </div>
            <Button
              type='text'
              icon={
                <GoogleIcon
                  name='info'
                  style={{ color: THEME.TEXT_MUTED, fontSize: 20 }}
                />
              }
              onClick={() => setInfoModalOpen(true)}
              style={{ color: THEME.TEXT_MUTED }}
            />
          </div>
        </div>

        <div style={{ padding: '16px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <Title
              level={3}
              style={{
                marginBottom: 4,
                color: THEME.TEXT_MAIN,
                fontSize: 20
              }}
            >
              Campañas Publicitarias
            </Title>
            <Text style={{ color: THEME.TEXT_SECONDARY }}>
              Visión general del rendimiento y métricas clave
            </Text>
          </div>

          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            {statCards.map((card, index) => (
              <Col key={index} xs={24} sm={12} lg={6}>
                <StatCard
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                  color={card.color}
                />
              </Col>
            ))}
          </Row>

          {error && (
            <Alert
              title={error}
              type='error'
              showIcon
              closable
              banner
              style={{
                marginBottom: 12,
                background: 'rgba(237, 66, 69, 0.15)',
                border: 'none'
              }}
              onClose={() => setError(null)}
            />
          )}

          <div
            style={{
              background: THEME.CARD,
              borderRadius: 16,
              overflow: 'hidden',
              padding: '3px'
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${THEME.BACKGROUND}`
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 16,
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    flex: 1,
                    minWidth: screens.sm ? '250px' : '100%'
                  }}
                >
                  <Input
                    placeholder='Buscar campaña...'
                    allowClear
                    onChange={handleSearch}
                    value={search}
                    style={{
                      width: '100%',
                      background: THEME.BACKGROUND,
                      borderColor: THEME.BACKGROUND,
                      color: THEME.TEXT_MAIN
                    }}
                    prefix={
                      <GoogleIcon
                        name='search'
                        style={{
                          color: THEME.TEXT_SECONDARY,
                          fontSize: 18
                        }}
                      />
                    }
                    className='discord-input'
                  />
                </div>
                {screens.lg ? renderDesktopFilters() : renderMobileFilters()}
              </div>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <CampaignTable
                data={campaigns}
                loading={loading}
                onViewDetail={handleViewDetail}
                pagination={{
                  current: page,
                  pageSize: pageSize,
                  total: total,
                  onChange: handlePageChange
                }}
              />
            </div>
          </div>

          {selectedCampaign && (
            <CampaignDetailModal
              campaign={selectedCampaign}
              open={modalOpen}
              onClose={handleCloseModal}
            />
          )}

          <Modal
            open={infoModalOpen}
            onCancel={() => setInfoModalOpen(false)}
            footer={null}
            centered
            title={
              <span style={{ color: THEME.TEXT_MAIN }}>
                Acerca de Campaign Analytics App
              </span>
            }
            styles={{
              header: {
                borderBottom: '1px solid #292f46',
                padding: '16px 24px'
              },
              body: {
                padding: '24px',
                maxHeight: 'calc(80vh - 80px)',
                overflowY: 'auto'
              },
              mask: {
                background: 'rgba(0, 0, 0, 0.7)'
              }
            }}
            closeIcon={
              <GoogleIcon
                name='close'
                style={{ color: THEME.TEXT_MUTED, fontSize: 20 }}
              />
            }
          >
            <div style={{ color: THEME.TEXT_MAIN }}>
              {INFO_PARAGRAPHS.map((text, index) => (
                <p
                  key={index}
                  style={{
                    marginBottom: index < INFO_PARAGRAPHS.length - 1 ? 16 : 0
                  }}
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              ))}
            </div>
          </Modal>
        </div>
      </div>
    </ConfigProvider>
  )
}
