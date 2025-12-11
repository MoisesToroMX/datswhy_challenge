export interface Campaign {
  name: string
  campaignType: string
  startDate: string
  endDate: string
  metroZoneUniverse: number
  peopleImpacts: number
  vehicleImpacts: number
  calculatedFrequency: number
  averageFrequency: number
  reach: number
  sesAB: number
  sesC: number
  sesCPlus: number
  sesD: number
  sesDPlus: number
  sesE: number
  age0To14: number
  age15To19: number
  age20To24: number
  age25To34: number
  age35To44: number
  age45To64: number
  age65Plus: number
  men: number
  women: number
}

export interface CampaignListItem extends Campaign {
  sitesCount: number
  periodsCount: number
}

export interface CampaignPeriod {
  id: number
  campaignName: string
  period: string
  periodImpactsPeople: number
  periodImpactsVehicles: number
}

export interface CampaignSite {
  id: number
  campaignName: string
  siteCode: string
  furnitureType: string
  adType: string
  state: string
  municipality: string
  metroArea: string
  frequencyBiweekly: number
  frequencyMonthly: number
  impactsBiweekly: number
  impactsMonthly: number
  reachMonthly: number
}

export interface CampaignDetail extends Campaign {
  periods: CampaignPeriod[]
  sites: CampaignSite[]
}

export interface PaginatedCampaigns {
  data: CampaignListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SiteTypeSummary {
  furnitureType: string
  count: number
  totalImpacts: number
}

export interface MunicipalitySummary {
  municipality: string
  count: number
  totalImpacts: number
}

export interface SitesSummary {
  totalSites: number
  byType: SiteTypeSummary[]
  byMunicipality: MunicipalitySummary[]
}

export interface PeriodData {
  period: string
  peopleImpacts: number
  vehicleImpacts: number
}

export interface PeriodsSummary {
  totalPeriods: number
  data: PeriodData[]
}

export interface DemographicData {
  label: string
  value: number
}

export interface CampaignSummary {
  sesDistribution: DemographicData[]
  ageDistribution: DemographicData[]
  genderDistribution: DemographicData[]
}
