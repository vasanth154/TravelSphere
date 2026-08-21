"""Tests for the multi-model AI recommendation endpoint."""

from fastapi.testclient import TestClient

import app.main as m

client = TestClient(m.app)


def test_ai_recommend_returns_structured_output():
    options = [
        {"id": "1", "mode": "train", "service_name": "Vaigai", "price": 350, "duration": 270, "comfort": 9, "convenience": 8, "is_demo": True},
        {"id": "2", "mode": "flight", "service_name": "IndiGo", "price": 2200, "duration": 75, "comfort": 7, "convenience": 9, "is_demo": True},
    ]
    resp = client.post("/ai/recommend", json={
        "origin": "Chennai",
        "destination": "Madurai",
        "options": options,
        "profile": "budget_sensitive",
        "preference": "mock",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_ai_generated"] is True
    assert "recommendation" in data
    # best_option_id, if present, must reference a real option
    if data.get("best_option_id"):
        assert data["best_option_id"] in {"1", "2"}


def test_ai_recommend_requires_options():
    resp = client.post("/ai/recommend", json={
        "origin": "Chennai", "destination": "Madurai", "options": []
    })
    assert resp.status_code == 400
