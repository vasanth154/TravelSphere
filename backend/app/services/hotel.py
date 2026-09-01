"""Deterministic hotel comparison and recommendation engine."""

from __future__ import annotations

from typing import Any

# User facing weights for the "best value" hotel ranking.
HOTEL_WEIGHTS = {"price": 0.4, "rating": 0.35, "location": 0.15, "amenities": 0.1}


def _score(hotel: dict[str, Any]) -> float:
    """Normalize and weigh hotel attributes into a 0-1 'best value' score."""
    price = float(hotel.get("price_per_night", 0) or 0)
    rating = float(hotel.get("rating", 0) or 0)
    distance = float(hotel.get("distance_from_attractions", 5) or 5)

    # Lower price is better; cap at 20000 for normalization.
    price_score = max(0.0, min(1.0, 1 - price / 20000)) if price else 0.0
    rating_score = max(0.0, min(1.0, rating / 5))
    location_score = max(0.0, min(1.0, 1 - distance / 10))
    amenity_count = len(hotel.get("amenities", []) or [])
    amenities_score = max(0.0, min(1.0, amenity_count / 8))

    return (
        HOTEL_WEIGHTS["price"] * price_score
        + HOTEL_WEIGHTS["rating"] * rating_score
        + HOTEL_WEIGHTS["location"] * location_score
        + HOTEL_WEIGHTS["amenities"] * amenities_score
    )


def compare_hotels(hotels: list[dict[str, Any]]) -> dict[str, Any]:
    """Return the cheapest, top rated, closest and best-value hotel."""
    if not hotels:
        return {"cheapest": None, "top_rated": None, "closest": None, "best_value": None, "ranked": []}

    cheapest = min(hotels, key=lambda h: float(h.get("price_per_night", 0) or 0))
    top_rated = max(hotels, key=lambda h: float(h.get("rating", 0) or 0))
    closest = min(hotels, key=lambda h: float(h.get("distance_from_attractions", 99) or 99))
    ranked = sorted(hotels, key=_score, reverse=True)
    return {
        "cheapest": cheapest,
        "top_rated": top_rated,
        "closest": closest,
        "best_value": ranked[0],
        "ranked": ranked,
    }


def recommend_hotel(
    hotels: list[dict[str, Any]],
    budget: float | None = None,
    travel_purpose: str | None = None,
) -> dict[str, Any]:
    """Pick the best hotel for a user's budget and trip purpose."""
    if not hotels:
        return {"hotel": None, "reason": "No hotels matched your criteria."}

    candidates = hotels
    if budget is not None:
        affordable = [h for h in hotels if float(h.get("price_per_night", 0) or 0) <= budget]
        if affordable:
            candidates = affordable

    ranked = sorted(candidates, key=_score, reverse=True)
    hotel = ranked[0]

    mode = "balanced"
    if travel_purpose in ("business", "work"):
        hotel = max(ranked, key=lambda h: len(h.get("amenities", []) or []))
        mode = "amenities"
    elif travel_purpose in ("couple", "romantic"):
        hotel = max(ranked, key=lambda h: float(h.get("rating", 0) or 0))
        mode = "rating"
    elif budget is not None:
        hotel = min(ranked, key=lambda h: float(h.get("price_per_night", 0) or 0))
        mode = "budget"

    reason = (
        f"Recommended for a {mode or 'balanced'} stay: {hotel['name']} at "
        f"₹{float(hotel['price_per_night']):,.0f}/night with a {hotel['rating']} rating "
        f"and {hotel['distance_from_attractions']} km from the main attractions."
    )
    return {"hotel": hotel, "reason": reason}