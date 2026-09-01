"""TravelSphere hotel search, comparison and package estimation routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..providers.hotel import MockHotelProvider
from ..providers.transport import MockTransportProvider
from ..services.hotel import compare_hotels, recommend_hotel

router = APIRouter(tags=["hotels"])

provider = MockHotelProvider()
transport_provider = MockTransportProvider()


class HotelSearchRequest(BaseModel):
    destination: str = Field(..., min_length=1)
    checkin: str | None = None
    checkout: str | None = None
    guests: int = Field(2, ge=1, le=20)
    max_price: float | None = Field(None, ge=0)
    min_rating: float | None = Field(None, ge=0, le=5)
    amenities: list[str] | None = None


class HotelRecommendRequest(HotelSearchRequest):
    budget: float | None = Field(None, ge=0)
    travel_purpose: str | None = Field(
        None, description="business | couple/romantic | family | leisure | any"
    )


class PackageRequest(BaseModel):
    origin: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    departure_date: str
    return_date: str | None = None
    travelers: int = Field(1, ge=1, le=10)
    budget: float | None = Field(None, ge=0)
    food_style: str = Field("budget", description="budget | midrange | luxury")


daily_food_cost = {"budget": 600, "midrange": 1500, "luxury": 2500}


@router.get("/hotels/cities")
async def hotel_cities():
    """List destination cities with demo hotels available."""
    return {"cities": provider.get_supported_cities()}


@router.post("/hotels/search")
async def hotel_search(request: HotelSearchRequest):
    """Search demo hotels matching destination and filters."""
    hotels = provider.search(
        destination=request.destination,
        checkin=request.checkin or "",
        checkout=request.checkout or "",
        guests=request.guests,
        max_price=request.max_price,
        min_rating=request.min_rating,
        amenities=request.amenities,
    )
    return {"destination": request.destination, "hotels": hotels, "total": len(hotels), "is_demo": True}


@router.post("/hotels/compare")
async def hotel_compare(payload: dict[str, Any]):
    """Compare a set of hotels and return category winners."""
    hotels = payload.get("hotels") or []
    if not hotels:
        raise HTTPException(status_code=400, detail="No hotels provided for comparison")
    return compare_hotels(hotels)


@router.post("/hotels/recommend")
async def hotel_recommend(request: HotelRecommendRequest):
    """AI-style hotel recommendation based on budget and trip purpose."""
    hotels = provider.search(
        destination=request.destination,
        checkin=request.checkin or "",
        checkout=request.checkout or "",
        guests=request.guests,
        max_price=request.max_price,
        min_rating=request.min_rating,
        amenities=request.amenities,
    )
    recommendation = recommend_hotel(hotels, budget=request.budget, travel_purpose=request.travel_purpose)
    return {
        "destination": request.destination,
        "recommendation": recommendation["hotel"],
        "reason": recommendation["reason"],
        "alternatives": compare_hotels(hotels)["ranked"][:3],
        "is_demo": True,
    }


@router.post("/package/estimate")
async def package_estimate(request: PackageRequest):
    """Estimate the complete trip cost: transport + hotel + food + local + activities."""
    try:
        transport_options = transport_provider.search(
            origin=request.origin,
            destination=request.destination,
            departure_date=request.departure_date,
            return_date=request.return_date,
            travelers=request.travelers,
            budget=request.budget,
        )
    except Exception:  # noqa: BLE001 - package estimate must degrade gracefully
        transport_options = []

    hotels = provider.search(destination=request.destination, guests=request.travelers)

    nights = 1
    if request.return_date and request.departure_date:
        from datetime import date

        try:
            start = date.fromisoformat(request.departure_date)
            end = date.fromisoformat(request.return_date)
            nights = max(1, (end - start).days)
        except ValueError:
            nights = 1

    transport_prices = [float(o.price) for o in transport_options] if transport_options else []
    hotel_prices = [float(h["price_per_night"]) for h in hotels] if hotels else []

    transport_one_way = min(transport_prices) if transport_prices else None
    transport_round = (
        (transport_one_way * 2 * request.travelers) if transport_one_way is not None and request.return_date
        else (transport_one_way * request.travelers if transport_one_way is not None else None)
    )
    hotel_room = min(hotel_prices) if hotel_prices else None
    total_nights = nights
    hotel_rooms = max(1, (request.travelers + 1) // 2)
    hotel_cost = (hotel_room * total_nights * hotel_rooms) if hotel_room is not None else None

    food_per_day = daily_food_cost.get(request.food_style, 600) * request.travelers
    food_cost = food_per_day * nights
    local_cost = 400 * nights
    activities_cost = 500 * nights

    subtotal = (transport_round or 0) + (hotel_cost or 0) + food_cost + local_cost + activities_cost

    return {
        "origin": request.origin,
        "destination": request.destination,
        "nights": nights,
        "travelers": request.travelers,
        "transport": {
            "options_count": len(transport_prices),
            "one_way_cheapest": transport_one_way,
            "round_trip": transport_round,
            "fares": sorted(transport_prices)[:5],
        },
        "hotel": {
            "matches": len(hotels),
            "cheapest_per_night": hotel_room,
            "est_total": hotel_cost,
            "rooms": hotel_rooms,
        },
        "food": {"style": request.food_style, "est_total": food_cost, "per_day": food_per_day},
        "local_travel": {"est_total": local_cost, "per_day": 400},
        "activities": {"est_total": activities_cost, "per_day": 500},
        "estimated_total": subtotal,
        "currency": "INR",
        "is_demo": True,
    }