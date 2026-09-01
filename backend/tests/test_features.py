"""Tests for hotels, discovery, package estimation and AI chat routes."""

from fastapi.testclient import TestClient

import app.main as m

client = TestClient(m.app)


def test_hotel_cities():
    resp = client.get("/hotels/cities")
    assert resp.status_code == 200
    assert "Goa" in resp.json()["cities"]
    assert "Paris" in resp.json()["cities"]


def test_hotel_search():
    resp = client.post("/hotels/search", json={"destination": "Goa", "guests": 2})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_demo"] is True
    assert data["total"] > 0
    for h in data["hotels"]:
        assert h["city"] == "Goa"
        assert h["price_per_night"] > 0


def test_hotel_search_filters():
    resp = client.post(
        "/hotels/search",
        json={"destination": "Goa", "guests": 2, "max_price": 3000, "min_rating": 4.5},
    )
    assert resp.status_code == 200
    for h in resp.json()["hotels"]:
        assert h["price_per_night"] <= 3000
        assert h["rating"] >= 4.5


def test_hotel_compare():
    hotels = [
        {"name": "A", "price_per_night": 1000, "rating": 3.0, "distance_from_attractions": 5, "amenities": ["WiFi"]},
        {"name": "B", "price_per_night": 3000, "rating": 5.0, "distance_from_attractions": 1, "amenities": ["WiFi", "Pool", "Spa"]},
    ]
    resp = client.post("/hotels/compare", json={"hotels": hotels})
    assert resp.status_code == 200
    data = resp.json()
    assert data["cheapest"]["name"] == "A"
    assert data["top_rated"]["name"] == "B"
    assert data["closest"]["name"] == "B"


def test_hotel_recommend():
    resp = client.post(
        "/hotels/recommend",
        json={"destination": "Goa", "guests": 2, "budget": 3000, "travel_purpose": "leisure"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommendation"] is not None
    assert data["reason"]
    assert isinstance(data["alternatives"], list)


def test_package_estimate():
    resp = client.post(
        "/package/estimate",
        json={
            "origin": "Chennai",
            "destination": "Goa",
            "departure_date": "2024-12-20",
            "return_date": "2024-12-23",
            "travelers": 2,
            "food_style": "budget",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["nights"] == 3
    assert data["travelers"] == 2
    assert data["estimated_total"] > 0
    assert data["transport"]["options_count"] > 0
    assert data["hotel"]["matches"] > 0
    assert data["currency"] == "INR"


def test_discover_nearby():
    resp = client.get("/discover/nearby", params={"city": "Goa"})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["restaurants"]) > 0
    assert len(data["activities"]) > 0
    assert data["is_demo"] is True


def test_discover_food():
    resp = client.get("/discover/food", params={"city": "Goa", "budget": 600})
    assert resp.status_code == 200
    for r in resp.json()["recommendations"]:
        assert r["avg_cost"] <= 600


def test_discover_time_plan():
    resp = client.get("/discover/time-plan", params={"city": "Goa", "time_of_day": "evening"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["time_of_day"] == "evening"
    assert len(data["activities"]) > 0
    assert len(data["restaurants"]) > 0


def test_where_should_i_go():
    resp = client.get("/discover/where-should-i-go", params={"preferences": "beach party"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["recommendation"]["city"] == "goa"
    assert data["tip"]


def test_packing_list():
    resp = client.get("/discover/packing-list", params={"city": "Ooty", "days": 5})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) >= 5


def test_destination_guide():
    resp = client.get("/discover/destination-guide", params={"city": "Kochi"})
    assert resp.status_code == 200
    data = resp.json()
    assert "day1" in data["itinerary"]
    assert "day2" in data["itinerary"]
    assert data["snapshot"]


def test_ai_chat_food():
    resp = client.post("/ai/chat", json={"message": "best food in Goa under 500"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "rules"
    assert data["is_ai_generated"] is False
    assert data["data_source"] == "rules_engine"
    assert "food" in data["answer"].lower()


def test_ai_chat_hotel():
    resp = client.post("/ai/chat", json={"message": "recommend a hotel in Paris"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "rules"
    assert "Paris" in data["answer"] or "Maison" in data["answer"]


def test_ai_chat_packing():
    resp = client.post("/ai/chat", json={"message": "what should I pack for 3 days in Ooty"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["intent"] == "rules"
    assert "pack" in data["answer"].lower()


def test_ai_chat_open_ended():
    resp = client.post("/ai/chat", json={"message": "hello there"})
    assert resp.status_code == 200
    data = resp.json()
    # Falls back to mock generative provider (always works)
    assert data["answer"]