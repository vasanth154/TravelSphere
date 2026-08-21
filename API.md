# TravelSphere API

## Base URL

`/api/v1`

## Authentication

All auth endpoints are public (no token required).

All other endpoints require Bearer token in `Authorization: Bearer <jwt>` header.

## Error Response Format

```json
{
  "error": "ERROR_TYPE",
  "message": "Human readable message",
  "path": "optional path to failing field"
}
```

HTTP Status Codes:
- 400 - Bad Request (invalid input)
- 401 - Unauthorized (invalid/missing token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found
- 422 - Validation Error
- 500 - Internal Server Error
```

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |
| GET | `/auth/profile` | Get user profile |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trips` | List user trips |
| POST | `/trips` | Create new trip |
| GET | `/trips/{id}` | Get trip details |
| PUT | `/trips/{id}` | Update trip |
| DELETE | `/trips/{id}` | Delete trip |

### Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/search` | Create travel search |
| GET | `/search/results` | Get search results |

### Transport

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/transport/compare` | Compare options |
| POST | `/transport/save` | Save option |

### Hotels

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/hotels/search` | Search hotels |
| GET | `/hotels/compare` | Compare hotels |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/recommend` | Get AI recommendation |
| POST | `/ai/itinerary` | Generate AI itinerary |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | List trip expenses |
| POST | `/expenses` | Add expense |

### Groups

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create group |
| GET | `/groups` | List groups |
| GET | `/groups/{id}` | Get group details |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |