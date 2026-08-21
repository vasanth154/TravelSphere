"""Weather provider abstraction.

All weather data flows through the TravelSphere backend:

    Frontend -> TravelSphere backend -> Weather provider

API keys live only on the backend and are never exposed to the browser.
Providers keep a common normalized shape so the rest of the application is
provider-agnostic.
"""

import hashlib
import os
from abc import ABC, abstractmethod
from datetime import date, datetime, timedelta, timezone
from typing import Any, ClassVar

from pydantic import BaseModel


class WeatherDay(BaseModel):
    """Normalized daily weather forecast entry."""

    date: str  # YYYY-MM-DD
    temperature: float  # max temperature in °C
    temperature_min: float | None = None
    feels_like: float | None = None
    condition: str  # normalized condition code
    description: str
    precipitation_probability: int  # 0-100
    rainfall_mm: float
    wind_speed: float  # km/h
    humidity: int | None = None
    available: bool = True


class WeatherProvider(ABC):
    """Base class for weather providers."""

    name: str = "base"

    @abstractmethod
    async def get_forecast(
        self,
        destination: str,
        lat: float | None,
        lon: float | None,
        start_date: str,
        end_date: str,
    ) -> list[WeatherDay]:
        """Return a normalized daily forecast for the requested date range."""
        ...


# Normalized condition codes shared across providers.
CLEAR = "clear"
PARTLY_CLOUDY = "partly_cloudy"
CLOUDY = "cloudy"
FOG = "fog"
MIST = "mist"
DRIZZLE = "drizzle"
RAIN = "rain"
HEAVY_RAIN = "heavy_rain"
THUNDERSTORM = "thunderstorm"
SNOW = "snow"
WIND = "wind"
HEAT = "extreme_heat"


def _parse_date(value: str) -> date:
    return datetime.fromisoformat(value).date() if isinstance(value, str) else value


def _iter_dates(start_date: str, end_date: str) -> list[date]:
    start = _parse_date(start_date)
    end = _parse_date(end_date)
    if end < start:
        raise ValueError("end_date must be on or after start_date")
    days = []
    cur = start
    while cur <= end:
        days.append(cur)
        cur += timedelta(days=1)
    return days


class MockWeatherProvider(WeatherProvider):
    """Deterministic mock provider for development, demos and tests.

    Weather is derived from the destination name and date, so the same request
    always returns the same forecast. A 6-archetype rotation guarantees a mix
    of good and wet days across multi-day trips (e.g. a Goa 5-day trip always
    contains both rainy and sunny days).
    """

    name = "MockWeatherProvider"

    # (condition, description, max_temp, precip %, rainfall mm, wind km/h)
    ARCHETYPES: ClassVar[list[dict[str, Any]]] = [
        {"condition": CLEAR, "description": "Clear skies", "temperature": 31, "precip": 8, "rainfall": 0, "wind": 9},
        {"condition": PARTLY_CLOUDY, "description": "Partly cloudy", "temperature": 30, "precip": 22, "rainfall": 0, "wind": 12},
        {"condition": CLOUDY, "description": "Cloudy", "temperature": 28, "precip": 42, "rainfall": 0, "wind": 14},
        {"condition": RAIN, "description": "Light rain", "temperature": 27, "precip": 72, "rainfall": 11, "wind": 18},
        {"condition": HEAVY_RAIN, "description": "Heavy rain", "temperature": 26, "precip": 90, "rainfall": 32, "wind": 24},
        {"condition": THUNDERSTORM, "description": "Thunderstorms", "temperature": 25, "precip": 96, "rainfall": 46, "wind": 36},
    ]

    # Month offset applied to base temperatures (northern-hemisphere India).
    MONTH_OFFSET: ClassVar[dict[int, int]] = {1: -5, 2: -2, 3: 1, 4: 4, 5: 5, 6: 3, 7: 1, 8: 1, 9: 2, 10: 1, 11: -2, 12: -4}

    def _seed(self, destination: str) -> int:
        return int(hashlib.sha1(destination.lower().encode("utf-8")).hexdigest()[:8], 16)

    async def get_forecast(
        self,
        destination: str,
        lat: float | None,
        lon: float | None,
        start_date: str,
        end_date: str,
    ) -> list[WeatherDay]:
        days = _iter_dates(start_date, end_date)
        seed = self._seed(destination or "destination")
        offset = seed % len(self.ARCHETYPES)
        forecast = []
        for i, day in enumerate(days):
            archetype = self.ARCHETYPES[(offset + i) % len(self.ARCHETYPES)]
            month = day.month
            temp = round(archetype["temperature"] + self.MONTH_OFFSET.get(month, 0), 1)
            feels = round(temp + (1 if archetype["condition"] in (CLEAR, PARTLY_CLOUDY) else -1), 1)
            forecast.append(
                WeatherDay(
                    date=day.isoformat(),
                    temperature=temp,
                    temperature_min=round(temp - 6, 1),
                    feels_like=feels,
                    condition=archetype["condition"],
                    description=archetype["description"],
                    precipitation_probability=archetype["precip"],
                    rainfall_mm=float(archetype["rainfall"]),
                    wind_speed=float(archetype["wind"]),
                    humidity=65 if archetype["condition"] in (RAIN, HEAVY_RAIN, THUNDERSTORM) else 52,
                )
            )
        return forecast


class OpenWeatherProvider(WeatherProvider):
    """OpenWeatherMap provider (5-day/3-hour + One Call 3.0 when available).

    Requires WEATHER_API_KEY. When the One Call endpoint is unavailable (e.g.
    free-tier accounts without One Call access), the 5-day/3-hour forecast is
    aggregated per day as a fallback so the service keeps working.
    """

    name = "OpenWeatherProvider"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("WEATHER_API_KEY")
        self.base_url = os.getenv("WEATHER_API_BASE_URL", "https://api.openweathermap.org")

    # OpenWeatherMap condition id -> (normalized condition, human description)
    CONDITION_MAP: ClassVar[dict[int, tuple[str, str]]] = {
        200: (THUNDERSTORM, "Thunderstorm with light rain"),
        201: (THUNDERSTORM, "Thunderstorm with rain"),
        202: (THUNDERSTORM, "Thunderstorm with heavy rain"),
        210: (THUNDERSTORM, "Light thunderstorm"),
        211: (THUNDERSTORM, "Thunderstorm"),
        212: (THUNDERSTORM, "Heavy thunderstorm"),
        221: (THUNDERSTORM, "Ragged thunderstorm"),
        230: (THUNDERSTORM, "Thunderstorm with drizzle"),
        231: (THUNDERSTORM, "Thunderstorm with drizzle"),
        232: (THUNDERSTORM, "Thunderstorm with heavy drizzle"),
        300: (DRIZZLE, "Light drizzle"),
        301: (DRIZZLE, "Drizzle"),
        302: (DRIZZLE, "Heavy drizzle"),
        310: (RAIN, "Light intensity drizzle rain"),
        311: (RAIN, "Drizzle rain"),
        312: (RAIN, "Heavy drizzle rain"),
        313: (RAIN, "Shower rain and drizzle"),
        314: (RAIN, "Heavy shower rain and drizzle"),
        321: (RAIN, "Shower drizzle"),
        500: (RAIN, "Light rain"),
        501: (RAIN, "Moderate rain"),
        502: (HEAVY_RAIN, "Heavy rain"),
        503: (HEAVY_RAIN, "Very heavy rain"),
        504: (HEAVY_RAIN, "Extreme rain"),
        511: (RAIN, "Freezing rain"),
        520: (RAIN, "Light shower rain"),
        521: (RAIN, "Shower rain"),
        522: (HEAVY_RAIN, "Heavy shower rain"),
        531: (HEAVY_RAIN, "Ragged shower rain"),
        600: (SNOW, "Light snow"),
        601: (SNOW, "Snow"),
        602: (SNOW, "Heavy snow"),
        611: (SNOW, "Sleet"),
        612: (SNOW, "Light shower sleet"),
        613: (SNOW, "Shower sleet"),
        615: (SNOW, "Light rain and snow"),
        616: (SNOW, "Rain and snow"),
        620: (SNOW, "Light shower snow"),
        621: (SNOW, "Shower snow"),
        622: (SNOW, "Heavy shower snow"),
        701: (MIST, "Mist"),
        711: (MIST, "Smoke"),
        721: (MIST, "Haze"),
        731: (FOG, "Sand/dust whirls"),
        741: (FOG, "Fog"),
        751: (FOG, "Sand"),
        761: (FOG, "Dust"),
        762: (FOG, "Volcanic ash"),
        771: (WIND, "Squalls"),
        781: (THUNDERSTORM, "Tornado"),
        800: (CLEAR, "Clear sky"),
        801: (PARTLY_CLOUDY, "Few clouds"),
        802: (PARTLY_CLOUDY, "Scattered clouds"),
        803: (CLOUDY, "Broken clouds"),
        804: (CLOUDY, "Overcast clouds"),
    }

    async def _geocode(self, destination: str) -> tuple[float, float]:
        import httpx

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/geo/1.0/direct",
                params={"q": destination, "limit": 1, "appid": self.api_key},
            )
            resp.raise_for_status()
            data = resp.json()
            if not data:
                raise ValueError(f"Could not geocode destination: {destination}")
            return float(data[0]["lat"]), float(data[0]["lon"])

    async def _one_call(self, lat: float, lon: float) -> list[WeatherDay]:
        import httpx

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/data/3.0/onecall",
                params={
                    "lat": lat,
                    "lon": lon,
                    "exclude": "current,minutely,hourly,alerts",
                    "units": "metric",
                    "appid": self.api_key,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        days = []
        for entry in data.get("daily", []):
            cond_id = entry["weather"][0]["id"]
            condition, description = self.CONDITION_MAP.get(
                cond_id, (CLOUDY, entry["weather"][0].get("description", "Cloudy"))
            )
            temp = float(entry.get("temp", {}).get("max", 0))
            days.append(
                WeatherDay(
                    date=datetime.fromtimestamp(entry["dt"], tz=timezone.utc).date().isoformat(),
                    temperature=round(temp, 1),
                    temperature_min=round(float(entry.get("temp", {}).get("min", temp)), 1),
                    feels_like=round(float(entry.get("feels_like", {}).get("day", temp)), 1),
                    condition=condition,
                    description=description,
                    precipitation_probability=round(float(entry.get("pop", 0)) * 100),
                    rainfall_mm=round(float(entry.get("rain", 0) or 0), 1),
                    wind_speed=round(float(entry.get("wind_speed", 0)) * 3.6, 1),  # m/s -> km/h
                    humidity=entry.get("humidity"),
                )
            )
        return days

    async def _five_day_forecast(self, lat: float, lon: float) -> list[WeatherDay]:
        import httpx

        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"{self.base_url}/data/2.5/forecast",
                params={"lat": lat, "lon": lon, "units": "metric", "appid": self.api_key},
            )
            resp.raise_for_status()
            data = resp.json()

        by_day: dict[str, dict[str, Any]] = {}
        for entry in data.get("list", []):
            day = datetime.fromtimestamp(entry["dt"], tz=timezone.utc).date().isoformat()
            bucket = by_day.setdefault(day, {"max_temp": -999, "min_temp": 999, "precip": 0, "rain": 0, "wind": 0, "count": 0})
            main = entry.get("main", {})
            temp = float(main.get("temp", 0))
            bucket["max_temp"] = max(bucket["max_temp"], temp)
            bucket["min_temp"] = min(bucket["min_temp"], temp)
            bucket["precip"] = max(bucket["precip"], float(entry.get("pop", 0) or 0))
            bucket["rain"] += float((entry.get("rain") or {}).get("3h", 0) or 0)
            bucket["wind"] = max(bucket["wind"], float(entry.get("wind", {}).get("speed", 0)))
            bucket["count"] += 1
            cond_id = entry["weather"][0]["id"]
            bucket.setdefault("cond_id", cond_id)

        days = []
        for day, b in by_day.items():
            cond_id = b["cond_id"]
            condition, description = self.CONDITION_MAP.get(cond_id, (CLOUDY, "Cloudy"))
            days.append(
                WeatherDay(
                    date=day,
                    temperature=round(b["max_temp"], 1),
                    temperature_min=round(b["min_temp"], 1),
                    feels_like=round(b["max_temp"], 1),
                    condition=condition,
                    description=description,
                    precipitation_probability=round(b["precip"] * 100),
                    rainfall_mm=round(b["rain"], 1),
                    wind_speed=round(b["wind"] * 3.6, 1),
                    humidity=None,
                )
            )
        return days

    async def get_forecast(
        self,
        destination: str,
        lat: float | None,
        lon: float | None,
        start_date: str,
        end_date: str,
    ) -> list[WeatherDay]:
        if not self.api_key:
            raise RuntimeError("WEATHER_API_KEY not configured")

        if lat is None or lon is None:
            lat, lon = await self._geocode(destination)

        requested = {d.isoformat() for d in _iter_dates(start_date, end_date)}

        try:
            days = await self._one_call(lat, lon)
        except Exception:  # noqa: BLE001 - fall back when One Call is unavailable
            # One Call may not be enabled on free accounts; fall back to the
            # 5-day/3-hour forecast aggregated per day.
            days = await self._five_day_forecast(lat, lon)

        by_date = {d.date: d for d in days}

        forecast: list[WeatherDay] = []
        for d in sorted(requested):
            if d in by_date:
                forecast.append(by_date[d])
            else:
                forecast.append(WeatherDay(date=d, temperature=0.0, condition=CLOUDY, description="Forecast unavailable", precipitation_probability=0, rainfall_mm=0, wind_speed=0, available=False))
        return forecast


def get_weather_provider(preference: str | None = None) -> WeatherProvider:
    """Return the configured weather provider.

    Order: OpenWeatherMap (if WEATHER_API_KEY set) -> Mock (deterministic).
    """
    if preference == "mock":
        return MockWeatherProvider()
    if os.getenv("WEATHER_API_KEY"):
        return OpenWeatherProvider()
    return MockWeatherProvider()