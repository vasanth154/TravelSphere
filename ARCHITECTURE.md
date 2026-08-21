# TravelSphere Architecture

## Overview

A modular monorepo separating frontend (Next.js/React/TypeScript) and backend (FastAPI/Python).

## Directory Structure

```
TravelSphere/
├── frontend/        # Next.js 14+ with App Router
├── backend/         # FastAPI with SQLAlchemy + Alembic
├── docs/            # Documentation
├── scripts/         # Setup and utility scripts
└── configuration files
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript |
| UI Framework | React 18, CSS Modules / Tailwind |
| Backend | Python 3.11+, FastAPI |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Database | PostgreSQL |
| Validation | Pydantic v2 |
| Testing | pytest, Playwright |
| Linting | ESLint, Ruff |
| Type Checking | TypeScript, mypy |

## Architecture Patterns

### Modular Monolith

- Single deployable unit
- Clear module boundaries within backend
- Feature-based directory organization
- No microservices until justified

### Provider Abstraction

All external services (transport, hotels, AI) use adapter patterns:

```
TransportProvider
├── MockTransportProvider
├── RealProviderA
└── RealProviderB

AIProvider
├── OpenRouterProvider
├── DirectModelProvider
└── MockAIProvider
```

### Data Normalization

Provider-specific results normalized into TravelSphere models:
- Transport: single model with is_demo, data_source flags
- AI: structured output with schema validation

### Security First

- Environment-based configuration
- No hard-coded secrets
- Input validation via Pydantic
- Secure password hashing (bcrypt)
- Protected API routes
- Ownership checks on all user resources

## API Design

RESTful conventions with JSON:API influenced patterns.

See API.md for full endpoint catalog.

## Database Design

PostgreSQL with SQLAlchemy 2.0 models.

See DATABASE.md for entity-relationship details.

## AI Architecture

Multi-model orchestration layer:

1. User request → AI Router
2. Model selection based on task
3. One or more model providers
4. Structured response validation
5. Safety/business-rule validation
6. Frontend display

See AI.md for details.

## Key Flows

1. **User Authentication**: Register → Login → Protected routes → Profile
2. **Travel Search**: Form → Provider adapters → Normalized results → Comparison → AI recommendation
3. **Transport Comparison**: Deterministic scoring → Ranking → AI enhancement
4. **Hotel Search**: Provider adapters → Normalized results → Comparison → Save
5. **Itinerary Generation**: AI with verified data + AI-generated suggestions
6. **Group Travel**: Group creation → Invitations → Shared planning → Expense splitting