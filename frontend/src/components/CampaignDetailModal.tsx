import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Card,
  Col,
  ConfigProvider,
  Modal,
  Progress,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag
} from 'antd'
import type { TabsProps } from 'antd'
import {
  CampaignListItem,
  CampaignSummary,
  PeriodsSummary,
  SitesSummary
} from '../types/campaign'
import {
  getCampaignSummary,
  getPeriodsSummary,
  getSitesSummary
} from '../api/campaigns'

const THEME = {
  BACKGROUND: '#202225',
  CARD: '#2F3136',
  TEXT_MAIN: '#FFFFFF',
  TEXT_MUTED: '#B9BBBE',
  ACCENT_BLUE: '#3B82F6',
  ACCENT_GREEN: '#3BA55C',
  BORDER: '#202225'
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

interface DistributionItem {
  label: string
  value: number
}

interface CampaignDetailModalProps {
  campaign: CampaignListItem | null
  open: boolean
  onClose: () => void
}

const DistributionChart = ({
  items,
  color
}: {
  items: DistributionItem[]
  color: string | ((item: DistributionItem) => string)
}) => (
  <>
    {items.map((item) => {
      const { label = 'N/A', value = 0 } = item
      const strokeColor = typeof color === 'function' ? color(item) : color

      return (
        <div key={label} style={{ marginBottom: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              color: THEME.TEXT_MUTED
            }}
          >
            <span>{label}</span>
            <span>{(value * 100).toFixed(1)}%</span>
          </div>
          <Progress
            percent={Math.round(value * 100)}
            showInfo={false}
            strokeColor={strokeColor}
            railColor={THEME.BACKGROUND}
            size='small'
          />
        </div>
      )
    })}
  </>
)

const SummaryStatCard = ({
  title,
  value
}: {
  title: string
  value: number | string
}) => (
  <Card
    size='small'
    style={{
      background: THEME.CARD,
      border: `1px solid ${THEME.BORDER}`,
      height: '100%'
    }}
    styles={{ body: { padding: '8px 12px' } }}
  >
    <Statistic
      title={
        <span
          style={{
            color: THEME.TEXT_MUTED,
            fontSize: 11,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block'
          }}
        >
          {title}
        </span>
      }
      value={value}
      styles={{
        content: {
          color: THEME.TEXT_MAIN,
          fontSize: 16,
          whiteSpace: 'nowrap'
        }
      }}
    />
  </Card>
)

const TotalStatCard = ({
  title,
  value
}: {
  title: string
  value: number
}) => (
  <Card
    size='small'
    style={{
      background: THEME.CARD,
      border: `1px solid ${THEME.BORDER}`,
      height: '100%'
    }}
    styles={{ body: { padding: 12 } }}
  >
    <Statistic
      title={
        <span style={{ color: THEME.TEXT_MUTED, fontSize: 13 }}>
          {title}
        </span>
      }
      value={value}
      styles={{ content: { color: THEME.TEXT_MAIN, fontSize: 20 } }}
    />
  </Card>
)

const DistributionCard = ({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) => (
  <Card
    title={<span style={{ color: THEME.TEXT_MAIN }}>{title}</span>}
    style={{
      background: THEME.CARD,
      border: `1px solid ${THEME.BORDER}`
    }}
    styles={{ header: { borderBottom: `1px solid ${THEME.BORDER}` } }}
    variant='borderless'
  >
    {children}
  </Card>
)

export const CampaignDetailModal = ({
  campaign,
  open,
  onClose
}: CampaignDetailModalProps) => {
  const [loading, setLoading] = useState(false)
  const [sitesSummary, setSitesSummary] = useState<SitesSummary | null>(null)
  const [periodsSummary, setPeriodsSummary] =
    useState<PeriodsSummary | null>(null)
  const [campaignSummary, setCampaignSummary] =
    useState<CampaignSummary | null>(null)
  const lastLoadedCampaign = useRef<string | null>(null)

  const loadData = useCallback(async (campaignName: string) => {
    if (lastLoadedCampaign.current === campaignName) return

    setLoading(true)
    try {
      const [sites, periods, summary] = await Promise.all([
        getSitesSummary(campaignName),
        getPeriodsSummary(campaignName),
        getCampaignSummary(campaignName)
      ])
      setSitesSummary(sites)
      setPeriodsSummary(periods)
      setCampaignSummary(summary)
      lastLoadedCampaign.current = campaignName
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (campaign && open && lastLoadedCampaign.current !== campaign.name) {
      loadData(campaign.name)
    }
  }, [campaign?.name, open, loadData])

  const renderSitesSummary = () => {
    if (!sitesSummary) return <Spin />

    const {
      byType = [],
      totalSites = 0,
      byMunicipality = []
    } = sitesSummary

    const maxImpactos = Math.max(
      ...byType.map((s) => s.totalImpacts ?? 0),
      1
    )

    return (
      <div style={{ color: THEME.TEXT_MAIN }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <TotalStatCard title='Total Sitios' value={totalSites} />
          </Col>
          <Col xs={24} sm={16}>
            <Card
              size='small'
              title={
                <span style={{ color: THEME.TEXT_MAIN, fontSize: 14 }}>
                  Impactos por Tipo de Mueble
                </span>
              }
              style={{
                background: THEME.CARD,
                border: `1px solid ${THEME.BORDER}`
              }}
              styles={{
                header: {
                  borderBottom: `1px solid ${THEME.BORDER}`,
                  minHeight: 40
                },
                body: { padding: 12 }
              }}
              variant='borderless'
            >
              <div
                style={{
                  maxHeight: 150,
                  overflowY: 'auto',
                  paddingRight: 4
                }}
              >
                {byType.map((item) => {
                  const {
                    furnitureType = 'Sin tipo',
                    totalImpacts = 0,
                    count = 0
                  } = item
                  const percent = Math.round((totalImpacts / maxImpactos) * 100)

                  return (
                    <div key={furnitureType} style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 2,
                          color: THEME.TEXT_MUTED,
                          fontSize: 12
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {furnitureType}
                        </span>
                        <span>
                          {totalImpacts.toLocaleString()} ({count})
                        </span>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={THEME.ACCENT_BLUE}
                        railColor={THEME.BACKGROUND}
                        size='small'
                        style={{ margin: 0 }}
                      />
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          size='small'
          title={
            <span style={{ color: THEME.TEXT_MAIN, fontSize: 14 }}>
              Distribución por Municipio
            </span>
          }
          style={{
            background: THEME.CARD,
            border: `1px solid ${THEME.BORDER}`
          }}
          styles={{
            header: {
              borderBottom: `1px solid ${THEME.BORDER}`,
              minHeight: 40
            },
            body: { padding: 0 }
          }}
          variant='borderless'
        >
          <Table
            dataSource={byMunicipality}
            rowKey='municipality'
            size='small'
            pagination={{ pageSize: 5, size: 'small' }}
            columns={[
              {
                title: 'Municipio',
                dataIndex: 'municipality',
                key: 'municipality',
                render: (text) => (
                  <span style={{ color: THEME.TEXT_MAIN, fontSize: 12 }}>
                    {text}
                  </span>
                )
              },
              {
                title: 'Sitios',
                dataIndex: 'count',
                key: 'count',
                width: 80,
                render: (text) => (
                  <span style={{ color: THEME.TEXT_MAIN, fontSize: 12 }}>
                    {text}
                  </span>
                )
              },
              {
                title: 'Impactos',
                dataIndex: 'totalImpacts',
                key: 'totalImpacts',
                width: 120,
                align: 'right',
                render: (val: number) => (
                  <span style={{ color: THEME.TEXT_MAIN, fontSize: 12 }}>
                    {(val ?? 0).toLocaleString()}
                  </span>
                )
              }
            ]}
          />
        </Card>
      </div>
    )
  }

  const renderPeriodsSummary = () => {
    if (!periodsSummary) return <Spin />

    const { data = [], totalPeriods = 0 } = periodsSummary
    const maxPersonas = Math.max(
      ...data.map((p) => p.peopleImpacts ?? 0),
      1
    )

    return (
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <Card
              size='small'
              style={{
                marginBottom: 16,
                background: THEME.CARD,
                border: `1px solid ${THEME.BORDER}`
              }}
              styles={{ body: { padding: 12 } }}
            >
              <Statistic
                title={
                  <span style={{ color: THEME.TEXT_MUTED, fontSize: 13 }}>
                    Total Períodos
                  </span>
                }
                value={totalPeriods}
                styles={{
                  content: { color: THEME.TEXT_MAIN, fontSize: 20 }
                }}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card
              size='small'
              title={
                <span style={{ color: THEME.TEXT_MAIN, fontSize: 14 }}>
                  Impactos por Período
                </span>
              }
              style={{
                background: THEME.CARD,
                border: `1px solid ${THEME.BORDER}`
              }}
              styles={{
                header: {
                  borderBottom: `1px solid ${THEME.BORDER}`,
                  minHeight: 40
                },
                body: { padding: 12 }
              }}
              variant='borderless'
            >
              <div
                style={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  paddingRight: 4
                }}
              >
                {data.map((item) => {
                  const {
                    period = 'Sin período',
                    peopleImpacts = 0,
                    vehicleImpacts = 0
                  } = item
                  const percent = Math.round((peopleImpacts / maxPersonas) * 100)

                  return (
                    <div key={period} style={{ marginBottom: 12 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 2,
                          alignItems: 'center'
                        }}
                      >
                        <Tag
                          style={{
                            background: THEME.BACKGROUND,
                            border: `1px solid ${THEME.BORDER}`,
                            color: THEME.TEXT_MAIN,
                            marginRight: 8,
                            fontSize: 12
                          }}
                        >
                          {period}
                        </Tag>
                        <span
                          style={{ color: THEME.TEXT_MUTED, fontSize: 12 }}
                        >
                          Personas:{' '}
                          <span
                            style={{
                              color: THEME.TEXT_MAIN,
                              fontWeight: 500
                            }}
                          >
                            {peopleImpacts.toLocaleString()}
                          </span>
                          {' | '}Vehículos:{' '}
                          <span
                            style={{
                              color: THEME.TEXT_MAIN,
                              fontWeight: 500
                            }}
                          >
                            {vehicleImpacts.toLocaleString()}
                          </span>
                        </span>
                      </div>
                      <Progress
                        percent={percent}
                        showInfo={false}
                        strokeColor={THEME.ACCENT_GREEN}
                        railColor={THEME.BACKGROUND}
                        size='small'
                        style={{ margin: 0 }}
                      />
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }

  const renderCampaignSummary = () => {
    if (!campaignSummary) return <Spin />

    const {
      sesDistribution = [],
      ageDistribution = [],
      genderDistribution = []
    } = campaignSummary

    const campaignStats = campaign ? [
      { title: 'Impactos Personas', value: campaign.peopleImpacts ?? 0 },
      { title: 'Impactos Vehículos', value: campaign.vehicleImpacts ?? 0 },
      { title: 'Alcance', value: campaign.reach ?? 0 },
      {
        title: 'Frecuencia Promedio',
        value: (campaign.averageFrequency ?? 0).toFixed(2)
      }
    ] : []

    return (
      <div>
        {campaign && (
          <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
            {campaignStats.map((stat, index) => (
              <Col key={index} xs={12} sm={12} md={6}>
                <SummaryStatCard title={stat.title} value={stat.value} />
              </Col>
            ))}
          </Row>
        )}

        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <DistributionCard title='Distribución NSE'>
              <DistributionChart
                items={sesDistribution}
                color={THEME.ACCENT_BLUE}
              />
            </DistributionCard>
          </Col>
          <Col xs={24} md={8}>
            <DistributionCard title='Distribución por Edad'>
              <DistributionChart
                items={ageDistribution}
                color={THEME.ACCENT_GREEN}
              />
            </DistributionCard>
          </Col>
          <Col xs={24} md={8}>
            <DistributionCard title='Distribución por Género'>
              <DistributionChart
                items={genderDistribution}
                color={(item) =>
                  item.label === 'Hombres'
                    ? THEME.ACCENT_BLUE
                    : THEME.ACCENT_GREEN
                }
              />
            </DistributionCard>
          </Col>
        </Row>
      </div>
    )
  }

  const tabItems: TabsProps['items'] = [
    {
      key: 'summary',
      label: 'General',
      children: renderCampaignSummary()
    },
    {
      key: 'sites',
      label: 'Sitios',
      children: renderSitesSummary()
    },
    {
      key: 'periods',
      label: 'Períodos',
      children: renderPeriodsSummary()
    }
  ]

  return (
    <ConfigProvider
      theme={{ token: { fontFamily: "'Google Sans', sans-serif" } }}
    >
      <Modal
        title={
          <span
            style={{
              color: THEME.TEXT_MAIN,
              fontSize: 18,
              fontWeight: 600
            }}
          >
            {campaign ? campaign.name : 'Detalle de Campaña'}
          </span>
        }
        open={open}
        onCancel={onClose}
        width='90vw'
        style={{ maxWidth: 900 }}
        centered
        footer={null}
        styles={{
          header: {
            borderBottom: '1px solid #292f46',
            padding: '12px 16px'
          },
          body: {
            padding: '16px',
            maxHeight: 'calc(80vh - 80px)',
            overflowY: 'auto'
          },
          mask: { background: 'rgba(0, 0, 0, 0.7)' }
        }}
        closeIcon={
          <GoogleIcon
            name='close'
            style={{ color: THEME.TEXT_MUTED, fontSize: 20 }}
          />
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size='large' />
          </div>
        ) : (
          <Tabs
            defaultActiveKey='summary'
            items={tabItems}
            className='discord-tabs'
          />
        )}
      </Modal>
    </ConfigProvider>
  )
}
