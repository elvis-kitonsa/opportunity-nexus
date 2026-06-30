"""Shared pytest fixtures.

Integration tests run against an in-memory SQLite database so the suite needs no
external services (and runs identically in CI). The app's `get_db` dependency is
overridden to use the test session; `func.now()` server defaults and SQLAlchemy
`Enum` columns both work on SQLite, so the production models map cleanly.
"""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

# Importing app.models registers every table on Base.metadata.
from app.models import Base
from app.api.deps import get_db
from app.main import app

# A single shared in-memory connection (StaticPool) so every session sees the
# same database for the duration of a test.
engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
    future=True,
)
TestingSessionLocal = sessionmaker(
    bind=engine, autoflush=False, autocommit=False, expire_on_commit=False, future=True
)


@pytest.fixture(autouse=True)
def _create_schema() -> Generator[None, None, None]:
    """Give every test a fresh, empty schema."""
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    """A direct DB session for arranging fixtures / asserting state."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """A TestClient with the app's DB dependency pointed at the test database."""

    def override_get_db() -> Generator[Session, None, None]:
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
