import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Alert,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  Button,
  Modal,
  ConfigProvider,
  Popover,
  Grid
} from 'antd'
import { CampaignTable } from '../components/CampaignTable'
import { DateRangeForm, DateRangeFormRef } from '../components/DateRangeForm'
import { CampaignDetailModal } from '../components/CampaignDetailModal'
import { CampaignListItem } from '../types/campaign'
import { getCampaigns } from '../api/campaigns'

const { Title, Text } = Typography


const THEME = {
  BACKGROUND: '#202225',    // Main app background
  PANEL: '#2F3136',         // Secondary background (sidebar/header)
  CARD: '#36393F',          // Card/Element background
  HOVER: '#40444B',         // Hover state
  TEXT_MAIN: '#FFFFFF',
  TEXT_SECONDARY: '#B9BBBE',
  TEXT_MUTED: '#B9BBBE',
  ACCENT_BLUE: '#3B82F6',   // Blue
  ACCENT_GREEN: '#3BA55C',  // Green
  BORDER: '#202225'
}


const GoogleIcon = ({ name, style }: { name: string; style?: React.CSSProperties }) => (
  <span className="material-icons-outlined" style={{ verticalAlign: 'middle', ...style }}>
    {name}
  </span>
)


const StatCard = ({ title, value, icon, color }: { title: string, value: any, icon: string, color: string }) => (
  <Card
    size="small"
    styles={{ body: { padding: '16px 20px', height: '100%' } }}
    variant="borderless"
    style={{
      background: THEME.CARD,
      borderBottom: `2px solid ${color}`,
      boxShadow: '0 1px 0 rgba(4,4,5,0.2),0 1.5px 0 rgba(6,6,7,0.05),0 2px 0 rgba(4,4,5,0.05)'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <GoogleIcon name={icon} style={{ color: color, fontSize: 18 }} />
      <Text style={{ fontSize: 13, color: THEME.TEXT_SECONDARY, fontWeight: 600 }}>{title}</Text>
    </div>
    <div style={{ fontSize: 24, fontWeight: 700, color: THEME.TEXT_MAIN }}>
      {value}
    </div>
  </Card>
)

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
          startDate || undefined,
          endDate || undefined,
          debouncedSearch || undefined
        )

        if (!isCancelled) {
          setCampaigns(response.data)
          setTotal(response.total)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar las campañas'
          )
          setCampaigns([])
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchCampaigns()

    return () => {
      isCancelled = true
    }
  }, [page, pageSize, campaignType, startDate, endDate, debouncedSearch])

  const stats = useMemo(() => {
    const totalImpacts = campaigns.reduce(
      (acc, c) => acc + (c.peopleImpacts ?? 0),
      0
    )
    const totalReach = campaigns.reduce(
      (acc, c) => acc + (c.reach ?? 0),
      0
    )
    const totalSites = campaigns.reduce(
      (acc, c) => acc + (c.sitesCount ?? 0),
      0
    )
    return { totalImpacts, totalReach, totalSites }
  }, [campaigns])

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

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Google Sans', sans-serif"
        }
      }}
    >
      <div style={{ background: THEME.BACKGROUND, color: THEME.TEXT_MAIN }}>

        <div
          style={{
            background: THEME.PANEL,
            padding: '16px 24px',
            borderBottom: `1px solid ${THEME.BACKGROUND}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <GoogleIcon name="analytics" style={{ fontSize: 24, color: THEME.ACCENT_BLUE }} />
              <div>
                <Title level={4} style={{ color: THEME.TEXT_MAIN, margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Campaign Analytics App
                </Title>
              </div>
            </div>
            <Button
              type="text"
              icon={<GoogleIcon name="info" style={{ color: THEME.TEXT_MUTED, fontSize: 20 }} />}
              onClick={() => setInfoModalOpen(true)}
              style={{ color: THEME.TEXT_MUTED }}
            />
          </div>
        </div>

        <div style={{ padding: '16px 24px' }}>
          <div style={{ marginBottom: 16 }}>
            <Title level={3} style={{ marginBottom: 4, color: THEME.TEXT_MAIN, fontSize: 20 }}>
              Campañas Publicitarias
            </Title>
            <Text style={{ color: THEME.TEXT_SECONDARY }}>
              Visión general del rendimiento y métricas clave
            </Text>
          </div>


          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Campañas Activas"
                value={total}
                icon="dataset"
                color={THEME.ACCENT_BLUE}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Impactos Totales"
                value={stats.totalImpacts.toLocaleString()}
                icon="people"
                color={THEME.ACCENT_GREEN}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Alcance Global"
                value={stats.totalReach.toLocaleString()}
                icon="public"
                color={THEME.ACCENT_BLUE}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                title="Sitios Contratados"
                value={stats.totalSites}
                icon="place"
                color={THEME.ACCENT_GREEN}
              />
            </Col>
          </Row>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              banner
              style={{ marginBottom: 12, background: 'rgba(237, 66, 69, 0.15)', border: 'none' }}
              onClose={() => setError(null)}
            />
          )}


          <div style={{
            background: THEME.CARD,
            borderRadius: 16,
            overflow: 'hidden',
            padding: '3px'
          }}>

            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${THEME.BACKGROUND}` }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <Input
                    placeholder="Buscar campaña..."
                    allowClear
                    onChange={handleSearch}
                    value={search}
                    style={{ width: '100%', background: THEME.BACKGROUND, borderColor: THEME.BACKGROUND, color: THEME.TEXT_MAIN }}
                    prefix={<GoogleIcon name="search" style={{ color: THEME.TEXT_SECONDARY, fontSize: 18 }} />}
                    className="discord-input"
                  />
                </div>


                {(screens.lg || false) ? (
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
                    <ConfigProvider
                      theme={{
                        token: {
                          colorBgContainer: THEME.BACKGROUND,
                          colorBorder: THEME.BACKGROUND,
                          colorTextPlaceholder: THEME.TEXT_SECONDARY,
                          colorText: THEME.TEXT_MAIN,
                          colorPrimary: THEME.ACCENT_BLUE
                        }
                      }}
                    >
                      <Select
                        placeholder="Tipo"
                        allowClear
                        style={{ width: 180 }}
                        value={campaignType}
                        onChange={handleCampaignTypeChange}
                        options={[
                          {
                            value: 'mensual',
                            label: (
                              <Space>
                                <GoogleIcon name="calendar_view_month" style={{ fontSize: 16 }} />
                                Mensual
                              </Space>
                            )
                          },
                          {
                            value: 'catorcenal',
                            label: (
                              <Space>
                                <GoogleIcon name="schedule" style={{ fontSize: 16 }} />
                                Catorcenal
                              </Space>
                            )
                          }
                        ]}
                      />
                    </ConfigProvider>

                    <div style={{ width: 'auto' }}>
                      <DateRangeForm ref={dateRangeRef} onSubmit={handleDateRangeSubmit} />
                    </div>
                    <Tooltip title="Limpiar filtros">
                      <Button
                        type="text"
                        onClick={handleClearAllFilters}
                        icon={<GoogleIcon name="delete_outline" style={{ color: THEME.TEXT_MUTED }} />}
                        style={{ background: 'transparent' }}
                      />
                    </Tooltip>
                  </div>
                ) : (
                  <>
                    <Popover
                      trigger="click"
                      placement="bottomRight"
                      styles={{ body: { background: THEME.CARD, border: `1px solid ${THEME.BORDER}` } }}
                      content={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 250, padding: 8 }}>
                          <ConfigProvider
                            theme={{
                              token: {
                                colorBgContainer: THEME.BACKGROUND,
                                colorBorder: THEME.BACKGROUND,
                                colorTextPlaceholder: THEME.TEXT_SECONDARY,
                                colorText: THEME.TEXT_MAIN,
                                colorPrimary: THEME.ACCENT_BLUE
                              }
                            }}
                          >
                            <Select
                              placeholder="Tipo de Campaña"
                              allowClear
                              style={{ width: '100%' }}
                              value={campaignType}
                              onChange={handleCampaignTypeChange}
                              options={[
                                {
                                  value: 'mensual',
                                  label: (
                                    <Space>
                                      <GoogleIcon name="calendar_view_month" style={{ fontSize: 16 }} />
                                      Mensual
                                    </Space>
                                  )
                                },
                                {
                                  value: 'catorcenal',
                                  label: (
                                    <Space>
                                      <GoogleIcon name="schedule" style={{ fontSize: 16 }} />
                                      Catorcenal
                                    </Space>
                                  )
                                }
                              ]}
                            />
                          </ConfigProvider>
                          <DateRangeForm ref={dateRangeRef} onSubmit={handleDateRangeSubmit} />
                        </div>
                      }
                    >
                      <Button
                        icon={<GoogleIcon name="filter_list" style={{ color: THEME.TEXT_MAIN }} />}
                        style={{ background: THEME.BACKGROUND, border: 'none', color: THEME.TEXT_MAIN }}
                      >
                        Filtros
                      </Button>
                    </Popover>
                    <Tooltip title="Limpiar filtros">
                      <Button
                        type="text"
                        onClick={handleClearAllFilters}
                        icon={<GoogleIcon name="delete_outline" style={{ color: THEME.TEXT_MUTED }} />}
                        style={{ background: 'transparent' }}
                      />
                    </Tooltip>
                  </>
                )}
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
            title={<span style={{ color: THEME.TEXT_MAIN }}>Acerca de Campaign Analytics App</span>}
            styles={{
              content: { padding: 0, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', borderRadius: 12 } as React.CSSProperties,
              header: { borderBottom: '1px solid #292f46', padding: '16px 24px' } as React.CSSProperties,
              body: { padding: '24px', maxHeight: 'calc(80vh - 80px)', overflowY: 'auto' } as React.CSSProperties,
              mask: { background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)' } as React.CSSProperties
            }}
            closeIcon={<GoogleIcon name="close" style={{ color: THEME.TEXT_MUTED, fontSize: 20 }} />}
          >
            <div style={{ color: THEME.TEXT_MAIN }}>
              <p style={{ marginBottom: 16 }}>
                <strong>Campaign Analytics App</strong> es una plataforma diseñada para la visualización y análisis de campañas publicitarias.
              </p>
              <p style={{ marginBottom: 16 }}>
                Permite a los usuarios monitorear métricas clave como impactos, alcance, y distribución por sitios y períodos.
              </p>
              <p>
                Utilice los filtros avanzados para desglosar la información por tipo de campaña o rangos de fecha específicos, obteniendo insights valiosos para la toma de decisiones estratégicas.
              </p>
            </div>
          </Modal>
        </div>
      </div>
    </ConfigProvider >
  )
}
