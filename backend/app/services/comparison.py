"""Deterministic transport comparison engine."""

from enum import Enum
from typing import Any


class ComparisonCategory(str, Enum):
    CHEAPEST = "cheapest"
    FASTEST = "fastest"
    BEST_VALUE = "best_value"
    BEST_COMFORT = "best_comfort"
    BEST_CONVENIENCE = "best_convenience"


# Default preference weights for "best value"
DEFAULT_WEIGHTS = {
    "price": 0.35,
    "duration": 0.25,
    "comfort": 0.2,
    "convenience": 0.2,
}

# Preference profile weights
PROFILE_WEIGHTS = {
    "budget_sensitive": {"price": 0.6, "duration": 0.15, "comfort": 0.1, "convenience": 0.15},
    "time_sensitive": {"price": 0.15, "duration": 0.6, "comfort": 0.1, "convenience": 0.15},
    "comfort_focused": {"price": 0.15, "duration": 0.15, "comfort": 0.55, "convenience": 0.15},
    "convenience_focused": {"price": 0.15, "duration": 0.15, "comfort": 0.15, "convenience": 0.55},
}


def calculate_total_cost(option: dict[str, Any]) -> float:
    """Total cost = base price + fuel cost + toll cost (self-drive) or ticket price."""
    price = float(option.get("price", 0) or 0)
    fuel_cost = float(option.get("fuel_cost", 0) or 0)
    toll_cost = float(option.get("toll_cost", 0) or 0)
    mode = option.get("mode", "").lower()
    if mode in ("car", "bike", "cab", "rental"):
        return price + fuel_cost + toll_cost
    return price


def normalize_value(value: float, min_val: float, max_val: float) -> float:
    """Normalize value to 0-1 range. Handle missing data safely."""
    if max_val == min_val:
        return 0.5
    return (value - min_val) / (max_val - min_val)


def compare_options(
    options: list[dict[str, Any]],
    profile: str | None = None,
) -> dict[str, Any]:
    """Deterministic comparison returning category winners and ranking."""
    if not options:
        return {
            "cheapest": None,
            "fastest": None,
            "best_value": None,
            "best_comfort": None,
            "best_convenience": None,
            "ranked": [],
        }

    prices = [calculate_total_cost(o) for o in options]
    durations = [float(o.get("duration", 0) or 0) for o in options]
    comforts = [float(o.get("comfort", 0) or 0) for o in options]
    conveniences = [float(o.get("convenience", 0) or 0) for o in options]

    min_price, max_price = min(prices), max(prices)
    min_dur, max_dur = min(durations), max(durations)
    min_comf, max_comf = min(comforts), max(comforts)
    min_conv, max_conv = min(conveniences), max(conveniences)

    weights = DEFAULT_WEIGHTS
    if profile and profile in PROFILE_WEIGHTS:
        weights = PROFILE_WEIGHTS[profile]

    ranked = []
    for i, o in enumerate(options):
        norm_price = 1 - normalize_value(prices[i], min_price, max_price)  # cheaper = higher
        norm_dur = 1 - normalize_value(durations[i], min_dur, max_dur)  # faster = higher
        norm_comf = normalize_value(comforts[i], min_comf, max_comf)
        norm_conv = normalize_value(conveniences[i], min_conv, max_conv)

        score = (
            weights["price"] * norm_price
            + weights["duration"] * norm_dur
            + weights["comfort"] * norm_comf
            + weights["convenience"] * norm_conv
        )
        ranked.append((o, score))

    ranked.sort(key=lambda x: x[1], reverse=True)

    cheapest = min(options, key=lambda o: calculate_total_cost(o))
    fastest = min(options, key=lambda o: float(o.get("duration", 0) or 0))
    best_comfort = max(options, key=lambda o: float(o.get("comfort", 0) or 0))
    best_convenience = max(options, key=lambda o: float(o.get("convenience", 0) or 0))
    best_value = ranked[0][0]

    return {
        "cheapest": cheapest,
        "fastest": fastest,
        "best_value": best_value,
        "best_comfort": best_comfort,
        "best_convenience": best_convenience,
        "ranked": [o for o, _ in ranked],
    }
