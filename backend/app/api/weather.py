"""Weather-aware trip planning routes."""

from datetime import date, datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..services.weather import (
    WeatherServiceError,
    analyze_and_optimize,
    build_alerts,
    build_weather_response,
    get_forecast_cached,
)

router = APIRouter(prefix="/weather", tags=["weather"])

UNAVAILABLE_DETAIL = "Weather information is temporarily unavailable."


def _validate_dates(start_date: str | None, end_date: str | None) -> tuple[str, str]:
    def _parse(value: str | None, default: date) -> date:
        if value is None:
            return default
        try:
            return datetime.fromisoformat(value).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    today = datetime.now(timezone.utc).date()
    start = _parse(start_date, today)
    end = _parse(end_date, start + timedelta(days=4))
    if end < start:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date.")
    return start.isoformat(), end.isoformat()


class OptimizeRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    start_date: str | None = None
    end_date: str | None = None
    itinerary: list[dict[str, Any]] = Field(..., description="Days with activities")
    trip_type: str | None = None
    preferences: str | list[str] | None = None
    lat: float | None = None
    lon: float | None = None


@router.get("")
async def get_weather(
    destination: str = Query(..., min_length=1, description="City or area name"),
    lat: float | None = Query(None, ge=-90, le=90),
    lon: float | None = Query(None, ge=-180, le=180),
    start_date: str | None = Query(None, description="YYYY-MM-DD (defaults to today)"),
    end_date: str | None = Query(None, description="YYYY-MM-DD (defaults to start + 4 days)"),
    trip_type: str | None = None,
    preferences: str | list[str] | None = None,
):
    """Return forecast, alerts and activity recommendations for a destination."""
    start, end = _validate_dates(start_date, end_date)
    try:
        return await build_weather_response(
            destination=destination,
            start_date=start,
            end_date=end,
            lat=lat,
            lon=lon,
            trip_type=trip_type,
            preferences=preferences,
        )
    except WeatherServiceError as exc:
        raise HTTPException(status_code=503, detail=UNAVAILABLE_DETAIL) from exc


@router.post("/optimize")
async def optimize_itinerary(request: OptimizeRequest):
    """Suggest weather-aware changes to a draft itinerary."""
    if not request.itinerary:
        raise HTTPException(status_code=400, detail="No itinerary provided for optimization")

    start, end = _validate_dates(request.start_date, request.end_date)
    try:
        forecast = await get_forecast_cached(
            request.destination,
            lat=request.lat,
            lon=request.lon,
            start_date=start,
            end_date=end,
        )
    except WeatherServiceError as exc:
        raise HTTPException(status_code=503, detail=UNAVAILABLE_DETAIL) from exc

    result = analyze_and_optimize(
        itinerary=request.itinerary,
        forecast=forecast,
        destination=request.destination,
        trip_type=request.trip_type,
        preferences=request.preferences,
    )
    return {
        "destination": request.destination,
        "weather_available": True,
        "forecast": [
            {
                "date": day.date,
                "condition": day.condition,
                "description": day.description,
                "temperature": day.temperature,
                "precipitation_probability": day.precipitation_probability,
            }
            for day in forecast
        ],
        "alerts": [
            {
                "type": a["type"],
                "severity": a["severity"],
                "title": a["title"],
                "message": a["message"],
                "date": a["date"],
            }
            for a in build_alerts(forecast)
        ],
        "changes": result["changes"],
        "moved": result["moved"],
        "summary": result["summary"],
    }