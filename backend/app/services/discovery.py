"""TravelSphere local discovery engine.

Deterministic recommendation data for restaurants, activities, local transport
and time-of-day plans across demo destinations. The rule-based path is the
fallback that always works even without a live AI provider.
"""

from __future__ import annotations

from typing import Any

# Demo discovery data keyed by city.
DISCOVERY: dict[str, dict[str, Any]] = {
    "goa": {
        "restaurants": [
            {"name": "Fisherman's Wharf", "cuisine": "Seafood", "avg_cost": 900, "rating": 4.6, "type": "Casual Dining", "must_try": "Tandoori Pomfret"},
            {"name": "Café Alchemia", "cuisine": "Continental", "avg_cost": 550, "rating": 4.4, "type": "Cafe", "must_try": "Wood-fired Pizza"},
            {"name": "Vinayak Family Restaurant", "cuisine": "Goan", "avg_cost": 350, "rating": 4.3, "type": "Local", "must_try": "Fish Thali"},
        ],
        "activities": [
            {"name": "Baga Beach Sunset Cruise", "category": "Water", "cost": 800, "duration": 120, "rating": 4.7},
            {"name": "Dudhsagar Falls Day Trip", "category": "Adventure", "cost": 1200, "duration": 360, "rating": 4.8},
            {"name": "Anjuna Flea Market", "category": "Shopping", "cost": 0, "duration": 120, "rating": 4.2},
            {"name": "Fort Aguada", "category": "Heritage", "cost": 100, "duration": 90, "rating": 4.5},
        ],
        "local_transport": [
            {"name": "Scooter Rental", "cost_per_day": 350, "type": "Bike"},
            {"name": "Taxi (per km)", "cost_per_day": 500, "type": "Cab"},
        ],
        "weather_note": "Best visited Nov–Feb for pleasant evenings.",
        "snapshot": "Goa: beaches by day, shacks and parties by night.",
    },
    "kochi": {
        "restaurants": [
            {"name": "Fort House Restaurant", "cuisine": "Kerala", "avg_cost": 700, "rating": 4.5, "type": "Waterfront", "must_try": "Karimeen Pollichathu"},
            {"name": "Kashi Art Cafe", "cuisine": "Cafe", "avg_cost": 450, "rating": 4.3, "type": "Cafe", "must_try": "Banana Bread"},
        ],
        "activities": [
            {"name": "Chinese Fishing Nets", "category": "Heritage", "cost": 50, "duration": 60, "rating": 4.4},
            {"name": "Backwater Houseboat Cruise", "category": "Water", "cost": 2500, "duration": 240, "rating": 4.8},
            {"name": "Mattancherry Palace", "category": "Heritage", "cost": 20, "duration": 90, "rating": 4.3},
        ],
        "local_transport": [{"name": "Auto / Tuk Tuk", "cost_per_day": 250, "type": "Auto"}],
        "weather_note": "Tropical; carry an umbrella for brief showers.",
        "snapshot": "Kochi: heritage lanes, backwaters and spice markets.",
    },
    "ooty": {
        "restaurants": [
            {"name": "Earl's Secret", "cuisine": "Continental", "avg_cost": 600, "rating": 4.5, "type": "Fine Dining", "must_try": "Broccoli Cheese Soup"},
            {"name": "MTR Ooty", "cuisine": "South Indian", "avg_cost": 300, "rating": 4.3, "type": "Local", "must_try": "Idli Vada"},
        ],
        "activities": [
            {"name": "Nilgiri Mountain Railway", "category": "Scenic", "cost": 400, "duration": 360, "rating": 4.9},
            {"name": "Botanical Gardens", "category": "Nature", "cost": 50, "duration": 120, "rating": 4.4},
            {"name": "Doddabetta Peak", "category": "Nature", "cost": 150, "duration": 120, "rating": 4.5},
        ],
        "local_transport": [{"name": "Local Taxi", "cost_per_day": 700, "type": "Cab"}],
        "weather_note": "Cool year-round; pack a light jacket.",
        "snapshot": "Ooty: rolling tea gardens, toy train and crisp mountain air.",
    },
    "paris": {
        "restaurants": [
            {"name": "Le Comptoir du Relais", "cuisine": "French", "avg_cost": 4500, "rating": 4.7, "type": "Bistro", "must_try": "Confit de Canard"},
            {"name": "L'As du Fallafel", "cuisine": "Middle Eastern", "avg_cost": 800, "rating": 4.5, "type": "Street", "must_try": "Falafel Pita"},
        ],
        "activities": [
            {"name": "Eiffel Tower", "category": "Landmark", "cost": 1900, "duration": 120, "rating": 4.8},
            {"name": "Louvre Museum", "category": "Museum", "cost": 1700, "duration": 240, "rating": 4.9},
            {"name": "Seine River Cruise", "category": "Water", "cost": 1400, "duration": 60, "rating": 4.6},
        ],
        "local_transport": [{"name": "Metro Pass (day)", "cost_per_day": 750, "type": "Metro"}],
        "weather_note": "Light layers; evenings cool. Check strike alerts for transit.",
        "snapshot": "Paris: art, cafés and monuments made for strolling.",
    },
    "tokyo": {
        "restaurants": [
            {"name": "Ichiran Shibuya", "cuisine": "Ramen", "avg_cost": 900, "rating": 4.5, "type": "Chain", "must_try": "Tonkotsu Ramen"},
            {"name": "Sushi Dai", "cuisine": "Sushi", "avg_cost": 3500, "rating": 4.7, "type": "Tsukiji", "must_try": "Omakase"},
        ],
        "activities": [
            {"name": "Senso-ji Temple", "category": "Heritage", "cost": 0, "duration": 120, "rating": 4.7},
            {"name": "Shibuya Crossing", "category": "Landmark", "cost": 0, "duration": 60, "rating": 4.4},
            {"name": "TeamLab Planets", "category": "Museum", "cost": 3400, "duration": 120, "rating": 4.8},
        ],
        "local_transport": [{"name": "Suica / IC Card", "cost_per_day": 500, "type": "Metro"}],
        "weather_note": "Check monsoon and typhoon season before travel.",
        "snapshot": "Tokyo: neon nights, quiet temples and incredible food.",
    },
    "dubai": {
        "restaurants": [
            {"name": "Pierchic", "cuisine": "Seafood", "avg_cost": 12000, "rating": 4.8, "type": "Fine Dining", "must_try": "Lobster"},
            {"name": "Al Fanar", "cuisine": "Emirati", "avg_cost": 3000, "rating": 4.5, "type": "Local", "must_try": "Machboos"},
        ],
        "activities": [
            {"name": "Burj Khalifa At The Top", "category": "Landmark", "cost": 6000, "duration": 90, "rating": 4.7},
            {"name": "Desert Safari", "category": "Adventure", "cost": 8000, "duration": 300, "rating": 4.8},
            {"name": "Dubai Mall & Fountain", "category": "Shopping", "cost": 0, "duration": 180, "rating": 4.5},
        ],
        "local_transport": [{"name": "Metro Red Line", "cost_per_day": 600, "type": "Metro"}],
        "weather_note": "Very hot summer; plan indoor mornings.",
        "snapshot": "Dubai: skyscrapers, desert thrills and luxury malls.",
    },
    "mumbai": {
        "restaurants": [
            {"name": "Trishna", "cuisine": "Seafood", "avg_cost": 2000, "rating": 4.6, "type": "Legendary", "must_try": "Butter Garlic Crab"},
            {"name": "Sardar Pav Bhaji", "cuisine": "Street", "avg_cost": 150, "rating": 4.4, "type": "Street", "must_try": "Pav Bhaji"},
            {"name": "Britannia", "cuisine": "Parsi", "avg_cost": 900, "rating": 4.5, "type": "Heritage", "must_try": "Berry Pulao"},
        ],
        "activities": [
            {"name": "Gateway of India", "category": "Landmark", "cost": 0, "duration": 60, "rating": 4.5},
            {"name": "Marine Drive Walk", "category": "Scenic", "cost": 0, "duration": 90, "rating": 4.6},
            {"name": "Elephanta Caves", "category": "Heritage", "cost": 400, "duration": 240, "rating": 4.4},
        ],
        "local_transport": [{"name": "Local Train (day pass)", "cost_per_day": 100, "type": "Train"}],
        "weather_note": "Monsoon Jun–Sep; pack an umbrella.",
        "snapshot": "Mumbai: maximalist energy, street food and sea breezes.",
    },
    "delhi": {
        "restaurants": [
            {"name": "Karim's", "cuisine": "Mughlai", "avg_cost": 800, "rating": 4.6, "type": "Legendary", "must_try": "Mutton Burrah"},
            {"name": "Haldiram's", "cuisine": "North Indian", "avg_cost": 300, "rating": 4.2, "type": "Chain", "must_try": "Chole Bhature"},
        ],
        "activities": [
            {"name": "Red Fort", "category": "Heritage", "cost": 350, "duration": 150, "rating": 4.5},
            {"name": "India Gate", "category": "Landmark", "cost": 0, "duration": 60, "rating": 4.4},
            {"name": "Qutub Minar", "category": "Heritage", "cost": 300, "duration": 120, "rating": 4.5},
        ],
        "local_transport": [{"name": "Metro (day pass)", "cost_per_day": 200, "type": "Metro"}],
        "weather_note": "Winter is peak; pack layers for Dec–Feb.",
        "snapshot": "Delhi: seven cities of history, one of them modern.",
    },
    "chennai": {
        "restaurants": [
            {"name": "Anjappar Chettinad", "cuisine": "Chettinad", "avg_cost": 500, "rating": 4.4, "type": "Local", "must_try": "Chicken Chettinad"},
            {"name": "Murugan Idli Shop", "cuisine": "South Indian", "avg_cost": 200, "rating": 4.3, "type": "Local", "must_try": "Idli Sambar"},
        ],
        "activities": [
            {"name": "Marina Beach", "category": "Scenic", "cost": 0, "duration": 90, "rating": 4.3},
            {"name": "Kapaleeshwarar Temple", "category": "Heritage", "cost": 0, "duration": 90, "rating": 4.5},
            {"name": "Mahabalipuram (day trip)", "category": "Heritage", "cost": 600, "duration": 360, "rating": 4.7},
        ],
        "local_transport": [{"name": "Metro + Auto", "cost_per_day": 250, "type": "Metro"}],
        "weather_note": "Hot and humid; carry water and a cap.",
        "snapshot": "Chennai: temple culture, Marina winds and filter coffee.",
    },
    "madurai": {
        "restaurants": [
            {"name": "Konar Mess", "cuisine": "Chettinad", "avg_cost": 250, "rating": 4.5, "type": "Local", "must_try": "Mutton Chukka"},
            {"name": "Ammu Mess", "cuisine": "South Indian", "avg_cost": 200, "rating": 4.4, "type": "Local", "must_try": "Parotta Salna"},
        ],
        "activities": [
            {"name": "Meenakshi Amman Temple", "category": "Heritage", "cost": 0, "duration": 150, "rating": 4.8},
            {"name": "Thirumalai Nayak Palace", "category": "Heritage", "cost": 100, "duration": 90, "rating": 4.4},
        ],
        "local_transport": [{"name": "Auto", "cost_per_day": 200, "type": "Auto"}],
        "weather_note": "Hot; visit temple early morning.",
        "snapshot": "Madurai: a living temple city with vibrant bazaars.",
    },
}

DEFAULT_CITY = "chennai"


def _dish_image(keyword: str, lock: int = 1) -> str:
    """Return a real food photo for a dish keyword (loremflickr animal/cuisine source)."""
    q = ",".join([keyword.replace(" ", ","), "food"])
    return f"https://loremflickr.com/600/400/{q}?lock={lock}"


def _restaurant_with_images(r: dict[str, Any]) -> dict[str, Any]:
    """Attach appetizing food + dish photos to a restaurant recommendation."""
    dish = r.get("must_try", r.get("name", ""))
    lock = abs(hash(r["name"])) % 9000
    return {
        **r,
        "image": _dish_image(r.get("cuisine", "food"), lock),
        "dish_image": _dish_image(dish, (lock + 7) % 9000),
    }


def _data(city: str | None) -> dict[str, Any]:
    key = (city or "").strip().lower()
    for cname, data in DISCOVERY.items():
        if key in cname or cname in key:
            return data
    return DISCOVERY[DEFAULT_CITY]


def discover_nearby(city: str, category: str | None = None, max_cost: float | None = None) -> dict[str, Any]:
    """Return discovery data for a city, optionally filtered."""
    data = _data(city)
    result: dict[str, Any] = {
        "city": city,
        "restaurants": [],
        "activities": [],
        "local_transport": data["local_transport"],
        "weather_note": data["weather_note"],
        "snapshot": data["snapshot"],
        "is_demo": True,
    }
    for r in data["restaurants"]:
        if max_cost is None or r["avg_cost"] <= max_cost:
            result["restaurants"].append(_restaurant_with_images(r))
    for a in data["activities"]:
        if max_cost is None or a["cost"] <= max_cost:
            result["activities"].append(a)
    if category:
        result["activities"] = [a for a in result["activities"] if a["category"].lower() == category.lower()]
    return result


def recommend_food(city: str, style: str | None = None, budget: float | None = None) -> dict[str, Any]:
    """Recommend restaurants based on food style and budget."""
    data = _data(city)
    restaurants = list(data["restaurants"])
    if budget is not None:
        affordable = [r for r in restaurants if r["avg_cost"] <= budget]
        if affordable:
            restaurants = affordable
    # style preferences reorder
    style_key = (style or "").lower()
    ordered = sorted(
        restaurants,
        key=lambda r: (
            (style_key in r["cuisine"].lower() or style_key in r["type"].lower()),
            r["rating"],
        ),
        reverse=True,
    )
    return {"city": city, "recommendations": [_restaurant_with_images(r) for r in ordered], "is_demo": True}


def plan_by_time(city: str, time_of_day: str, travelers: int = 1) -> dict[str, Any]:
    """Build a time-of-day plan (morning/afternoon/evening/night)."""
    data = _data(city)
    time_key = (time_of_day or "").lower()
    mapping = {
        "morning": ("Heritage", "Breakfast"),
        "afternoon": ("Water", "Lunch"),
        "evening": ("Scenic", "Dinner"),
        "night": ("Adventure", "Nightlife"),
    }
    cat, meal = mapping.get(time_key, mapping["evening"])
    activities = [a for a in data["activities"] if a["category"] == cat] or data["activities"]
    restaurants = sorted(data["restaurants"], key=lambda r: r["rating"], reverse=True)
    return {
        "city": city,
        "time_of_day": time_key,
        "meal": meal,
        "activities": activities[:2],
        "restaurants": [_restaurant_with_images(r) for r in restaurants[:2]],
        "tip": f"Best {time_key} in {city.capitalize()}: enjoy a {meal.lower()} then explore the {cat.lower()} spots.",
        "is_demo": True,
    }


def where_should_i_go(preferences: str | None = None, budget: float | None = None) -> dict[str, Any]:
    """Recommend a destination based on preferences (beach, heritage, food, etc.)."""
    pref_key = (preferences or "").lower()

    profile = {
        "goa": ("goa", "beach", "Beaches", "1", "party beach town with water sports"),
        "kochi": ("kochi", "heritage", "Heritage", "2", "backwaters and colonial heritage"),
        "ooty": ("ooty", "nature", "Hill stations", "3", "cool hills and gardens"),
        "paris": ("paris", "heritage", "International cities", "4", "art, cafes and iconic sights"),
        "tokyo": ("tokyo", "culture", "International cities", "4", "neon culture and temples"),
        "dubai": ("dubai", "luxury", "International cities", "4", "luxury and desert thrills"),
        "mumbai": ("mumbai", "food", "Metro destinations", "5", "street food and sea"),
        "delhi": ("delhi", "heritage", "Metro destinations", "5", "historic monuments"),
        "chennai": ("chennai", "heritage", "Metro destinations", "5", "temples and beaches"),
    }

    keyword_map = {
        "beach": ["goa"],
        "bache": ["goa"],
        "heritage": ["kochi", "delhi", "chennai", "madurai"],
        "nature": ["ooty", "kochi"],
        "hill": ["ooty"],
        "food": ["mumbai", "madurai"],
        "temple": ["madurai", "chennai"],
        "luxury": ["dubai"],
        "party": ["goa"],
        "adventure": ["dubai", "goa"],
        "culture": ["kochi", "tokyo"],
        "shopping": ["dubai", "goa"],
        "romantic": ["kochi", "paris"],
        "family": ["ooty", "goa"],
        "solo": ["tokyo", "goa"],
    }

    matched: list[str] = []
    for keyword, candidates in keyword_map.items():
        if keyword in pref_key:
            matched.extend(candidates)

    budget_flag = ""
    if budget is not None:
        budget_flag = " (fits a budgetable package)"
        if budget < 5000:
            matched = [d for d in matched if d in ("madurai", "chennai", "ooty")] or ["madurai"]

    if not matched:
        matched = ["goa", "kochi"]

    deduped: list[str] = []
    for m in matched:
        if m not in deduped:
            deduped.append(m)

    final = []
    for key in deduped:
        entry = profile[key]
        final.append(
            {"city": entry[0], "category": entry[2], "tier": entry[3], "why": entry[4]}
        )
    return {
        "recommendation": final[0],
        "alternatives": final[1:3],
        "preferences": preferences,
        "tip": f"Based on '{preferences or 'your preferences'}', start with {final[0]['city'].capitalize()}{budget_flag}.",
        "is_demo": True,
    }


def packing_list(city: str, days: int = 3, season: str | None = None) -> dict[str, Any]:
    """Generate a smart packing checklist for a destination and stay length."""
    data = _data(city)
    note = data["weather_note"].lower()
    items = [
        "Travel documents & ID",
        "Chargers + power bank",
        "Medicines & first-aid kit",
        "Comfortable walking shoes",
    ]
    if any(w in note for w in ("cool", "winter", "cold")):
        items.extend(["Light jacket", "Warm layers", "Scarf"])
    if any(w in note for w in ("hot", "humid", "summer", "umbrella", "rain")):
        items.extend(["Sunscreen", "Cap/hat", "Water bottle", "Umbrella/poncho"])
    if days >= 5:
        items.extend(["Laundry kit", "Portable laundry bag"])
    return {
        "city": city,
        "days": days,
        "season": season,
        "items": items,
        "tip": "Pack versatile layers and carry a small daybag for sightseeing.",
        "is_demo": True,
    }


def destination_guide(city: str) -> dict[str, Any]:
    """Short destination guide with a day-wise plan for a weekend."""
    data = _data(city)
    activities = data["activities"]
    restaurants = data["restaurants"]
    plan = {
        "day1": {
            "morning": activities[0]["name"] if activities else "",
            "afternoon": restaurants[0]["name"] if restaurants else "",
            "evening": activities[1]["name"] if len(activities) > 1 else "",
        },
        "day2": {
            "morning": activities[2]["name"] if len(activities) > 2 else "Free exploration",
            "afternoon": "Local market visit",
            "evening": "Sunset point / night lights",
        },
    }
    return {
        "city": city,
        "snapshot": data["snapshot"],
        "weather_note": data["weather_note"],
        "restaurants": [_restaurant_with_images(r) for r in restaurants],
        "activities": activities,
        "local_transport": data["local_transport"],
        "itinerary": plan,
        "is_demo": True,
    }