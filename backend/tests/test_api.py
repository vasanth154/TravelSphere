"""API tests for TravelSphere backend."""

from fastapi.testclient import TestClient

import app.main as m

client = TestClient(m.app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


def test_root():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "TravelSphere" in resp.json()["message"]


def test_search_transport():
    body = {
        "origin": "Chennai",
        "destination": "Madurai",
        "departure_date": "2024-12-20",
        "travelers": 2,
        "budget": 2000,
    }
    resp = client.post("/search/transport", json=body)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_options"] > 0
    for opt in data["options"]:
        assert opt["is_demo"] is True
        assert opt["data_source"] == "mock_demo"


def test_compare_transport():
    options = [
        {"id": "1", "mode": "train", "price": 300, "duration": 270, "comfort": 8, "convenience": 7, "fuel_cost": 0, "toll_cost": 0},
        {"id": "2", "mode": "flight", "price": 1800, "duration": 75, "comfort": 8, "convenience": 9, "fuel_cost": 0, "toll_cost": 0},
    ]
    resp = client.post("/transport/compare", json={"options": options})
    assert resp.status_code == 200
    data = resp.json()
    assert data["cheapest"]["id"] == "1"
    assert data["fastest"]["id"] == "2"
