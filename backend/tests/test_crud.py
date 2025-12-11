"""
Comprehensive tests for CRUD operations.
"""
from datetime import date

import pytest
from sqlalchemy.orm import Session

from app import crud, models


def create_campaign(
  db: Session,
  name: str,
  tipo: str = "mensual",
  inicio: date = date(2023, 1, 1),
  fin: date = date(2023, 1, 31)
) -> models.Campaign:
  """Helper to create a campaign."""
  campaign = models.Campaign(
    name=name,
    tipo_campania=tipo,
    fecha_inicio=inicio,
    fecha_fin=fin,
    universo_zona_metro=1000,
    impactos_personas=500,
    impactos_vehiculos=200,
    frecuencia_calculada=1.5,
    frecuencia_promedio=1.2,
    alcance=800,
    nse_ab=0.1,
    nse_c=0.2,
    nse_cmas=0.15,
    nse_d=0.25,
    nse_dmas=0.2,
    nse_e=0.1,
    edad_0a14=0.1,
    edad_15a19=0.1,
    edad_20a24=0.1,
    edad_25a34=0.2,
    edad_35a44=0.2,
    edad_45a64=0.2,
    edad_65mas=0.1,
    hombres=0.5,
    mujeres=0.5
  )
  db.add(campaign)
  db.commit()
  db.refresh(campaign)
  return campaign


def create_site(
  db: Session,
  campaign_name: str,
  codigo: str,
  tipo_mueble: str = "Billboard",
  municipio: str = "TestMunicipio"
) -> models.CampaignSite:
  """Helper to create a campaign site."""
  site = models.CampaignSite(
    campaign_name=campaign_name,
    codigo_del_sitio=codigo,
    tipo_de_mueble=tipo_mueble,
    tipo_de_anuncio="Digital",
    estado="Activo",
    municipio=municipio,
    zm="ZM1",
    frecuencia_catorcenal=1.0,
    frecuencia_mensual=2.0,
    impactos_catorcenal=100,
    impactos_mensuales=200,
    alcance_mensual=0.5
  )
  db.add(site)
  db.commit()
  db.refresh(site)
  return site


def create_period(
  db: Session,
  campaign_name: str,
  period: str
) -> models.CampaignPeriod:
  """Helper to create a campaign period."""
  p = models.CampaignPeriod(
    campaign_name=campaign_name,
    period=period,
    impactos_periodo_personas=1000,
    impactos_periodo_vehiculos=500
  )
  db.add(p)
  db.commit()
  db.refresh(p)
  return p


class TestGetCampaignsWithCount:
  """Tests for get_campaigns_with_count function."""

  def test_empty_database(self, db: Session):
    """Returns empty list when no campaigns exist."""
    campaigns, count = crud.get_campaigns_with_count(db)
    assert campaigns == []
    assert count == 0

  def test_returns_campaigns(self, db: Session):
    """Returns campaigns from database."""
    create_campaign(db, "Camp1")
    create_campaign(db, "Camp2")
    campaigns, count = crud.get_campaigns_with_count(db)
    assert len(campaigns) == 2
    assert count == 2

  def test_pagination_skip(self, db: Session):
    """Skip parameter works correctly."""
    for i in range(5):
      create_campaign(db, f"Camp{i}")
    campaigns, count = crud.get_campaigns_with_count(db, skip=2, limit=10)
    assert len(campaigns) == 3
    assert count == 5

  def test_pagination_limit(self, db: Session):
    """Limit parameter works correctly."""
    for i in range(10):
      create_campaign(db, f"Camp{i}")
    campaigns, count = crud.get_campaigns_with_count(db, skip=0, limit=3)
    assert len(campaigns) == 3
    assert count == 10

  def test_filter_by_tipo_campania(self, db: Session):
    """Filters by campaign type."""
    create_campaign(db, "Monthly1", tipo="mensual")
    create_campaign(db, "Monthly2", tipo="mensual")
    create_campaign(db, "Biweekly1", tipo="catorcenal")
    
    campaigns, count = crud.get_campaigns_with_count(
      db, tipo_campania="mensual"
    )
    assert len(campaigns) == 2
    assert count == 2
    assert all(c.tipo_campania == "mensual" for c in campaigns)

  def test_filter_by_date_range(self, db: Session):
    """Filters by date range."""
    create_campaign(
      db, "Jan", inicio=date(2023, 1, 1), fin=date(2023, 1, 31)
    )
    create_campaign(
      db, "Feb", inicio=date(2023, 2, 1), fin=date(2023, 2, 28)
    )
    create_campaign(
      db, "Mar", inicio=date(2023, 3, 1), fin=date(2023, 3, 31)
    )
    
    # Filter for February only
    campaigns, count = crud.get_campaigns_with_count(
      db,
      fecha_inicio=date(2023, 2, 1),
      fecha_fin=date(2023, 2, 28)
    )
    assert count == 1
    assert campaigns[0].name == "Feb"

  def test_filter_by_start_date_range(self, db: Session):
    """Date filter checks if start date is within range."""
    create_campaign(
      db, "January", inicio=date(2023, 1, 15), fin=date(2023, 2, 15)
    )
    
    # Filter for January - should find it
    campaigns, count = crud.get_campaigns_with_count(
      db,
      fecha_inicio=date(2023, 1, 1),
      fecha_fin=date(2023, 1, 31)
    )
    assert count == 1
    assert campaigns[0].name == "January"

    # Filter for February - should NOT find it (it started in Jan)
    campaigns, count = crud.get_campaigns_with_count(
      db,
      fecha_inicio=date(2023, 2, 1),
      fecha_fin=date(2023, 2, 28)
    )
    assert count == 0

  def test_combined_filters(self, db: Session):
    """Multiple filters work together."""
    create_campaign(
      db, "M1", tipo="mensual", inicio=date(2023, 1, 1), fin=date(2023, 1, 31)
    )
    create_campaign(
      db, "C1", tipo="catorcenal", inicio=date(2023, 1, 1), fin=date(2023, 1, 15)
    )
    create_campaign(
      db, "M2", tipo="mensual", inicio=date(2023, 2, 1), fin=date(2023, 2, 28)
    )
    
    campaigns, count = crud.get_campaigns_with_count(
      db,
      tipo_campania="mensual",
      fecha_inicio=date(2023, 1, 1),
      fecha_fin=date(2023, 1, 31)
    )
    assert count == 1
    assert campaigns[0].name == "M1"


class TestGetCampaign:
  """Tests for get_campaign function."""

  def test_returns_campaign_by_name(self, db: Session):
    """Returns campaign when found."""
    create_campaign(db, "TestCampaign")
    result = crud.get_campaign(db, "TestCampaign")
    assert result is not None
    assert result.name == "TestCampaign"

  def test_returns_none_when_not_found(self, db: Session):
    """Returns None when campaign not found."""
    result = crud.get_campaign(db, "NonExistent")
    assert result is None


class TestGetCampaignSitesCount:
  """Tests for get_campaign_sites_count function."""

  def test_returns_zero_when_no_sites(self, db: Session):
    """Returns 0 when no sites exist."""
    create_campaign(db, "NoSites")
    count = crud.get_campaign_sites_count(db, "NoSites")
    assert count == 0

  def test_returns_correct_count(self, db: Session):
    """Returns correct site count."""
    create_campaign(db, "WithSites")
    create_site(db, "WithSites", "S001")
    create_site(db, "WithSites", "S002")
    create_site(db, "WithSites", "S003")
    
    count = crud.get_campaign_sites_count(db, "WithSites")
    assert count == 3


class TestGetCampaignPeriodsCount:
  """Tests for get_campaign_periods_count function."""

  def test_returns_zero_when_no_periods(self, db: Session):
    """Returns 0 when no periods exist."""
    create_campaign(db, "NoPeriods")
    count = crud.get_campaign_periods_count(db, "NoPeriods")
    assert count == 0

  def test_returns_correct_count(self, db: Session):
    """Returns correct period count."""
    create_campaign(db, "WithPeriods")
    create_period(db, "WithPeriods", "2023-01")
    create_period(db, "WithPeriods", "2023-02")
    
    count = crud.get_campaign_periods_count(db, "WithPeriods")
    assert count == 2


class TestGetSitesSummary:
  """Tests for get_sites_summary function."""

  def test_empty_sites(self, db: Session):
    """Returns empty summary when no sites."""
    create_campaign(db, "Empty")
    summary = crud.get_sites_summary(db, "Empty")
    assert summary["total_sites"] == 0
    assert summary["by_type"] == []
    assert summary["by_municipio"] == []

  def test_aggregates_by_type(self, db: Session):
    """Aggregates sites by furniture type."""
    create_campaign(db, "Agg")
    create_site(db, "Agg", "S1", tipo_mueble="Billboard")
    create_site(db, "Agg", "S2", tipo_mueble="Billboard")
    create_site(db, "Agg", "S3", tipo_mueble="Mupie")
    
    summary = crud.get_sites_summary(db, "Agg")
    assert summary["total_sites"] == 3
    
    by_type = {item["tipo_de_mueble"]: item for item in summary["by_type"]}
    assert by_type["Billboard"]["count"] == 2
    assert by_type["Mupie"]["count"] == 1

  def test_aggregates_by_municipio(self, db: Session):
    """Aggregates sites by municipality."""
    create_campaign(db, "Muni")
    create_site(db, "Muni", "S1", municipio="CityA")
    create_site(db, "Muni", "S2", municipio="CityA")
    create_site(db, "Muni", "S3", municipio="CityB")
    
    summary = crud.get_sites_summary(db, "Muni")
    by_muni = {item["municipio"]: item for item in summary["by_municipio"]}
    assert by_muni["CityA"]["count"] == 2
    assert by_muni["CityB"]["count"] == 1


class TestGetPeriodsSummary:
  """Tests for get_periods_summary function."""

  def test_empty_periods(self, db: Session):
    """Returns empty summary when no periods."""
    create_campaign(db, "NoPer")
    summary = crud.get_periods_summary(db, "NoPer")
    assert summary["total_periods"] == 0
    assert summary["data"] == []

  def test_returns_sorted_periods(self, db: Session):
    """Returns periods sorted by name."""
    create_campaign(db, "Sorted")
    create_period(db, "Sorted", "2023-03")
    create_period(db, "Sorted", "2023-01")
    create_period(db, "Sorted", "2023-02")
    
    summary = crud.get_periods_summary(db, "Sorted")
    periods = [p["period"] for p in summary["data"]]
    assert periods == ["2023-01", "2023-02", "2023-03"]


class TestGetCampaignSummary:
  """Tests for get_campaign_summary function."""

  def test_returns_distributions(self, db: Session):
    """Returns all demographic distributions."""
    camp = create_campaign(db, "Demo")
    summary = crud.get_campaign_summary(camp)
    
    assert "nse_distribution" in summary
    assert "age_distribution" in summary
    assert "gender_distribution" in summary
    
    assert len(summary["nse_distribution"]) == 6
    assert len(summary["age_distribution"]) == 7
    assert len(summary["gender_distribution"]) == 2

  def test_distribution_values(self, db: Session):
    """Distribution values match campaign data."""
    camp = create_campaign(db, "Values")
    summary = crud.get_campaign_summary(camp)
    
    gender = {g["label"]: g["value"] for g in summary["gender_distribution"]}
    assert gender["Hombres"] == 0.5
    assert gender["Mujeres"] == 0.5
