# TravelSphere Provider Integrations

## Policy

- Prefer free/tiered APIs
- Never fabricate live data
- All mock/demo data clearly labelled
- Provider adapters normalize to internal models
- Keys via environment variables only

## Transport Providers

### MockTransportProvider

- **Purpose**: Development, testing, demo UI
- **Free tier**: Unlimited (simulated)
- **API key**: Not required
- **Rate limit**: None
- **Data source**: `mock_demo`
- **is_demo**: `true`
- **booking_support**: `false`
- **Usage**: Default fallback when no live provider available

### Future Real Providers (to be integrated when credentials available)

- RedBus API / IXIGO for bus booking
- Indian Railways (IRCTC) for trains
- Aviation Edge / Amadeus for flights
- Google Maps for cab/rental/metro
- APIs will have: API key required, rate limits, booking support

## Hotel Providers

### MockHotelProvider

- **Purpose**: Development, testing, demo UI
- **Free tier**: Unlimited (simulated)
- **API key**: Not required
- **Data source**: `mock_demo`
- **is_demo**: `true`
- **Usage**: Default fallback

## AI Providers

### MockAIProvider

- **Purpose**: Development, testing, AI architecture without external keys
- **Free tier**: Unlimited (simulated)
- **API key**: Not required
- **Usage**: Default fallback for AI router

### OpenRouterProvider (if free tier available)

- **Verification needed**: Check current free tier availability
- **API key**: Required if used
- **Rate limits**: Must verify
- **Usage**: Primary AI provider when available

### DirectModelProvider

- **Purpose**: Direct model access (e.g., Ollama local models)
- **Free tier**: Depends on model hosting
- **Usage**: Fallback when OpenRouter unavailable