"""Tests for the weather-aware trip planning feature."""

from fastapi.testclient import TestClient

import app.main as m
from app.providers.weather import WeatherDay
from app.services.weather import (
    WeatherCategory,
    build_alerts,
    classify,
    clear_cache,
    recommend_activities,
)

client = TestClient(m.app)


def _day(**overrides):
    base = {
        "date": "2026-08-25",
        "temperature": 30.0,
        "temperature_min": 24.0,
        "feels_like": 31.0,
        "condition": "clear",
        "description": "Clear skies",
        "precipitation_probability": 10,
        "rainfall_mm": 0.0,
        "wind_speed": 8.0,
        "humidity": 55,
        "available": True,
    }
    base.update(overrides)
    return WeatherDay(**base)


# ---------------------------------------------------------------------------
# /weather endpoint
# ---------------------------------------------------------------------------

def test_weather_forecast_returns_days():
    resp = client.get(
        "/weather",
        params={
            "destination": "Goa",
            "start_date": "2026-08-25",
            "end_date": "2026-08-29",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["available"] is True
    assert data["source"] == "MockWeatherProvider"
    assert len(data["forecast"]) == 5
    for day in data["forecast"]:
        assert day["date"] >= "2026-08-25"
        assert day["condition"] in {
            "clear", "partly_cloudy", "cloudy", "rain", "heavy_rain", "thunderstorm",
        }
        assert "temperature" in day
        assert "category" in day
        assert "icon" in day
    assert len(data["alerts"]) >= 0
    assert len(data["recommendations"]) == 5
    for rec in data["recommendations"]:
        assert rec["category"] in {c.value for c in WeatherCategory}
        assert len(rec["activities"]) >= 1


def test_weather_requires_destination():
    resp = client.get("/weather")
    assert resp.status_code == 422


def test_weather_invalid_dates():
    resp = client.get(
        "/weather",
        params={"destination": "Goa", "start_date": "2026-08-30", "end_date": "2026-08-25"},
    )
    assert resp.status_code == 400


def test_weather_provider_failure_returns_503(monkeypatch):
    clear_cache()

    class BrokenProvider:
        name = "BrokenProvider"

        async def get_forecast(self, *args, **kwargs):
            raise RuntimeError("provider down")

    monkeypatch.setattr(
        "app.services.weather.get_weather_provider", lambda *a, **k: BrokenProvider()
    )
    resp = client.get(
        "/weather", params={"destination": "Goa", "start_date": "2026-08-25", "end_date": "2026-08-26"}
    )
    assert resp.status_code == 503
    assert resp.json()["detail"] == "Weather information is temporarily unavailable."
    clear_cache()


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def test_classify_clear_day_is_good_outdoor():
    assert classify(_day()) == WeatherCategory.GOOD_OUTDOOR


def test_classify_rain_is_moderate():
    assert classify(_day(condition="rain", precipitation_probability=72, rainfall_mm=11)) == WeatherCategory.MODERATE


def test_classify_heavy_rain_is_poor_outdoor():
    assert classify(_day(condition="heavy_rain", precipitation_probability=90, rainfall_mm=32)) == WeatherCategory.POOR_OUTDOOR


def test_classify_thunderstorm_is_extreme():
    assert classify(_day(condition="thunderstorm", precipitation_probability=96, rainfall_mm=46)) == WeatherCategory.EXTREME


def test_classify_extreme_heat_is_extreme():
    assert classify(_day(temperature=43.0, feels_like=44.0, condition="clear")) == WeatherCategory.EXTREME


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

def test_recommendations_are_outdoor_on_good_days():
    recs = recommend_activities(_day(), destination="Goa")
    assert recs["category"] == "good_outdoor"
    assert all(a["type"] == "outdoor" for a in recs["activities"])
    assert recs["warning"] is None


def test_recommendations_are_indoor_on_bad_days():
    recs = recommend_activities(
        _day(condition="heavy_rain", precipitation_probability=92, rainfall_mm=40), destination="Goa"
    )
    assert recs["category"] == "poor_outdoor"
    assert all(a["type"] == "indoor" for a in recs["activities"])
    assert recs["warning"] is not None


def test_recommendations_warn_on_extreme_days():
    recs = recommend_activities(
        _day(condition="thunderstorm", precipitation_probability=98, rainfall_mm=50), destination="Goa"
    )
    assert recs["category"] == "extreme"
    assert recs["warning"] is not None


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

def test_alerts_include_severe_and_rain():
    alerts = build_alerts(
        [
            _day(condition="heavy_rain", precipitation_probability=90, rainfall_mm=35),
            _day(condition="thunderstorm", precipitation_probability=96, rainfall_mm=46),
        ]
    )
    types = {a["type"] for a in alerts}
    assert "rain" in types
    assert "severe" in types


def test_alerts_include_heat():
    alerts = build_alerts([_day(temperature=39.0, condition="clear")])
    assert any(a["type"] == "heat" for a in alerts)


def test_alerts_empty_for_mild_weather():
    assert build_alerts([_day()]) == []


# ---------------------------------------------------------------------------
# Optimization
# ---------------------------------------------------------------------------

def test_optimize_moves_outdoor_activities_from_rainy_day():
    from app.services.weather import analyze_and_optimize

    forecast = [
        _day(date="2026-08-25", condition="heavy_rain", precipitation_probability=92, rainfall_mm=40),
        _day(date="2026-08-26", condition="clear"),
    ]
    itinerary = [
        {
            "date": "2026-08-25",
            "activities": [
                {"title": "Beach & water sports", "type": "outdoor"},
                {"title": "Museum visit", "type": "indoor"},
            ],
        }
    ]
    result = analyze_and_optimize(itinerary, forecast, destination="Goa")
    assert result["changes"], "expected a change for the rainy day"
    change = result["changes"][0]
    assert change["best_alternative_date"] == "2026-08-26"
    assert change["moved"] and change["moved"][0]["title"] == "Beach & water sports"
    # The indoor activity should be preserved in the "after" plan.
    assert any(a["title"] == "Museum visit" for a in change["after"])
    # Replacements should be indoor.
    assert change["after"][0]["type"] == "indoor"


def test_optimize_no_changes_for_good_weather():
    from app.services.weather import analyze_and_optimize

    forecast = [_day(date="2026-08-25", condition="clear")]
    itinerary = [
        {"date": "2026-08-25", "activities": [{"title": "Trek", "type": "outdoor"}]}
    ]
    result = analyze_and_optimize(itinerary, forecast)
    assert result["changes"] == []
    assert "looks weather-friendly" in result["summary"]


# ---------------------------------------------------------------------------
# /weather/optimize endpoint
# ---------------------------------------------------------------------------

def test_optimize_endpoint_returns_changes():
    resp = client.post(
        "/weather/optimize",
        json={
            "destination": "Goa",
            "start_date": "2026-08-25",
            "end_date": "2026-08-26",
            "itinerary": [
                {
                    "date": "2026-08-25",
                    "activities": [{"title": "Beach day", "type": "outdoor"}],
                }
            ],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "changes" in data
    assert "summary" in data
    assert len(data["forecast"]) == 2


def test_optimize_endpoint_requires_itinerary():
    resp = client.post("/weather/optimize", json={"destination": "Goa", "itinerary": []})
    assert resp.status_code == 400


# ---------------------------------------------------------------------------
# /ai/itinerary endpoint
# ---------------------------------------------------------------------------

def test_ai_itinerary_rules_engine_with_weather():
    resp = client.post(
        "/ai/itinerary",
        json={
            "destination": "Goa",
            "start_date": "2026-08-25",
            "end_date": "2026-08-29",
            "travelers": 2,
            "trip_type": "leisure",
            "preference": "mock",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_ai_generated"] is False
    assert data["data_source"] == "rules_engine"
    assert data["weather_available"] is True
    assert len(data["itinerary"]) == 5
    for day in data["itinerary"]:
        assert day["date"] >= "2026-08-25"
        assert "weather" in day
        assert day["weather"]["category"] in {c.value for c in WeatherCategory}
        assert len(day["activities"]) >= 1
    assert data["summary"]


def test_ai_itinerary_invalid_dates():
    resp = client.post(
        "/ai/itinerary",
        json={
            "destination": "Goa",
            "start_date": "2026-08-30",
            "end_date": "2026-08-25",
        },
    )
    assert resp.status_code == 400


def test_ai_itinerary_requires_dates():
    resp = client.post("/ai/itinerary", json={"destination": "Goa", "start_date": "2026-08-25"})
    assert resp.status_code == 422


def test_ai_itinerary_falls_back_when_weather_fails(monkeypatch):
    class BrokenProvider:
        name = "BrokenProvider"

        async def get_forecast(self, *args, **kwargs):
            raise RuntimeError("provider down")

    monkeypatch.setattr(
        "app.services.weather.get_weather_provider", lambda *a, **k: BrokenProvider()
    )
    resp = client.post(
        "/ai/itinerary",
        json={
            "destination": "Goa",
            "start_date": "2026-08-25",
            "end_date": "2026-08-26",
            "preference": "mock",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["weather_available"] is False
    assert data["weather_note"] == "Weather information is temporarily unavailable."
    assert len(data["itinerary"]) == 2  # still produces a usable plan
    clear_cache()