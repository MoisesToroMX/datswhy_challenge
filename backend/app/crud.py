from sqlalchemy.orm import Session
from sqlalchemy import and_
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
    query = query.filter(models.Campaign.name.ilike(f'%{search}%'))

  total = query.count()
  campaigns = query.offset(skip).limit(limit).all()

  return campaigns, total


def get_campaign(db: Session, campaign_id: str) -> Optional[models.Campaign]:
  return db.query(models.Campaign).filter(
    models.Campaign.name == campaign_id
  ).first()


def get_campaign_sites_count(db: Session, campaign_name: str) -> int:
  return db.query(models.CampaignSite).filter(
    models.CampaignSite.campaign_name == campaign_name
  ).count()


def get_campaign_periods_count(db: Session, campaign_name: str) -> int:
  return db.query(models.CampaignPeriod).filter(
    models.CampaignPeriod.campaign_name == campaign_name
  ).count()


def get_sites_summary(db: Session, campaign_name: str) -> dict:
  sites = db.query(models.CampaignSite).filter(
    models.CampaignSite.campaign_name == campaign_name
  ).all()

  furniture_type_stats = {}
  municipality_stats = {}

  for site in sites:
    furniture_type = site.tipo_de_mueble or 'Unknown'
    monthly_impacts = site.impactos_mensuales or 0

    if furniture_type not in furniture_type_stats:
      furniture_type_stats[furniture_type] = {'count': 0, 'total_impacts': 0}

    furniture_type_stats[furniture_type]['count'] += 1
    furniture_type_stats[furniture_type]['total_impacts'] += monthly_impacts
    municipality = site.municipio or 'Unknown'

    if municipality not in municipality_stats:
      municipality_stats[municipality] = {'count': 0, 'total_impacts': 0}

    municipality_stats[municipality]['count'] += 1
    municipality_stats[municipality]['total_impacts'] += monthly_impacts

  return {
    'total_sites': len(sites),
    'by_type': [
      {
        'tipo_de_mueble': furniture_name,
        'count': stats['count'],
        'total_impacts': stats['total_impacts']
      }
      for furniture_name, stats in furniture_type_stats.items()
    ],
    'by_municipality': [
      {
        'municipality': municipality_name,
        'count': stats['count'],
        'total_impacts': stats['total_impacts']
      }
      for municipality_name, stats in municipality_stats.items()
    ]
  }


def get_periods_summary(db: Session, campaign_name: str) -> dict:
  periods = db.query(models.CampaignPeriod).filter(
    models.CampaignPeriod.campaign_name == campaign_name
  ).all()

  period_data = [
    {
      'period': period.period,
      'people_impacts': period.impactos_periodo_personas or 0,
      'vehicle_impacts': period.impactos_periodo_vehiculos or 0
    }
    
    for period in periods
  ]

  period_data.sort(key=lambda item: item['period'])

  return { 'total_periods': len(periods), 'data': period_data }


def get_campaign_summary(campaign: models.Campaign) -> dict:
  nse_distribution = [
    {'label': 'AB', 'value': campaign.nse_ab or 0},
    {'label': 'C', 'value': campaign.nse_c or 0},
    {'label': 'C+', 'value': campaign.nse_cmas or 0},
    {'label': 'D', 'value': campaign.nse_d or 0},
    {'label': 'D+', 'value': campaign.nse_dmas or 0},
    {'label': 'E', 'value': campaign.nse_e or 0},
  ]

  age_distribution = [
    {'label': '0-14', 'value': campaign.edad_0a14 or 0},
    {'label': '15-19', 'value': campaign.edad_15a19 or 0},
    {'label': '20-24', 'value': campaign.edad_20a24 or 0},
    {'label': '25-34', 'value': campaign.edad_25a34 or 0},
    {'label': '35-44', 'value': campaign.edad_35a44 or 0},
    {'label': '45-64', 'value': campaign.edad_45a64 or 0},
    {'label': '65+', 'value': campaign.edad_65mas or 0},
  ]

  gender_distribution = [
    {'label': 'Hombres', 'value': campaign.hombres or 0},
    {'label': 'Mujeres', 'value': campaign.mujeres or 0},
  ]

  return {
    'nse_distribution': nse_distribution,
    'age_distribution': age_distribution,
    'gender_distribution': gender_distribution
  }
