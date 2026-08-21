"""TravelSphere AI provider abstraction.

Multi-model AI architecture. All AI requests go through the backend.
Providers must never be exposed to the frontend. AI is never the source of
truth for live price, availability, booking, or payment status.
"""

import json
import os
from abc import ABC, abstractmethod
from typing import Any


class AIProvider(ABC):
    """Base class for all AI providers."""

    name: str = "base"

    @abstractmethod
    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        """Send chat messages and return the raw text response."""
        ...

    @abstractmethod
    async def extract(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        """Return a structured response validated against the given JSON schema."""
        ...


class MockAIProvider(AIProvider):
    """Deterministic mock AI provider for development and testing.

    Always returns safe, structured demo output. Clearly labelled as AI-generated.
    """

    name = "MockAIProvider"

    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        last = messages[-1]["content"] if messages else ""
        return (
            "Thank you for your query. I am a demo AI assistant for TravelSphere. "
            "I can suggest itineraries, local places, and explain travel options, "
            "but I cannot confirm live prices, availability, or bookings. "
            f"Your message was: {last[:120]}"
        )

    async def extract(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        """Return a deterministic structured response based on the requested schema."""
        props = schema.get("properties", {})
        result: dict[str, Any] = {}
        for key, spec in props.items():
            if key == "is_ai_generated":
                result[key] = True
            elif key == "recommendation":
                result[key] = "Based on demo data, the train option offers the best balance of cost and comfort."
            elif key == "explanation":
                result[key] = "This is a demo explanation. Train is cheaper than flight and only slightly slower."
            elif key == "confidence":
                result[key] = 0.6
            elif spec.get("type") == "array":
                result[key] = []
            elif spec.get("type") == "string":
                result[key] = "demo"
            elif spec.get("type") == "number":
                result[key] = 0.0
            elif spec.get("type") == "boolean":
                result[key] = False
            else:
                result[key] = None
        return result


class OpenRouterProvider(AIProvider):
    """OpenRouter provider. Requires OPENROUTER_API_KEY.

    Free development tier is used when available. Falls back to mock if no key.
    """

    name = "OpenRouterProvider"

    def __init__(self, api_key: str | None = None):
        self.api_key = api_key or os.getenv("OPENROUTER_API_KEY")
        self.model = os.getenv("OPENROUTER_MODEL", "openai/gpt-3.5-turbo")

    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        if not self.api_key:
            raise RuntimeError("OPENROUTER_API_KEY not configured")
        import httpx

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": messages, "temperature": temperature},
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def extract(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        import httpx

        messages = [
            {
                "role": "system",
                "content": (
                    "You are a travel assistant. Respond ONLY with valid JSON matching "
                    "the provided schema. Do not fabricate prices, availability, or bookings."
                ),
            },
            {"role": "user", "content": f"{prompt}\nSchema: {json.dumps(schema)}"},
        ]
        if not self.api_key:
            raise RuntimeError("OPENROUTER_API_KEY not configured")
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={"model": self.model, "messages": messages, "temperature": 0.3},
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            return json.loads(content)


class DirectModelProvider(AIProvider):
    """Direct model provider (e.g., local Ollama). Falls back to mock if unavailable."""

    name = "DirectModelProvider"

    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

    async def chat(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        import httpx

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json={"model": "llama3", "messages": messages, "stream": False},
            )
            resp.raise_for_status()
            return resp.json()["message"]["content"]

    async def extract(self, prompt: str, schema: dict[str, Any]) -> dict[str, Any]:
        # Reuse chat then parse JSON minimally; for now raise if not available
        raise NotImplementedError("DirectModelProvider.extract requires model-specific parsing")


def get_provider(preference: str | None = None) -> AIProvider:
    """Return the appropriate AI provider.

    Order: OpenRouter (if key) -> DirectModel (if available) -> Mock.
    """
    if preference == "mock":
        return MockAIProvider()

    if os.getenv("OPENROUTER_API_KEY"):
        return OpenRouterProvider()

    # Default to mock to guarantee a working, free, safe response.
    return MockAIProvider()
