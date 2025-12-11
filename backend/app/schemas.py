from pydantic import BaseModel
from datetime import date
from typing import List, Optional


class CampaignPeriodBase(BaseModel):
  period: str
  impactos_periodo_personas: Optional[int] = 0
  impactos_periodo_vehiculos: Optional[int] = 0


class CampaignPeriod(CampaignPeriodBase):
  id: int
  campaign_name: str

  class Config:
    from_attributes = True


class CampaignSiteBase(BaseModel):
  codigo_del_sitio: str
  tipo_de_mueble: str
  tipo_de_anuncio: str
  estado: str
  municipio: str
  zm: str
  frecuencia_catorcenal: Optional[float] = 0.0
  frecuencia_mensual: Optional[float] = 0.0
  impactos_catorcenal: Optional[int] = 0
  impactos_mensuales: Optional[int] = 0
  alcance_mensual: Optional[float] = 0.0


class CampaignSite(CampaignSiteBase):
  id: int
  campaign_name: str

  class Config:
    from_attributes = True


class CampaignBase(BaseModel):
  name: str
  tipo_campania: str
  fecha_inicio: date
  fecha_fin: date
  universo_zona_metro: Optional[int] = 0
  impactos_personas: Optional[int] = 0
  impactos_vehiculos: Optional[int] = 0
  frecuencia_calculada: Optional[float] = 0.0
  frecuencia_promedio: Optional[float] = 0.0
  alcance: Optional[int] = 0
  nse_ab: Optional[float] = 0.0
  nse_c: Optional[float] = 0.0
  nse_cmas: Optional[float] = 0.0
  nse_d: Optional[float] = 0.0
  nse_dmas: Optional[float] = 0.0
  nse_e: Optional[float] = 0.0
  edad_0a14: Optional[float] = 0.0
  edad_15a19: Optional[float] = 0.0
  edad_20a24: Optional[float] = 0.0
  edad_25a34: Optional[float] = 0.0
  edad_35a44: Optional[float] = 0.0
  edad_45a64: Optional[float] = 0.0
  edad_65mas: Optional[float] = 0.0
  hombres: Optional[float] = 0.0
  mujeres: Optional[float] = 0.0


class Campaign(CampaignBase):
  class Config:
    from_attributes = True


class CampaignListItem(CampaignBase):
  sites_count: int = 0
  periods_count: int = 0

  class Config:
    from_attributes = True


class CampaignDetail(Campaign):
  periods: List[CampaignPeriod]
  sites: List[CampaignSite]

  class Config:
    from_attributes = True


class PaginatedCampaigns(BaseModel):
  data: List[CampaignListItem]
  total: int
  page: int
  page_size: int
  total_pages: int


class SiteTypeSummary(BaseModel):
  tipo_de_mueble: str
  count: int
  total_impacts: int


class MunicipalitySummary(BaseModel):
  municipality: str
  count: int
  total_impacts: int


class SitesSummary(BaseModel):
  total_sites: int
  by_type: List[SiteTypeSummary]
  by_municipality: List[MunicipalitySummary]


class PeriodData(BaseModel):
  period: str
  people_impacts: int
  vehicle_impacts: int


class PeriodsSummary(BaseModel):
  total_periods: int
  data: List[PeriodData]


class DemographicData(BaseModel):
  label: str
  value: float


class CampaignSummary(BaseModel):
  nse_distribution: List[DemographicData]
  age_distribution: List[DemographicData]
  gender_distribution: List[DemographicData]
