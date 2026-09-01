"""TravelSphere AI travel chat route.

Intent-aware assistant: it can answer food, places, destinations, packing and
time-of-day questions using the deterministic discovery/rules engine, and falls
back to a generative provider for open-ended chat. Live prices/availability are
never fabricated as confirmed.
"""

from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter, Body

from ..ai.providers import get_provider
from ..providers.hotel import MockHotelProvider
from ..services import discovery
from ..services.hotel import recommend_hotel

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatRouter:
    def __init__(self) -> None:
        self._intents: list[tuple[re.Pattern, Any]] = [
            (re.compile(r"(restaurant|food|eat|cuisine)", re.IGNORECASE), self._food),
            (re.compile(r"(hour|time|plan|schedule|morning|afternoon|evening|night)", re.IGNORECASE), self._time_plan),
            (re.compile(r"(where.*go|destination|recommend.*place|suggest.*place)", re.IGNORECASE), self._where),
            (re.compile(r"(pack|packing|what to bring|carry|clothes)", re.IGNORECASE), self._packing),
            (re.compile(r"(hotel|stay|book.*room|accommodation)", re.IGNORECASE), self._hotel),
        ]

    async def _food(self, city: str, budget: float | None, raw: str = "", time_of_day: str = "") -> dict[str, Any]:
        return discovery.recommend_food(city, budget=budget)

    async def _time_plan(self, city: str, budget: float | None, raw: str = "", time_of_day: str = "") -> dict[str, Any]:
        return discovery.plan_by_time(city, time_of_day)

    async def _where(self, city: str, budget: float | None, raw: str = "", time_of_day: str = "") -> dict[str, Any]:
        return discovery.where_should_i_go(preferences=raw)

    async def _packing(self, city: str, budget: float | None, raw: str = "", time_of_day: str = "") -> dict[str, Any]:
        days = 3
        m = re.search(r"(\d+)\s*(day|day's|nights)", raw, re.IGNORECASE)
        if m:
            days = int(m.group(1))
        return discovery.packing_list(city, days=days)

    async def _hotel(self, city: str, budget: float | None, raw: str = "", time_of_day: str = "") -> dict[str, Any]:
        hotels = MockHotelProvider().search(destination=city)
        rec = recommend_hotel(hotels, budget=budget)
        return {"recommendation": rec["hotel"], "reason": rec["reason"]}

    @staticmethod
    def _city(raw: str) -> str | None:
        for cname in discovery.DISCOVERY:
            if re.search(rf"\b{cname}\b", raw, re.IGNORECASE):
                return cname
        return None

    @staticmethod
    def _extract_budget(raw: str) -> float | None:
        m = re.search(r"(?:under|below|less than|max|budget of|around)\s*[₹$€£]?\s*(\d+[kK]?|\d{2,})", raw, re.IGNORECASE)
        if not m:
            return None
        val = m.group(1)
        if val.lower().endswith("k"):
            return float(val[:-1]) * 1000
        return float(val)

    def _time_of_day(self, raw: str) -> str:
        lr = raw.lower()
        if any(w in lr for w in ("morning", "breakfast")):
            return "morning"
        if any(w in lr for w in ("night", "evening")) and "afternoon" not in lr:
            if "afternoon" in lr:
                return "afternoon"
            return "night"
        if "afternoon" in lr:
            return "afternoon"
        return "evening"

    async def handle(self, message: str) -> dict[str, Any]:
        """Route a user message to the best available assistant."""
        raw = message or ""
        city = self._city(raw) or "goa"
        budget = self._extract_budget(raw)
        time_of_day = self._time_of_day(raw)

        for pattern, handler in self._intents:
            if pattern.search(raw):
                try:
                    result = await handler(city, budget, raw, time_of_day)  # type: ignore[operator]
                except Exception:  # noqa: BLE001 - graceful fallback to generative chat
                    result = None
                if result is not None:
                    return {
                        "answer": ChatRouter._pretty(raw, result),
                        "intent": "rules",
                        "is_ai_generated": False,
                        "data_source": "rules_engine",
                        "data": result,
                    }
        return await self._generative(message)

    async def _generative(self, message: str) -> dict[str, Any]:
        provider = get_provider()
        try:
            text = await provider.chat(
                [
                    {
                        "role": "system",
                        "content": (
                            "You are TravelSphere's travel assistant. Be concise and helpful. "
                            "Never fabricate live prices, availability, or confirmed bookings "
                            "as fact. Suggest next steps instead."
                        ),
                    },
                    {"role": "user", "content": message},
                ]
            )
            return {
                "answer": text,
                "intent": "generative",
                "is_ai_generated": True,
                "data_source": provider.name,
                "data": None,
            }
        except Exception:  # noqa: BLE001
            return {
                "answer": (
                    "I couldn't fetch a live answer right now, but I can help with food, "
                    "places, scheduling, packing and hotel suggestions. Try asking about a "
                    "specific city like 'best food in Goa'."
                ),
                "intent": "fallback",
                "is_ai_generated": False,
                "data_source": "rules_engine",
                "data": None,
            }

    @staticmethod
    def _pretty(raw: str, result: dict[str, Any]) -> str:
        if "recommendations" in result:
            lines = ["Here are some food picks:"]
            for r in result["recommendations"][:3]:
                lines.append(
                    f"- {r['name']} ({r['cuisine']}, ~₹{r['avg_cost']}, {r['rating']}★) — must try {r['must_try']}"
                )
            return "\n".join(lines)
        if "recommendation" in result and isinstance(result.get("recommendation"), dict):
            h = result["recommendation"]
            return f"{h['name']} — {h['rating']}★ at ₹{h['price_per_night']}/night, {h['distance_from_attractions']} km from attractions.\n{result.get('reason', '')}"
        if "activities" in result:
            lines = [f"{result.get('time_of_day', 'evening').title()} plan in {result.get('city', '').capitalize()}:"]
            for a in result["activities"][:2]:
                lines.append(f"- {a['name']} ({a['category']})")
            lines.append(f"Try {result['restaurants'][0]['name']} for {result.get('meal', 'a meal')}.")
            return "\n".join(lines)
        if "recommendation" in result and isinstance(result.get("recommendation"), dict) and "city" in result["recommendation"]:
            city = result["recommendation"]["city"].capitalize()
            return f"I'd recommend {city} — {result['recommendation']['why']}."
        if "items" in result:
            return f"For your trip, pack: {', '.join(result['items'][:8])}."
        if "reason" in result and "hotel" in result:
            return result["reason"]
        return "Here's what I found. Ask me about food, places, packing or hotels in any city."


_chat_router = ChatRouter()


@router.post("/chat")
async def ai_chat(message: str = Body(..., embed=True)):
    """Send a travel question to the AI assistant (intent-aware)."""
    result = await _chat_router.handle(message)
    return result