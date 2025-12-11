from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from datetime import datetime
from typing import Optional, List, Tuple
from . import models


def get_campaigns_with_count(
  db: Session,
  skip: int = 0,
  limit: int = 5,
  tipo_campania: Optional[str] = None,
  fecha_inicio: Optional[datetime] = None,
  fecha_fin: Optional[datetime] = None,
  search: Optional[str] = None
) -> Tuple[List[models.Campaign], int]:
  """Retrieve campaigns with pagination and return total count."""
  query = db.query(models.Campaign)

  if tipo_campania:
    query = query.filter(models.Campaign.tipo_campania == tipo_campania)

  if fecha_inicio and fecha_fin:
    query = query.filter(
      and_(
        models.Campaign.fecha_inicio <= fecha_fin,
        models.Campaign.fecha_fin >= fecha_inicio
      )
    )

  if search:
    query = query.filter(models.Campaign.name.ilike(f"%{search}%"))

  total = query.count()
  campaigns = query.offset(skip).limit(limit).all()
  return campaigns, total


def get_campaign(db: Session, campaign_id: str) -> Optional[models.Campaign]:
  """Retrieve a single campaign by name."""
  return db.query(models.Campaign).filter(
    models.Campaign.name == campaign_id
  ).first()


def get_campaign_sites_count(db: Session, campaign_name: str) -> int:
  """Count sites for a campaign."""
  return db.query(models.CampaignSite).filter(
    models.CampaignSite.campaign_name == campaign_name
  ).count()


def get_campaign_periods_count(db: Session, campaign_name: str) -> int:
  """Count periods for a campaign."""
  return db.query(models.CampaignPeriod).filter(
    models.CampaignPeriod.campaign_name == campaign_name
  ).count()


def get_sites_summary(db: Session, campaign_name: str) -> dict:
  """Get aggregated sites data for charts."""
  sites = db.query(models.CampaignSite).filter(
    models.CampaignSite.campaign_name == campaign_name
  ).all()

  by_type = {}
  by_municipio = {}

  for site in sites:
    tipo = site.tipo_de_mueble or "Unknown"
    if tipo not in by_type:
      by_type[tipo] = {"count": 0, "total_impactos": 0}
    by_type[tipo]["count"] += 1
    by_type[tipo]["total_impactos"] += site.impactos_mensuales or 0

    municipio = site.municipio or "Unknown"
    if municipio not in by_municipio:
      by_municipio[municipio] = {"count": 0, "total_impactos": 0}
    by_municipio[municipio]["count"] += 1
    by_municipio[municipio]["total_impactos"] += site.impactos_mensuales or 0

  return {
    "total_sites": len(sites),
    "by_type": [
      {"tipo_de_mueble": k, "count": v["count"], "total_impactos": v["total_impactos"]}
      for k, v in by_type.items()
    ],
    "by_municipio": [
      {"municipio": k, "count": v["count"], "total_impactos": v["total_impactos"]}
      for k, v in by_municipio.items()
    ]
  }


def get_periods_summary(db: Session, campaign_name: str) -> dict:
  """Get aggregated periods data for charts."""
  periods = db.query(models.CampaignPeriod).filter(
    models.CampaignPeriod.campaign_name == campaign_name
  ).all()

  data = []
  for period in periods:
    data.append({
      "period": period.period,
      "impactos_personas": period.impactos_periodo_personas or 0,
      "impactos_vehiculos": period.impactos_periodo_vehiculos or 0
    })

  data.sort(key=lambda x: x["period"])

  return {
    "total_periods": len(periods),
    "data": data
  }


def get_campaign_summary(campaign: models.Campaign) -> dict:
  """Get demographic summary data for charts."""
  nse_distribution = [
    {"label": "AB", "value": campaign.nse_ab or 0},
    {"label": "C", "value": campaign.nse_c or 0},
    {"label": "C+", "value": campaign.nse_cmas or 0},
    {"label": "D", "value": campaign.nse_d or 0},
    {"label": "D+", "value": campaign.nse_dmas or 0},
    {"label": "E", "value": campaign.nse_e or 0},
  ]

  age_distribution = [
    {"label": "0-14", "value": campaign.edad_0a14 or 0},
    {"label": "15-19", "value": campaign.edad_15a19 or 0},
    {"label": "20-24", "value": campaign.edad_20a24 or 0},
    {"label": "25-34", "value": campaign.edad_25a34 or 0},
    {"label": "35-44", "value": campaign.edad_35a44 or 0},
    {"label": "45-64", "value": campaign.edad_45a64 or 0},
    {"label": "65+", "value": campaign.edad_65mas or 0},
  ]

  gender_distribution = [
    {"label": "Hombres", "value": campaign.hombres or 0},
    {"label": "Mujeres", "value": campaign.mujeres or 0},
  ]

  return {
    "nse_distribution": nse_distribution,
    "age_distribution": age_distribution,
    "gender_distribution": gender_distribution
  }
