"""
Comprehensive API endpoint tests.
"""
from datetime import date

import pytest
from fastapi.testclient import TestClient

from app import models


def create_campaign(
  db,
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


def create_site(db, campaign_name: str, codigo: str) -> models.CampaignSite:
  """Helper to create a site."""
  site = models.CampaignSite(
    campaign_name=campaign_name,
    codigo_del_sitio=codigo,
    tipo_de_mueble="Billboard",
    tipo_de_anuncio="Digital",
    estado="Activo",
    municipio="TestCity",
    zm="ZM1",
    frecuencia_catorcenal=1.0,
    frecuencia_mensual=2.0,
    impactos_catorcenal=100,
    impactos_mensuales=200,
    alcance_mensual=0.5
  )
  db.add(site)
  db.commit()
  return site


def create_period(db, campaign_name: str, period: str) -> models.CampaignPeriod:
  """Helper to create a period."""
  p = models.CampaignPeriod(
    campaign_name=campaign_name,
    period=period,
    impactos_periodo_personas=1000,
    impactos_periodo_vehiculos=500
  )
  db.add(p)
  db.commit()
  return p


class TestRootEndpoint:
  """Tests for root endpoint."""

  def test_root_returns_welcome(self, client: TestClient):
    """Root returns welcome message."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Campaign Analytics API"}


class TestHealthEndpoint:
  """Tests for health check endpoint."""

  def test_health_returns_ok(self, client: TestClient):
    """Health check returns ok status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


class TestCampaignsListEndpoint:
  """Tests for GET /campaigns/ endpoint."""

  def test_empty_campaigns(self, client: TestClient, db):
    """Returns empty list when no campaigns."""
    response = client.get("/campaigns/")
    assert response.status_code == 200
    data = response.json()
    assert data["data"] == []
    assert data["total"] == 0
    assert data["page"] == 0
    assert data["total_pages"] == 0

  def test_returns_campaigns(self, client: TestClient, db):
    """Returns campaigns with correct structure."""
    create_campaign(db, "TestCamp")
    response = client.get("/campaigns/")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 1
    assert data["data"][0]["name"] == "TestCamp"
    assert "sites_count" in data["data"][0]
    assert "periods_count" in data["data"][0]

  def test_pagination_defaults(self, client: TestClient, db):
    """Default pagination is 5 items per page."""
    for i in range(7):
      create_campaign(db, f"Camp{i}")
    
    response = client.get("/campaigns/")
    data = response.json()
    assert len(data["data"]) == 5
    assert data["total"] == 7
    assert data["page_size"] == 5

  def test_pagination_custom(self, client: TestClient, db):
    """Custom pagination works."""
    for i in range(10):
      create_campaign(db, f"Camp{i}")
    
    response = client.get("/campaigns/?skip=3&limit=2")
    data = response.json()
    assert len(data["data"]) == 2
    assert data["page"] == 1

  def test_filter_by_type(self, client: TestClient, db):
    """Filters by campaign type."""
    create_campaign(db, "Monthly", tipo="mensual")
    create_campaign(db, "Biweekly", tipo="catorcenal")
    
    response = client.get("/campaigns/?tipo_campania=mensual")
    data = response.json()
    assert data["total"] == 1
    assert data["data"][0]["tipo_campania"] == "mensual"

  def test_filter_by_dates(self, client: TestClient, db):
    """Filters by date range."""
    create_campaign(
      db, "Jan", inicio=date(2023, 1, 1), fin=date(2023, 1, 31)
    )
    create_campaign(
      db, "Mar", inicio=date(2023, 3, 1), fin=date(2023, 3, 31)
    )
    
    response = client.get(
      "/campaigns/?fecha_inicio=2023-01-01&fecha_fin=2023-01-31"
    )
    data = response.json()
    assert data["total"] == 1
    assert data["data"][0]["name"] == "Jan"

  def test_invalid_limit_zero(self, client: TestClient):
    """Returns 422 for limit=0."""
    response = client.get("/campaigns/?limit=0")
    assert response.status_code == 422

  def test_invalid_skip_negative(self, client: TestClient):
    """Returns 422 for negative skip."""
    response = client.get("/campaigns/?skip=-1")
    assert response.status_code == 422

  def test_limit_over_max(self, client: TestClient, db):
    """Limit over 100 returns 422."""
    response = client.get("/campaigns/?limit=101")
    assert response.status_code == 422


class TestCampaignDetailEndpoint:
  """Tests for GET /campaigns/{campaign_id} endpoint."""

  def test_returns_campaign_detail(self, client: TestClient, db):
    """Returns campaign details."""
    create_campaign(db, "DetailCamp")
    response = client.get("/campaigns/DetailCamp")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DetailCamp"

  def test_not_found(self, client: TestClient, db):
    """Returns 404 for non-existent campaign."""
    response = client.get("/campaigns/NonExistent")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


class TestSitesSummaryEndpoint:
  """Tests for GET /campaigns/{id}/sites/summary endpoint."""

  def test_returns_sites_summary(self, client: TestClient, db):
    """Returns sites summary with correct structure."""
    create_campaign(db, "SitesCamp")
    create_site(db, "SitesCamp", "S001")
    create_site(db, "SitesCamp", "S002")
    
    response = client.get("/campaigns/SitesCamp/sites/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_sites"] == 2
    assert "by_type" in data
    assert "by_municipio" in data

  def test_not_found(self, client: TestClient, db):
    """Returns 404 for non-existent campaign."""
    response = client.get("/campaigns/NonExistent/sites/summary")
    assert response.status_code == 404


class TestPeriodsSummaryEndpoint:
  """Tests for GET /campaigns/{id}/periods/summary endpoint."""

  def test_returns_periods_summary(self, client: TestClient, db):
    """Returns periods summary with correct structure."""
    create_campaign(db, "PeriodsCamp")
    create_period(db, "PeriodsCamp", "2023-01")
    create_period(db, "PeriodsCamp", "2023-02")
    
    response = client.get("/campaigns/PeriodsCamp/periods/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_periods"] == 2
    assert len(data["data"]) == 2

  def test_not_found(self, client: TestClient, db):
    """Returns 404 for non-existent campaign."""
    response = client.get("/campaigns/NonExistent/periods/summary")
    assert response.status_code == 404


class TestCampaignSummaryEndpoint:
  """Tests for GET /campaigns/{id}/summary endpoint."""

  def test_returns_demographic_summary(self, client: TestClient, db):
    """Returns demographic summary with correct structure."""
    create_campaign(db, "DemoCamp")
    
    response = client.get("/campaigns/DemoCamp/summary")
    assert response.status_code == 200
    data = response.json()
    assert "nse_distribution" in data
    assert "age_distribution" in data
    assert "gender_distribution" in data
    assert len(data["nse_distribution"]) == 6
    assert len(data["age_distribution"]) == 7
    assert len(data["gender_distribution"]) == 2

  def test_not_found(self, client: TestClient, db):
    """Returns 404 for non-existent campaign."""
    response = client.get("/campaigns/NonExistent/summary")
    assert response.status_code == 404


class TestCORSMiddleware:
  """Tests for CORS configuration."""

  def test_cors_middleware_present(self, client: TestClient):
    """CORS middleware is configured."""
    from app.main import app
    middleware_classes = [m.cls.__name__ for m in app.user_middleware]
    assert "CORSMiddleware" in middleware_classes


class TestPaginationEdgeCases:
  """Edge case tests for pagination."""

  def test_last_page(self, client: TestClient, db):
    """Last page returns remaining items."""
    for i in range(7):
      create_campaign(db, f"Camp{i}")
    
    response = client.get("/campaigns/?skip=5&limit=5")
    data = response.json()
    assert len(data["data"]) == 2
    assert data["page"] == 1

  def test_skip_beyond_total(self, client: TestClient, db):
    """Skip beyond total returns empty list."""
    for i in range(3):
      create_campaign(db, f"Camp{i}")
    
    response = client.get("/campaigns/?skip=100&limit=5")
    data = response.json()
    assert len(data["data"]) == 0
    assert data["total"] == 3

  def test_total_pages_calculation(self, client: TestClient, db):
    """Total pages calculated correctly."""
    for i in range(11):
      create_campaign(db, f"Camp{i}")
    
    response = client.get("/campaigns/?limit=5")
    data = response.json()
    assert data["total_pages"] == 3
