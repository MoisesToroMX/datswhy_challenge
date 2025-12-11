import axios from 'axios'
import {
  Campaign,
  CampaignDetail,
  CampaignListItem,
  CampaignPeriod,
  CampaignSite,
  CampaignSummary,
  PaginatedCampaigns,
  PeriodsSummary,
  SitesSummary,
  SiteTypeSummary,
  MunicipalitySummary,
  PeriodData,
  DemographicData
} from '../types/campaign'

const API_URL = ''

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
})

// Mappers from Snake Case (Backend) to Camel Case (Frontend)

const mapCampaignToFrontend = (data: any): Campaign => ({
  name: data.name,
  campaignType: data.campaign_type || data.tipo_campania,
  startDate: data.start_date || data.fecha_inicio,
  endDate: data.end_date || data.fecha_fin,
  metroZoneUniverse: data.metro_zone_universe || data.universo_zona_metro,
  peopleImpacts: data.people_impacts || data.impactos_personas,
  vehicleImpacts: data.vehicle_impacts || data.impactos_vehiculos,
  calculatedFrequency: data.calculated_frequency || data.frecuencia_calculada,
  averageFrequency: data.average_frequency || data.frecuencia_promedio,
  reach: data.reach || data.alcance,
  sesAB: data.ses_ab || data.nse_ab,
  sesC: data.ses_c || data.nse_c,
  sesCPlus: data.ses_c_plus || data.nse_cmas,
  sesD: data.ses_d || data.nse_d,
  sesDPlus: data.ses_d_plus || data.nse_dmas,
  sesE: data.ses_e || data.nse_e,
  age0To14: data.age_0_14 || data.edad_0a14,
  age15To19: data.age_15_19 || data.edad_15a19,
  age20To24: data.age_20_24 || data.edad_20a24,
  age25To34: data.age_25_34 || data.edad_25a34,
  age35To44: data.age_35_44 || data.edad_35a44,
  age45To64: data.age_45_64 || data.edad_45a64,
  age65Plus: data.age_65_plus || data.edad_65mas,
  men: data.men || data.hombres,
  women: data.women || data.mujeres
})

const mapCampaignListItemToFrontend = (data: any): CampaignListItem => ({
  ...mapCampaignToFrontend(data),
  sitesCount: data.sites_count,
  periodsCount: data.periods_count
})

const mapCampaignPeriodToFrontend = (data: any): CampaignPeriod => ({
  id: data.id,
  campaignName: data.campaign_name,
  period: data.period,
  periodImpactsPeople:
    data.period_impacts_people || data.impactos_periodo_personas,
  periodImpactsVehicles:
    data.period_impacts_vehicles || data.impactos_periodo_vehiculos
})

const mapCampaignSiteToFrontend = (data: any): CampaignSite => ({
  id: data.id,
  campaignName: data.campaign_name,
  siteCode: data.site_code || data.codigo_del_sitio,
  furnitureType: data.furniture_type || data.tipo_de_mueble,
  adType: data.ad_type || data.tipo_de_anuncio,
  state: data.state || data.estado,
  municipality: data.municipality || data.municipio,
  metroArea: data.metro_area || data.zm,
  frequencyBiweekly: data.frequency_biweekly || data.frecuencia_catorcenal,
  frequencyMonthly: data.frequency_monthly || data.frecuencia_mensual,
  impactsBiweekly: data.impacts_biweekly || data.impactos_catorcenal,
  impactsMonthly: data.impacts_monthly || data.impactos_mensuales,
  reachMonthly: data.reach_monthly || data.alcance_mensual
})

const mapCampaignDetailToFrontend = (data: any): CampaignDetail => ({
  ...mapCampaignToFrontend(data),
  periods: (data.periods || []).map(mapCampaignPeriodToFrontend),
  sites: (data.sites || []).map(mapCampaignSiteToFrontend)
})

const mapSiteTypeSummaryToFrontend = (data: any): SiteTypeSummary => ({
  furnitureType: data.furniture_type || data.tipo_de_mueble,
  count: data.count,
  totalImpacts: data.total_impacts
})

const mapMunicipalitySummaryToFrontend = (data: any): MunicipalitySummary => ({
  municipality: data.municipality,
  count: data.count,
  totalImpacts: data.total_impacts
})

const mapSitesSummaryToFrontend = (data: any): SitesSummary => ({
  totalSites: data.total_sites,
  byType: (data.by_type || []).map(mapSiteTypeSummaryToFrontend),
  byMunicipality: (data.by_municipality || []).map(
    mapMunicipalitySummaryToFrontend
  )
})

const mapPeriodDataToFrontend = (data: any): PeriodData => ({
  period: data.period,
  peopleImpacts: data.people_impacts || data.impactos_personas,
  vehicleImpacts: data.vehicle_impacts || data.impactos_vehiculos
})

const mapPeriodsSummaryToFrontend = (data: any): PeriodsSummary => ({
  totalPeriods: data.total_periods,
  data: (data.data || []).map(mapPeriodDataToFrontend)
})

const mapDemographicDataToFrontend = (data: any): DemographicData => ({
  label: data.label,
  value: data.value
})

const mapCampaignSummaryToFrontend = (data: any): CampaignSummary => ({
  sesDistribution: (data.ses_distribution || data.nse_distribution || []).map(
    mapDemographicDataToFrontend
  ),
  ageDistribution: (data.age_distribution || []).map(
    mapDemographicDataToFrontend
  ),
  genderDistribution: (data.gender_distribution || []).map(
    mapDemographicDataToFrontend
  )
})

// API Calls

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
  const backendData = response.data

  return {
    data: backendData.data.map(mapCampaignListItemToFrontend),
    total: backendData.total,
    page: backendData.page,
    pageSize: backendData.size || backendData.page_size,
    totalPages: backendData.total_pages
  }
}

export const getCampaignDetail = async (
  campaignId: string
): Promise<CampaignDetail> => {
  const response = await api.get(`/campaigns/${campaignId}`)
  return mapCampaignDetailToFrontend(response.data)
}

export const getSitesSummary = async (
  campaignId: string
): Promise<SitesSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/sites/summary`)
  return mapSitesSummaryToFrontend(response.data)
}

export const getPeriodsSummary = async (
  campaignId: string
): Promise<PeriodsSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/periods/summary`)
  return mapPeriodsSummaryToFrontend(response.data)
}

export const getCampaignSummary = async (
  campaignId: string
): Promise<CampaignSummary> => {
  const response = await api.get(`/campaigns/${campaignId}/summary`)
  return mapCampaignSummaryToFrontend(response.data)
}
