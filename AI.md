# TravelSphere Multi-Model AI

## AI Router Architecture

```
User request
    ↓
TravelSphere AI Router
    ↓
Model selection (based on task type)
    ↓
One or more model providers
    ↓
Structured response (JSON schema)
    ↓
Safety/business-rule validation
    ↓
Frontend
```

## Model Abstraction

```python
class AIProvider:
    async def chat(self, messages, schema=None, temperature=0.7) -> dict: ...
    async def extract(self, prompt, schema) -> dict: ...
```

## Provider hierarchy

1. **OpenRouterProvider** - If free tier verified (primary)
2. **DirectModelProvider** - Local/Ollama models (fallback)
3. **MockAIProvider** - Simulated responses (development)

## AI Use Cases

| Capability | Description |
|------------|-------------|
| Personalized recommendations | Based on user preferences, history |
| Itinerary generation | Day-wise plan with activities |
| Hotel recommendations | Based on budget, location, amenities |
| Local discovery | Attractions, restaurants, activities |
| Trip planning | Complete travel plan from user input |
| Group preference analysis | Analyze multiple user preferences |
| Explanation generation | Why this option was recommended |
| Smart replanning | After disruptions or changes |

## Output Validation

- All AI responses validated via Pydantic schemas
- Malformed output rejected
- Fact-checking against available data
- No fabrication of prices/availability/booking status
- Clear separation of verified vs AI-generated content

## Safety Rules

- AI must NOT be source of truth for live price/availability
- All factual claims must reference actual options
- Budget estimates must be grounded in provider data
- Itinerary timing must be reasonable
- Never generate booking confirmations
- Always label AI-generated content