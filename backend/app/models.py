from sqlalchemy import Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from .database import Base


class Campaign(Base):
  __tablename__ = "campaigns"

  name = Column(String, primary_key=True)
  tipo_campania = Column(String)
  fecha_inicio = Column(Date)
  fecha_fin = Column(Date)
  universo_zona_metro = Column(Integer)
  impactos_personas = Column(Integer)
  impactos_vehiculos = Column(Integer)
  frecuencia_calculada = Column(Float)
  frecuencia_promedio = Column(Float)
  alcance = Column(Integer)
  nse_ab = Column(Float)
  nse_c = Column(Float)
  nse_cmas = Column(Float)
  nse_d = Column(Float)
  nse_dmas = Column(Float)
  nse_e = Column(Float)
  edad_0a14 = Column(Float)
  edad_15a19 = Column(Float)
  edad_20a24 = Column(Float)
  edad_25a34 = Column(Float)
  edad_35a44 = Column(Float)
  edad_45a64 = Column(Float)
  edad_65mas = Column(Float)
  hombres = Column(Float)
  mujeres = Column(Float)

  periods = relationship("CampaignPeriod", back_populates="campaign")
  sites = relationship("CampaignSite", back_populates="campaign")


class CampaignPeriod(Base):
  __tablename__ = "campaign_periods"

  id = Column(Integer, primary_key=True)
  campaign_name = Column(String, ForeignKey("campaigns.name"))
  period = Column(String)
  impactos_periodo_personas = Column(Integer)
  impactos_periodo_vehiculos = Column(Integer)

  campaign = relationship("Campaign", back_populates="periods")


class CampaignSite(Base):
  __tablename__ = "campaign_sites"

  id = Column(Integer, primary_key=True)
  campaign_name = Column(String, ForeignKey("campaigns.name"))
  codigo_del_sitio = Column(String)
  tipo_de_mueble = Column(String)
  tipo_de_anuncio = Column(String)
  estado = Column(String)
  municipio = Column(String)
  zm = Column(String)
  frecuencia_catorcenal = Column(Float)
  frecuencia_mensual = Column(Float)
  impactos_catorcenal = Column(Integer)
  impactos_mensuales = Column(Integer)
  alcance_mensual = Column(Float)

  campaign = relationship("Campaign", back_populates="sites")
