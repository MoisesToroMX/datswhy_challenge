import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app, get_db
from app.database import Base

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
  SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module")
def db_engine():
  Base.metadata.create_all(bind=engine)
  yield engine
  Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db(db_engine):
  connection = db_engine.connect()
  transaction = connection.begin()
  session = TestingSessionLocal(bind=connection)
  yield session
  session.close()
  transaction.rollback()
  connection.close()

@pytest.fixture(scope="function")
def client(db):
  # Override the get_db dependency to use the testing session
  def override_get_db():
    try:
      yield db
    finally:
      pass # Do not close here, let the fixture handle it

  app.dependency_overrides[get_db] = override_get_db
  with TestClient(app) as c:
    yield c
  app.dependency_overrides.clear()
