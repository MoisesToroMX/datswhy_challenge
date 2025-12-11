import axios from 'axios'
import {
  Campaign,
  CampaignDetail,
  CampaignListItem,
  CampaignPeriod,
  CampaignSite,
  CampaignSummary,
  DemographicData,
  MunicipalitySummary,
  PaginatedCampaigns,
  PeriodData,
  PeriodsSummary,
  SitesSummary,
  SiteTypeSummary
} from '../types/campaign'

const API_URL = ''

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
})

type BackendCampaign = Record<string, unknown>
type BackendPeriod = Record<string, unknown>
type BackendSite = Record<string, unknown>
type BackendSiteType = Record<string, unknown>
type BackendMunicipality = Record<string, unknown>
type BackendPeriodData = Record<string, unknown>
type BackendDemographic = Record<string, unknown>
type BackendSitesSummary = Record<string, unknown>
type BackendPeriodsSummary = Record<string, unknown>
type BackendCampaignSummary = Record<string, unknown>

const getString = (
  data: Record<string, unknown>,
  ...keys: string[]
): string => {
  for (const key of keys) {
    if (typeof data[key] === 'string') return data[key] as string
  }
  return ''
}

const getNumber = (
  data: Record<string, unknown>,
  ...keys: string[]
): number => {
  for (const key of keys) {
    if (typeof data[key] === 'number') return data[key] as number
  }
  return 0
}

const mapCampaignToFrontend = (data: BackendCampaign): Campaign => ({
  name: getString(data, 'name'),
  campaignType: getString(data, 'campaign_type', 'tipo_campania'),
  startDate: getString(data, 'start_date', 'fecha_inicio'),
  endDate: getString(data, 'end_date', 'fecha_fin'),
  metroZoneUniverse: getNumber(data, 'metro_zone_universe', 'universo_zona_metro'),
  peopleImpacts: getNumber(data, 'people_impacts', 'impactos_personas'),
  vehicleImpacts: getNumber(data, 'vehicle_impacts', 'impactos_vehiculos'),
  calculatedFrequency: getNumber(
    data,
    'calculated_frequency',
    'frecuencia_calculada'
  ),
  averageFrequency: getNumber(data, 'average_frequency', 'frecuencia_promedio'),
  reach: getNumber(data, 'reach', 'alcance'),
  sesAB: getNumber(data, 'ses_ab', 'nse_ab'),
  sesC: getNumber(data, 'ses_c', 'nse_c'),
  sesCPlus: getNumber(data, 'ses_c_plus', 'nse_cmas'),
  sesD: getNumber(data, 'ses_d', 'nse_d'),
  sesDPlus: getNumber(data, 'ses_d_plus', 'nse_dmas'),
  sesE: getNumber(data, 'ses_e', 'nse_e'),
  age0To14: getNumber(data, 'age_0_14', 'edad_0a14'),
  age15To19: getNumber(data, 'age_15_19', 'edad_15a19'),
  age20To24: getNumber(data, 'age_20_24', 'edad_20a24'),
  age25To34: getNumber(data, 'age_25_34', 'edad_25a34'),
  age35To44: getNumber(data, 'age_35_44', 'edad_35a44'),
  age45To64: getNumber(data, 'age_45_64', 'edad_45a64'),
  age65Plus: getNumber(data, 'age_65_plus', 'edad_65mas'),
  men: getNumber(data, 'men', 'hombres'),
  women: getNumber(data, 'women', 'mujeres')
})

const mapCampaignListItemToFrontend = (
  data: BackendCampaign
): CampaignListItem => ({
  ...mapCampaignToFrontend(data),
  sitesCount: getNumber(data, 'sites_count'),
  periodsCount: getNumber(data, 'periods_count')
})

const mapCampaignPeriodToFrontend = (data: BackendPeriod): CampaignPeriod => ({
  id: getNumber(data, 'id'),
  campaignName: getString(data, 'campaign_name'),
  period: getString(data, 'period'),
  periodImpactsPeople: getNumber(
    data,
    'period_impacts_people',
    'impactos_periodo_personas'
  ),
  periodImpactsVehicles: getNumber(
    data,
    'period_impacts_vehicles',
    'impactos_periodo_vehiculos'
  )
})

const mapCampaignSiteToFrontend = (data: BackendSite): CampaignSite => ({
  id: getNumber(data, 'id'),
  campaignName: getString(data, 'campaign_name'),
  siteCode: getString(data, 'site_code', 'codigo_del_sitio'),
  furnitureType: getString(data, 'furniture_type', 'tipo_de_mueble'),
  adType: getString(data, 'ad_type', 'tipo_de_anuncio'),
  state: getString(data, 'state', 'estado'),
  municipality: getString(data, 'municipality', 'municipio'),
  metroArea: getString(data, 'metro_area', 'zm'),
  frequencyBiweekly: getNumber(
    data,
    'frequency_biweekly',
    'frecuencia_catorcenal'
  ),
  frequencyMonthly: getNumber(data, 'frequency_monthly', 'frecuencia_mensual'),
  impactsBiweekly: getNumber(data, 'impacts_biweekly', 'impactos_catorcenal'),
  impactsMonthly: getNumber(data, 'impacts_monthly', 'impactos_mensuales'),
  reachMonthly: getNumber(data, 'reach_monthly', 'alcance_mensual')
})

const mapCampaignDetailToFrontend = (
  data: BackendCampaign
): CampaignDetail => {
  const periods = Array.isArray(data.periods) ? data.periods : []
  const sites = Array.isArray(data.sites) ? data.sites : []
  return {
    ...mapCampaignToFrontend(data),
    periods: periods.map(mapCampaignPeriodToFrontend),
    sites: sites.map(mapCampaignSiteToFrontend)
  }
}

const mapSiteTypeSummaryToFrontend = (
  data: BackendSiteType
): SiteTypeSummary => ({
  furnitureType: getString(data, 'furniture_type', 'tipo_de_mueble'),
  count: getNumber(data, 'count'),
  totalImpacts: getNumber(data, 'total_impacts')
})

const mapMunicipalitySummaryToFrontend = (
  data: BackendMunicipality
): MunicipalitySummary => ({
  municipality: getString(data, 'municipality'),
  count: getNumber(data, 'count'),
  totalImpacts: getNumber(data, 'total_impacts')
})

const mapSitesSummaryToFrontend = (
  data: BackendSitesSummary
): SitesSummary => {
  const byType = Array.isArray(data.by_type) ? data.by_type : []
  const byMunicipality = Array.isArray(data.by_municipality)
    ? data.by_municipality
    : []
  return {
    totalSites: getNumber(data, 'total_sites'),
    byType: byType.map(mapSiteTypeSummaryToFrontend),
    byMunicipality: byMunicipality.map(mapMunicipalitySummaryToFrontend)
  }
}

const mapPeriodDataToFrontend = (data: BackendPeriodData): PeriodData => ({
  period: getString(data, 'period'),
  peopleImpacts: getNumber(data, 'people_impacts', 'impactos_personas'),
  vehicleImpacts: getNumber(data, 'vehicle_impacts', 'impactos_vehiculos')
})

const mapPeriodsSummaryToFrontend = (
  data: BackendPeriodsSummary
): PeriodsSummary => {
  const periodData = Array.isArray(data.data) ? data.data : []
  return {
    totalPeriods: getNumber(data, 'total_periods'),
    data: periodData.map(mapPeriodDataToFrontend)
  }
}

const mapDemographicDataToFrontend = (
  data: BackendDemographic
): DemographicData => ({
  label: getString(data, 'label'),
  value: getNumber(data, 'value')
})

const mapCampaignSummaryToFrontend = (
  data: BackendCampaignSummary
): CampaignSummary => {
  const sesDistribution = Array.isArray(data.ses_distribution)
    ? data.ses_distribution
    : Array.isArray(data.nse_distribution)
      ? data.nse_distribution
      : []
  const ageDistribution = Array.isArray(data.age_distribution)
    ? data.age_distribution
    : []
  const genderDistribution = Array.isArray(data.gender_distribution)
    ? data.gender_distribution
    : []

  return {
    sesDistribution: sesDistribution.map(mapDemographicDataToFrontend),
    ageDistribution: ageDistribution.map(mapDemographicDataToFrontend),
    genderDistribution: genderDistribution.map(mapDemographicDataToFrontend)
  }
}

export const getCampaigns = async (
  page: number,
  pageSize: number,
  campaignType?: string,
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<PaginatedCampaigns> => {
  const skip = page * pageSize
  const params: Record<string, string> = {
    skip: skip.toString(),
    limit: pageSize.toString()
  }

  if (campaignType) params.tipo_campania = campaignType
  if (startDate) params.fecha_inicio = startDate
  if (endDate) params.fecha_fin = endDate
  if (search) params.search = search

  const response = await api.get('/campaigns/', { params })
  const backendData = response.data as Record<string, unknown>
  const dataArray = Array.isArray(backendData.data) ? backendData.data : []

  return {
    data: dataArray.map(mapCampaignListItemToFrontend),
    total: getNumber(backendData, 'total'),
    page: getNumber(backendData, 'page'),
    pageSize: getNumber(backendData, 'size', 'page_size'),
    totalPages: getNumber(backendData, 'total_pages')
  }
}

export const getCampaignDetail = async (
  campaignId: string
): Promise<CampaignDetail> => {
  const response = await api.get(`/campaigns/${campaignId}`)
  return mapCampaignDetailToFrontend(response.data as BackendCampaign)
}

export const getSitesSummary = async (
  campaignId: string
): Promise<SitesSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/sites/summary`)
  return mapSitesSummaryToFrontend(response.data as BackendSitesSummary)
}

export const getPeriodsSummary = async (
  campaignId: string
): Promise<PeriodsSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/periods/summary`)
  return mapPeriodsSummaryToFrontend(response.data as BackendPeriodsSummary)
}

export const getCampaignSummary = async (
  campaignId: string
): Promise<CampaignSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/summary`)
  return mapCampaignSummaryToFrontend(response.data as BackendCampaignSummary)
}
