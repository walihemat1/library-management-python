# tests/conftest.py
import os
import database
import pytest
from app import create_app


@pytest.fixture()
def app(tmp_path, monkeypatch):
    # Use temp DB for each test
    test_db = tmp_path / "test_library.db"
    monkeypatch.setattr(database, "DB_NAME", str(test_db))

    app = create_app()
    app.config.update(TESTING=True)
    yield app


@pytest.fixture()
def client(app):
    return app.test_client()
