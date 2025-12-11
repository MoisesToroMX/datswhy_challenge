import csv
from pathlib import Path
from datetime import datetime, date
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas, crud
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title='Campaign Analytics API')


def read_csv_file(file_path: Path) -> List[Dict[str, str]]:
  with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)

    return list(reader)


def parse_int(value: str) -> int:
  """Parse string to integer, handling date-like formats and empty values."""
  if not value or value.strip() == '':
    return 0
  if '-' in value:
    return int(value.split('-')[0])

  return int(value)


def parse_float(value: str) -> float:
  """Parse string to float, handling empty values."""
  if not value or value.strip() == '':
    return 0.0

  return float(value)


def create_campaign_from_row(row: Dict[str, str]) -> models.Campaign:
  """Create Campaign model from CSV row."""
  return models.Campaign(
    name=row['name'],
    tipo_campania=row['tipo_campania'],
    fecha_inicio=datetime.strptime(row['fecha_inicio'], '%Y-%m-%d').date(),
    fecha_fin=datetime.strptime(row['fecha_fin'], '%Y-%m-%d').date(),
    universo_zona_metro=parse_int(row['universo_zona_metro']),
    impactos_personas=parse_int(row['impactos_personas']),
    impactos_vehiculos=parse_int(row['impactos_vehiculos']),
    frecuencia_calculada=parse_float(row['frecuencia_calculada']),
    frecuencia_promedio=parse_float(row['frecuencia_promedio']),
    alcance=parse_int(row['alcance']),
    nse_ab=parse_float(row['nse_ab']),
    nse_c=parse_float(row['nse_c']),
    nse_cmas=parse_float(row['nse_cmas']),
    nse_d=parse_float(row['nse_d']),
    nse_dmas=parse_float(row['nse_dmas']),
    nse_e=parse_float(row['nse_e']),
    edad_0a14=parse_float(row['edad_0a14']),
    edad_15a19=parse_float(row['edad_15a19']),
    edad_20a24=parse_float(row['edad_20a24']),
    edad_25a34=parse_float(row['edad_25a34']),
    edad_35a44=parse_float(row['edad_35a44']),
    edad_45a64=parse_float(row['edad_45a64']),
    edad_65mas=parse_float(row['edad_65mas']),
    hombres=parse_float(row['hombres']),
    mujeres=parse_float(row['mujeres'])
  )


def create_period_from_row(row: Dict[str, str]) -> models.CampaignPeriod:
  return models.CampaignPeriod(
    campaign_name=row['name'],
    period=row['period'],
    impactos_periodo_personas=parse_int(row['impactos_periodo_personas']),
    impactos_periodo_vehiculos=parse_int(row['impactos_periodo_vehículos'])
  )


def create_site_from_row(row: Dict[str, str]) -> models.CampaignSite:
  return models.CampaignSite(
    campaign_name=row['name'],
    codigo_del_sitio=row['codigo_del_sitio'],
    tipo_de_mueble=row['tipo_de_mueble'],
    tipo_de_anuncio=row['tipo_de_anuncio'],
    estado=row['estado'],
    municipio=row['municipio'],
    zm=row['zm'],
    frecuencia_catorcenal=parse_float(row['frecuencia_catorcenal']),
    frecuencia_mensual=parse_float(row['frecuencia_mensual']),
    impactos_catorcenal=parse_int(row['impactos_catorcenal']),
    impactos_mensuales=parse_int(row['impactos_mensuales']),
    alcance_mensual=parse_float(row['alcance_mensual'])
  )


def seed_database_if_empty(db: Session) -> None:
  """Seed the database with CSV data if tables are empty."""
  campaign_count = db.query(models.Campaign).count()
  if campaign_count > 0:
    return

  base_path = Path(__file__).parent.parent / 'data'

  campaigns_data = read_csv_file(base_path / 'bd_campanias_agrupado.csv')
  periods_data = read_csv_file(base_path / 'bd_campanias_periodos.csv')
  sites_data = read_csv_file(base_path / 'bd_campanias_sitios.csv')

  seen_campaigns: set[str] = set()
  for row in campaigns_data:
    campaign_name = row['name']
    if campaign_name not in seen_campaigns:
      db.add(create_campaign_from_row(row))
      seen_campaigns.add(campaign_name)

  for row in periods_data:
    db.add(create_period_from_row(row))

  for row in sites_data:
    db.add(create_site_from_row(row))

  db.commit()


@app.on_event('startup')
async def startup_event():
  db = SessionLocal()
  try:
    seed_database_if_empty(db)
  finally:
    db.close()


app.add_middleware(
  CORSMiddleware,
  allow_origins=['*'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)


def get_db():
  db = SessionLocal()
  try:
    yield db
  finally:
    db.close()


@app.get('/')
def read_root():
  return {'message': 'Welcome to Campaign Analytics API'}


@app.get('/health')
def health_check():
  return {'status': 'ok'}


@app.get('/campaigns/', response_model=schemas.PaginatedCampaigns)
def read_campaigns(
  skip: int = Query(0, ge=0),
  limit: int = Query(5, ge=1, le=100),
  tipo_campania: Optional[str] = None,
  fecha_inicio: Optional[date] = None,
  fecha_fin: Optional[date] = None,
  search: Optional[str] = None,
  db: Session = Depends(get_db)
):
  campaigns, total = crud.get_campaigns_with_count(
    db,
    skip=skip,
    limit=limit,
    tipo_campania=tipo_campania,
    fecha_inicio=fecha_inicio,
    fecha_fin=fecha_fin,
    search=search
  )

  campaign_items = []
  for campaign in campaigns:
    sites_count = crud.get_campaign_sites_count(db, campaign.name)
    periods_count = crud.get_campaign_periods_count(db, campaign.name)

    campaign_dict = {
      'name': campaign.name,
      'tipo_campania': campaign.tipo_campania,
      'fecha_inicio': campaign.fecha_inicio,
      'fecha_fin': campaign.fecha_fin,
      'universo_zona_metro': campaign.universo_zona_metro,
      'impactos_personas': campaign.impactos_personas,
      'impactos_vehiculos': campaign.impactos_vehiculos,
      'frecuencia_calculada': campaign.frecuencia_calculada,
      'frecuencia_promedio': campaign.frecuencia_promedio,
      'alcance': campaign.alcance,
      'nse_ab': campaign.nse_ab,
      'nse_c': campaign.nse_c,
      'nse_cmas': campaign.nse_cmas,
      'nse_d': campaign.nse_d,
      'nse_dmas': campaign.nse_dmas,
      'nse_e': campaign.nse_e,
      'edad_0a14': campaign.edad_0a14,
      'edad_15a19': campaign.edad_15a19,
      'edad_20a24': campaign.edad_20a24,
      'edad_25a34': campaign.edad_25a34,
      'edad_35a44': campaign.edad_35a44,
      'edad_45a64': campaign.edad_45a64,
      'edad_65mas': campaign.edad_65mas,
      'hombres': campaign.hombres,
      'mujeres': campaign.mujeres,
      'sites_count': sites_count,
      'periods_count': periods_count
    }
    campaign_items.append(schemas.CampaignListItem(**campaign_dict))

  total_pages = (total + limit - 1) // limit if limit > 0 else 0
  current_page = skip // limit if limit > 0 else 0

  return schemas.PaginatedCampaigns(
    data=campaign_items,
    total=total,
    page=current_page,
    page_size=limit,
    total_pages=total_pages
  )


@app.get('/campaigns/{campaign_id}', response_model=schemas.CampaignDetail)
def read_campaign(campaign_id: str, db: Session = Depends(get_db)):
  campaign = crud.get_campaign(db, campaign_id)
  if campaign is None:
    raise HTTPException(status_code=404, detail='Campaign not found')

  return campaign


@app.get(
  '/campaigns/{campaign_id}/sites/summary',
  response_model=schemas.SitesSummary
)
def get_campaign_sites_summary(
  campaign_id: str,
  db: Session = Depends(get_db)
):
  campaign = crud.get_campaign(db, campaign_id)
  if campaign is None:
    raise HTTPException(status_code=404, detail='Campaign not found')

  return crud.get_sites_summary(db, campaign_id)


@app.get(
  '/campaigns/{campaign_id}/periods/summary',
  response_model=schemas.PeriodsSummary
)
def get_campaign_periods_summary(
  campaign_id: str,
  db: Session = Depends(get_db)
):
  campaign = crud.get_campaign(db, campaign_id)
  if campaign is None:
    raise HTTPException(status_code=404, detail='Campaign not found')

  return crud.get_periods_summary(db, campaign_id)


@app.get(
  '/campaigns/{campaign_id}/summary',
  response_model=schemas.CampaignSummary
)
def get_campaign_demographic_summary(
  campaign_id: str,
  db: Session = Depends(get_db)
):
  campaign = crud.get_campaign(db, campaign_id)
  if campaign is None:
    raise HTTPException(status_code=404, detail='Campaign not found')

  return crud.get_campaign_summary(campaign)
