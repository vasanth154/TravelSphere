"""TravelSphere local discovery routes (restaurants, activities, plans)."""

from __future__ import annotations

from fastapi import APIRouter, Query

from ..services import discovery

router = APIRouter(prefix="/discover", tags=["discover"])


@router.get("/cities")
async def discover_cities():
    """List all demo discovery cities."""
    return {"cities": sorted(discovery.DISCOVERY.keys())}


@router.get("/nearby")
async def nearby(
    city: str = Query(..., min_length=1),
    category: str | None = Query(None),
    max_cost: float | None = Query(None, ge=0),
):
    """Discover local spots (restaurants, activities, transport) near a city."""
    return discovery.discover_nearby(city, category=category, max_cost=max_cost)


@router.get("/food")
async def food(
    city: str = Query(..., min_length=1),
    style: str | None = Query(None),
    budget: float | None = Query(None, ge=0),
):
    """Recommend restaurants by food style and budget."""
    return discovery.recommend_food(city, style=style, budget=budget)


@router.get("/time-plan")
async def time_plan(
    city: str = Query(..., min_length=1),
    time_of_day: str = Query("evening"),
    travelers: int = Query(1, ge=1),
):
    """Build a time-of-day itinerary (morning/afternoon/evening/night)."""
    return discovery.plan_by_time(city, time_of_day, travelers)


@router.get("/where-should-i-go")
async def where_should_i_go(
    preferences: str | None = Query(None),
    budget: float | None = Query(None, ge=0),
):
    """Recommend a destination from natural-language preferences."""
    return discovery.where_should_i_go(preferences=preferences, budget=budget)


@router.get("/packing-list")
async def packing_list(
    city: str = Query(..., min_length=1),
    days: int = Query(3, ge=1),
    season: str | None = Query(None),
):
    """Generate a smart packing checklist."""
    return discovery.packing_list(city, days=days, season=season)


@router.get("/destination-guide")
async def destination_guide(city: str = Query(..., min_length=1)):
    """Return a short destination guide with day-wise plan."""
    return discovery.destination_guide(city)