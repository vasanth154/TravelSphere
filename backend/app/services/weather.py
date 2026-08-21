"""Weather-aware trip planning service.

Responsibilities:
- Classify a day's weather into a travel category (GOOD_OUTDOOR / MODERATE /
  POOR_OUTDOOR / EXTREME).
- Recommend indoor/outdoor activities per day, aware of trip type and
  traveler preferences.
- Build human-friendly weather alerts.
- Optimize an itinerary by moving/repairing conflicting outdoor activities.
- Generate a deterministic (non-AI) weather-aware itinerary used as a fallback
  and in demos when no AI provider key is configured.
- Cache forecast lookups in memory with a TTL.
"""

import os
import time
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any

from ..providers.weather import WeatherDay, get_weather_provider


class WeatherCategory(str, Enum):
    GOOD_OUTDOOR = "good_outdoor"
    MODERATE = "moderate"
    POOR_OUTDOOR = "poor_outdoor"
    EXTREME = "extreme"

    @property
    def label(self) -> str:
        return {
            WeatherCategory.GOOD_OUTDOOR: "Great for the outdoors",
            WeatherCategory.MODERATE: "Mix of indoor & outdoor",
            WeatherCategory.POOR_OUTDOOR: "Mostly indoor",
            WeatherCategory.EXTREME: "Avoid the outdoors",
        }[self]


CATEGORY_ICON = {
    WeatherCategory.GOOD_OUTDOOR: "☀️",
    WeatherCategory.MODERATE: "⛅",
    WeatherCategory.POOR_OUTDOOR: "🌧️",
    WeatherCategory.EXTREME: "⛈️",
}

CONDITION_ICON = {
    "clear": "☀️",
    "partly_cloudy": "⛅",
    "cloudy": "☁️",
    "fog": "🌫️",
    "mist": "🌫️",
    "drizzle": "🌦️",
    "rain": "🌧️",
    "heavy_rain": "🌧️",
    "thunderstorm": "⛈️",
    "snow": "🌨️",
    "wind": "🌬️",
    "extreme_heat": "🔥",
}


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def classify(day: WeatherDay) -> WeatherCategory:
    """Classify a single forecast day into a travel category."""
    cond = (day.condition or "").lower()
    temp = day.temperature if day.temperature is not None else 0.0
    feels = day.feels_like if day.feels_like is not None else temp
    precip = day.precipitation_probability or 0
    rain = day.rainfall_mm or 0.0
    wind = day.wind_speed or 0.0

    if cond in {"thunderstorm", "storm", "tornado", "hurricane", "severe"}:
        return WeatherCategory.EXTREME
    if wind >= 60 or feels >= 42 or temp >= 42:
        return WeatherCategory.EXTREME
    if cond in {"heavy_rain"} or precip >= 85 or rain >= 30 or wind >= 45 or temp >= 40 or feels >= 40:
        return WeatherCategory.POOR_OUTDOOR
    if cond in {"rain", "drizzle", "shower"} or precip >= 60 or rain >= 10 or wind >= 30 or temp >= 36 or feels >= 36:
        return WeatherCategory.MODERATE
    if cond in {"clear", "partly_cloudy", "sunny"}:
        return WeatherCategory.GOOD_OUTDOOR
    return WeatherCategory.MODERATE


# ---------------------------------------------------------------------------
# Recommendations
# ---------------------------------------------------------------------------

INDOOR_ACTIVITIES: list[dict[str, str]] = [
    {"icon": "🎨", "title": "Art & history museums", "type": "indoor", "category": "sightseeing"},
    {"icon": "🕌", "title": "Temples, mosques & monuments", "type": "indoor", "category": "culture"},
    {"icon": "☕", "title": "Café hopping & local food trails", "type": "indoor", "category": "food"},
    {"icon": "📚", "title": "Heritage library visits", "type": "indoor", "category": "sightseeing"},
    {"icon": "🛍️", "title": "Bazaars & covered markets", "type": "indoor", "category": "shopping"},
    {"icon": "🎭", "title": "Cultural performances & shows", "type": "indoor", "category": "culture"},
    {"icon": "🧘", "title": "Cooking or craft workshops", "type": "indoor", "category": "experience"},
    {"icon": "🏛️", "title": "Palaces & heritage interiors", "type": "indoor", "category": "sightseeing"},
    {"icon": "🍽️", "title": "Signature rooftop dinners", "type": "indoor", "category": "food"},
    {"icon": "🎮", "title": "Bowling, arcades & trampoline parks", "type": "indoor", "category": "fun"},
]

OUTDOOR_ACTIVITIES: list[dict[str, str]] = [
    {"icon": "🏖️", "title": "Beach time & water sports", "type": "outdoor", "category": "nature"},
    {"icon": "🥾", "title": "Nature trails & trekking", "type": "outdoor", "category": "adventure"},
    {"icon": "🛶", "title": "Boating & river cruises", "type": "outdoor", "category": "adventure"},
    {"icon": "🚁", "title": "Scenic drives & viewpoints", "type": "outdoor", "category": "sightseeing"},
    {"icon": "📸", "title": "Sunrise / sunset photo walks", "type": "outdoor", "category": "sightseeing"},
    {"icon": "🎢", "title": "Amusement & water parks", "type": "outdoor", "category": "fun"},
    {"icon": "🏄", "title": "Surfing & wind sports", "type": "outdoor", "category": "adventure"},
    {"icon": "🐘", "title": "Wildlife safaris & sanctuaries", "type": "outdoor", "category": "nature"},
    {"icon": "🚴", "title": "Cycling & heritage trails", "type": "outdoor", "category": "adventure"},
    {"icon": "🌅", "title": "Open-air cultural evenings", "type": "outdoor", "category": "culture"},
]

TRIP_TYPE_BIAS: dict[str, list[str]] = {
    "leisure": ["nature", "food"],
    "adventure": ["adventure", "nature"],
    "culture": ["sightseeing", "culture"],
    "family": ["fun", "nature", "food"],
    "romantic": ["sightseeing", "food"],
    "business": ["food", "culture"],
    "beach": ["nature", "adventure"],
    "pilgrimage": ["culture", "sightseeing"],
}

PREFERENCE_KEYWORDS: list[tuple[str, list[str]]] = [
    ("beach", ["beach", "sea", "water", "coastal", "island"]),
    ("adventure", ["adventure", "trek", "hike", "trekking", "trek", "raft", "safari", "sports"]),
    ("sightseeing", ["sight", "monument", "palace", "heritage", "photograph", "view"]),
    ("shopping", ["shop", "market", "bazaar", "mall"]),
    ("food", ["food", "cuisine", "eat", "dining", "street food"]),
    ("culture", ["culture", "museum", "art", "festival", "temple", "heritage"]),
    ("family", ["family", "kids", "children", "park", "fun"]),
    ("relaxation", ["relax", "spa", "beach", "calm", "retreat"]),
]


def _preference_buckets(preferences: str | list[str] | None) -> set[str]:
    if not preferences:
        return set()
    text = " ".join(preferences).lower() if isinstance(preferences, list) else preferences.lower()
    buckets: set[str] = set()
    for bucket, keywords in PREFERENCE_KEYWORDS:
        if any(k in text for k in keywords):
            buckets.add(bucket)
    return buckets


def _sorted_activities(
    pool: list[dict[str, str]],
    trip_type: str | None,
    preferences: str | list[str] | None,
) -> list[dict[str, str]]:
    bias = TRIP_TYPE_BIAS.get((trip_type or "").lower(), [])
    buckets = _preference_buckets(preferences)

    def score(item: dict[str, str]) -> int:
        s = 0
        if item["category"] in bias:
            s += 2
        if item["category"] in buckets:
            s += 2
        return s

    ranked = sorted(pool, key=lambda item: -score(item))
    # Rotate so recommendations vary by destination/time but stay deterministic.
    return ranked


def recommend_activities(
    day: WeatherDay,
    destination: str = "",
    trip_type: str | None = None,
    preferences: str | list[str] | None = None,
) -> dict[str, Any]:
    """Recommend activities for a single day based on its weather category."""
    category = classify(day)
    rotation = (len(destination) + day.date.count("-")) % 3

    if category == WeatherCategory.EXTREME:
        pool = INDOOR_ACTIVITIES + [OUTDOOR_ACTIVITIES[-1]]
        warning = "Severe weather expected. Stay indoors and avoid travel."
    elif category == WeatherCategory.POOR_OUTDOOR:
        pool = INDOOR_ACTIVITIES + OUTDOOR_ACTIVITIES[5:7]
        warning = "Wet weather likely. Keep outdoor plans flexible."
    elif category == WeatherCategory.MODERATE:
        pool = INDOOR_ACTIVITIES[0:6] + OUTDOOR_ACTIVITIES
        warning = None
    else:
        pool = OUTDOOR_ACTIVITIES + INDOOR_ACTIVITIES[6:8]
        warning = None

    ranked = _sorted_activities(pool, trip_type, preferences)
    picked = ranked[rotation * 2 : rotation * 2 + 4] or ranked[:4]
    return {
        "category": category.value,
        "category_label": category.label,
        "category_icon": CATEGORY_ICON[category],
        "reason": _reason_for(category, day),
        "warning": warning,
        "activities": [
            {"icon": a["icon"], "title": a["title"], "type": a["type"], "why": _why(a, category)}
            for a in picked
        ],
    }


def _reason_for(category: WeatherCategory, day: WeatherDay) -> str:
    desc = day.description or day.condition
    temp = day.temperature if day.temperature is not None else 0
    if category == WeatherCategory.EXTREME:
        return f"{desc} with extreme conditions ({temp:.0f}°C). Outdoor activities are unsafe."
    if category == WeatherCategory.POOR_OUTDOOR:
        return f"{desc} and {day.precipitation_probability}% chance of rain. Prefer indoor plans."
    if category == WeatherCategory.MODERATE:
        return f"{desc} with {day.precipitation_probability}% chance of rain. Mix indoor and outdoor plans."
    return f"{desc} with a {day.precipitation_probability}% chance of rain. A great day to be outdoors."


def _why(item: dict[str, str], category: WeatherCategory) -> str:
    if item["type"] == "outdoor" and category in (WeatherCategory.POOR_OUTDOOR, WeatherCategory.EXTREME):
        return "Short outing between showers"
    if item["type"] == "outdoor":
        return "Perfect weather for it"
    return "Stay comfortable and dry"


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def _weekday(date_str: str) -> str:
    d = datetime.fromisoformat(date_str).date()
    return _WEEKDAYS[d.weekday()]


def build_alerts(forecast: list[WeatherDay]) -> list[dict[str, Any]]:
    """Build human-friendly alerts for a forecast, only when thresholds matter."""
    alerts: list[dict[str, Any]] = []
    for day in forecast:
        category = classify(day)
        label = _weekday(day.date)
        temp = day.temperature if day.temperature is not None else 0
        rain = day.rainfall_mm or 0.0
        precip = day.precipitation_probability or 0
        wind = day.wind_speed or 0.0

        if category == WeatherCategory.EXTREME:
            alerts.append(
                {
                    "type": "severe",
                    "severity": "danger",
                    "title": "Severe weather alert",
                    "message": f"{label} ({day.date}): {day.description}. Outdoor activities are not recommended.",
                    "date": day.date,
                }
            )
        elif rain >= 30 or precip >= 85:
            alerts.append(
                {
                    "type": "rain",
                    "severity": "warning",
                    "title": "Heavy rain expected",
                    "message": f"{label} ({day.date}): heavy rain ({rain:.0f} mm, {precip}% chance). Consider indoor activities.",
                    "date": day.date,
                }
            )
        elif rain >= 10 or precip >= 60:
            alerts.append(
                {
                    "type": "rain",
                    "severity": "info",
                    "title": "Rain likely",
                    "message": f"{label} ({day.date}): a {precip}% chance of rain. Keep an umbrella handy.",
                    "date": day.date,
                }
            )
        if temp >= 38:
            alerts.append(
                {
                    "type": "heat",
                    "severity": "warning",
                    "title": "High heat",
                    "message": f"{label} ({day.date}): up to {temp:.0f}°C. Plan outdoor time for early morning or evening.",
                    "date": day.date,
                }
            )
        if wind >= 40:
            alerts.append(
                {
                    "type": "wind",
                    "severity": "warning",
                    "title": "Strong winds",
                    "message": f"{label} ({day.date}): winds up to {wind:.0f} km/h. Water and open-air activities may be affected.",
                    "date": day.date,
                }
            )
    return alerts


# ---------------------------------------------------------------------------
# Itinerary optimization
# ---------------------------------------------------------------------------

def _day_activity_map(
    itinerary: list[dict[str, Any]],
) -> dict[str, list[dict[str, Any]]]:
    mapping: dict[str, list[dict[str, Any]]] = {}
    for day in itinerary or []:
        mapping.setdefault(day.get("date", ""), list(day.get("activities", []) or []))
    return mapping


def _best_outdoor_day(forecast: list[WeatherDay], exclude: str | None = None) -> WeatherDay | None:
    for day in forecast:
        if exclude and day.date == exclude:
            continue
        if classify(day) == WeatherCategory.GOOD_OUTDOOR:
            return day
    return None


def analyze_and_optimize(
    itinerary: list[dict[str, Any]],
    forecast: list[WeatherDay],
    destination: str = "",
    trip_type: str | None = None,
    preferences: str | list[str] | None = None,
) -> dict[str, Any]:
    """Compare an itinerary against the forecast and propose weather-aware changes.

    Returns before/after activities per day plus moved items so the frontend can
    render a clear diff and let the user accept or reject the changes.
    """
    by_date = _day_activity_map(itinerary)
    forecast_by_date = {d.date: d for d in forecast}

    changes: list[dict[str, Any]] = []
    moved: list[dict[str, Any]] = []

    for date_str in sorted(by_date):
        day_activities = by_date[date_str]
        weather = forecast_by_date.get(date_str)
        if weather is None or not weather.available:
            continue
        category = classify(weather)
        if category not in (WeatherCategory.POOR_OUTDOOR, WeatherCategory.EXTREME):
            continue

        outdoor = [a for a in day_activities if str(a.get("type", "")).lower() == "outdoor"]
        if not outdoor:
            continue

        best_day = _best_outdoor_day(forecast, exclude=date_str)
        keep = [a for a in day_activities if a not in outdoor]
        recommendations = recommend_activities(weather, destination, trip_type, preferences)
        replacements = recommendations["activities"]

        for act in outdoor:
            target = best_day.date if best_day else None
            moved.append({"title": act.get("title", ""), "from_date": date_str, "to_date": target})

        changes.append(
            {
                "date": date_str,
                "category": category.value,
                "category_label": category.label,
                "category_icon": CATEGORY_ICON[category],
                "rationale": recommendations["reason"],
                "before": day_activities,
                "after": keep + replacements,
                "moved": [m for m in moved if m["from_date"] == date_str],
                "best_alternative_date": best_day.date if best_day else None,
            }
        )

    affected = len(changes)
    if affected:
        summary = f"Weather would disrupt {affected} day{'s' if affected > 1 else ''}. "
        summary += "Suggested a mix of indoor replacements and moving outdoor plans to better days."
    else:
        summary = "Your itinerary looks weather-friendly. No changes suggested."
    return {"changes": changes, "moved": moved, "summary": summary}


# ---------------------------------------------------------------------------
# Deterministic itinerary generation (non-AI fallback)
# ---------------------------------------------------------------------------

BASE_DAILY_ACTIVITIES: list[dict[str, str]] = [
    {"icon": "🚕", "title": "Arrival & hotel check-in", "type": "logistics", "time": "Morning"},
    {"icon": "🍳", "title": "Local breakfast", "type": "food", "time": "Morning"},
    {"icon": "🏞️", "title": "Neighborhood walking tour", "type": "outdoor", "time": "Morning"},
    {"icon": "🍽️", "title": "Lunch at a local favourite", "type": "food", "time": "Afternoon"},
    {"icon": "🏛️", "title": "Heritage & sightseeing", "type": "outdoor", "time": "Afternoon"},
    {"icon": "☕", "title": "Café break", "type": "indoor", "time": "Evening"},
    {"icon": "🌇", "title": "Sunset viewpoint", "type": "outdoor", "time": "Evening"},
    {"icon": "🍽️", "title": "Dinner & local nightlife", "type": "food", "time": "Night"},
]


def _daily_plan(
    day: WeatherDay,
    destination: str,
    trip_type: str | None,
    preferences: str | list[str] | None,
) -> dict[str, Any]:
    category = classify(day)
    recs = recommend_activities(day, destination, trip_type, preferences)
    activities: list[dict[str, str]] = []

    if category in (WeatherCategory.POOR_OUTDOOR, WeatherCategory.EXTREME):
        activities.append({"icon": "🚕", "title": "Arrival & hotel check-in", "type": "logistics", "time": "Morning"})
        activities.append({"icon": "🍳", "title": "Local breakfast at the hotel", "type": "food", "time": "Morning"})
        for a in recs["activities"][:3]:
            activities.append({"icon": a["icon"], "title": a["title"], "type": a["type"], "time": "Afternoon"})
        activities.append({"icon": "☕", "title": "Café & indoor lounging", "type": "indoor", "time": "Evening"})
        activities.append({"icon": "🍽️", "title": "Dinner at a highly rated restaurant", "type": "food", "time": "Night"})
    elif category == WeatherCategory.MODERATE:
        activities.append({"icon": "🚕", "title": "Arrival & hotel check-in", "type": "logistics", "time": "Morning"})
        activities.append({"icon": "🍳", "title": "Local breakfast", "type": "food", "time": "Morning"})
        for a in recs["activities"][:2]:
            activities.append({"icon": a["icon"], "title": a["title"], "type": a["type"], "time": "Morning"})
        activities.append({"icon": "🍽️", "title": "Lunch at a local favourite", "type": "food", "time": "Afternoon"})
        for a in recs["activities"][2:4]:
            activities.append({"icon": a["icon"], "title": a["title"], "type": a["type"], "time": "Afternoon"})
        activities.append({"icon": "🍽️", "title": "Dinner & local nightlife", "type": "food", "time": "Night"})
    else:
        activities.append({"icon": "🚕", "title": "Arrival & hotel check-in", "type": "logistics", "time": "Morning"})
        activities.append({"icon": "🍳", "title": "Local breakfast", "type": "food", "time": "Morning"})
        for a in recs["activities"][:2]:
            activities.append({"icon": a["icon"], "title": a["title"], "type": a["type"], "time": "Morning"})
        activities.append({"icon": "🍽️", "title": "Lunch at a local favourite", "type": "food", "time": "Afternoon"})
        for a in recs["activities"][2:4]:
            activities.append({"icon": a["icon"], "title": a["title"], "type": a["type"], "time": "Afternoon"})
        activities.append({"icon": "🌅", "title": "Sunset photography walk", "type": "outdoor", "time": "Evening"})
        activities.append({"icon": "🍽️", "title": "Dinner & local nightlife", "type": "food", "time": "Night"})

    return {
        "date": day.date,
        "day_label": _weekday(day.date),
        "weather": _day_weather_payload(day),
        "category": category.value,
        "category_label": category.label,
        "category_icon": CATEGORY_ICON[category],
        "activities": activities,
        "rationale": recs["reason"],
    }


def _day_weather_payload(day: WeatherDay) -> dict[str, Any]:
    category = classify(day)
    return {
        "category": category.value,
        "category_label": category.label,
        "category_icon": CATEGORY_ICON[category],
        "icon": CONDITION_ICON.get(day.condition or "", "🌡️"),
        "condition": day.condition,
        "description": day.description,
        "temperature": day.temperature,
        "temperature_min": day.temperature_min,
        "feels_like": day.feels_like,
        "precipitation_probability": day.precipitation_probability,
        "rainfall_mm": day.rainfall_mm,
        "wind_speed": day.wind_speed,
        "humidity": day.humidity,
    }


def generate_deterministic_itinerary(
    destination: str,
    start_date: str,
    end_date: str,
    forecast: list[WeatherDay],
    trip_type: str | None = None,
    preferences: str | list[str] | None = None,
) -> dict[str, Any]:
    """Build a complete weather-aware itinerary without any AI provider."""
    itinerary = []
    for day in sorted(forecast, key=lambda d: d.date):
        if not day.available:
            continue
        itinerary.append(_daily_plan(day, destination, trip_type, preferences))

    total = len(itinerary)
    return {
        "destination": destination,
        "start_date": start_date,
        "end_date": end_date,
        "trip_type": trip_type or "leisure",
        "itinerary": itinerary,
        "summary": f"A {total}-day, weather-aware plan for {destination} that balances outdoor highlights with comfortable indoor options.",
        "alerts": build_alerts(forecast),
        "is_ai_generated": False,
        "data_source": "rules_engine",
    }


# ---------------------------------------------------------------------------
# Caching & orchestration
# ---------------------------------------------------------------------------

_cache: dict[str, tuple[float, list[WeatherDay]]] = {}


def _cache_ttl() -> int:
    raw = os.getenv("WEATHER_CACHE_TTL", "1800")
    try:
        return max(0, int(raw))
    except ValueError:
        return 1800


class WeatherServiceError(Exception):
    """Raised when weather data cannot be obtained for a request."""


async def get_forecast_cached(
    destination: str,
    lat: float | None = None,
    lon: float | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    provider_preference: str | None = None,
    force_refresh: bool = False,
) -> list[WeatherDay]:
    """Return a forecast, using an in-memory TTL cache when possible.

    Raises WeatherServiceError when the provider cannot produce data.
    """
    start = start_date or (datetime.now(timezone.utc).date().isoformat())
    end = end_date or (datetime.now(timezone.utc).date() + timedelta(days=4)).isoformat()
    provider = get_weather_provider(provider_preference)

    key = f"{provider.name}|{destination.lower().strip()}|{lat}|{lon}|{start}|{end}"
    now = time.monotonic()
    cached = _cache.get(key)
    if cached and not force_refresh and now - cached[0] < _cache_ttl():
        return cached[1]

    try:
        forecast = await provider.get_forecast(destination, lat, lon, start, end)
    except Exception as exc:
        raise WeatherServiceError(f"Weather information is temporarily unavailable: {exc}") from exc

    # Never return empty forecasts; treat them as a service failure.
    if not forecast:
        raise WeatherServiceError("Weather information is temporarily unavailable")

    _cache[key] = (now, forecast)
    return forecast


def clear_cache() -> None:
    """Test/debug helper: clear the in-memory weather cache."""
    _cache.clear()


async def build_weather_response(
    destination: str,
    start_date: str | None,
    end_date: str | None,
    lat: float | None = None,
    lon: float | None = None,
    trip_type: str | None = None,
    preferences: str | list[str] | None = None,
) -> dict[str, Any]:
    """Assemble the full /weather payload (forecast + alerts + recommendations)."""
    forecast = await get_forecast_cached(destination, lat, lon, start_date, end_date)
    return {
        "destination": destination,
        "start_date": forecast[0].date if forecast else start_date,
        "end_date": forecast[-1].date if forecast else end_date,
        "source": get_weather_provider().name,
        "available": True,
        "forecast": [
            {
                **_day_weather_payload(day),
                "date": day.date,
            }
            for day in forecast
        ],
        "alerts": build_alerts(forecast),
        "recommendations": [
            {
                **recommend_activities(day, destination, trip_type, preferences),
                "date": day.date,
                "day_label": _weekday(day.date),
            }
            for day in forecast
        ],
    }