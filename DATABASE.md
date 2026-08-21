# TravelSphere Database Schema

## Core Entities

### User

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String (unique) | User email |
| password_hash | String | bcrypt hash |
| full_name | String | Display name |
| created_at | DateTime | Account creation |
| updated_at | DateTime | Last update |
| preferences | JSON | User preferences |

### Profile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → User |
| locale | String | Language/region |
| budget_sensitive | Boolean | Preference flag |
| time_sensitive | Boolean | Preference flag |
| comfort_focused | Boolean | Preference flag |
| convenience_focused | Boolean | Preference flag |
| favorite_transport | String | Preferred mode |

### Trip

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → User |
| name | String | Trip title |
| origin | String | Departure location |
| destination | String | Arrival location |
| departure_date | DateTime | Outbound |
| return_date | DateTime | Inbound |
| budget | Decimal | Total budget |
| status | String | draft/confirmed/completed |
| created_at | DateTime | |

### TripSearch

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID | FK → Trip |
| origin | String | |
| destination | String | |
| departure_date | Date | |
| return_date | Date | |
| travelers | Integer | |
| budget | Decimal | |
| preferences | JSON | |

### TransportOption

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_search_id | UUID | FK → TripSearch |
| mode | String | Bus/Train/Flight/Car/Bike/Cab/Rental/Metro/Ferry |
| provider | String | Provider name |
| service_name | String | |
| source | String | |
| destination | String | |
| departure | DateTime | |
| arrival | DateTime | |
| duration | Integer | minutes |
| distance | Float | km |
| price | Decimal | |
| currency | String | INR by default |
| travelers | Integer | |
| stops | Integer | |
| availability | String | |
| comfort | Float | 1-10 |
| convenience | Float | 1-10 |
| fuel_cost | Decimal | |
| toll_cost | Decimal | |
| booking_url | String | |
| booking_support | Boolean | |
| is_demo | Boolean | |
| data_source | String | mock_demo/live/provider |

### Hotel

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| destination | String | |
| name | String | |
| rating | Float | 1-5 |
| price_per_night | Decimal | |
| currency | String | INR by default |
| check_in | Date | |
| check_out | Date | |
| guests | Integer | |
| amenities | JSON | |
| location | String | |
| is_demo | Boolean | |
| data_source | String | |

### Itinerary

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID | FK → Trip |
| day_number | Integer | |
| title | String | |
| activities | JSON | |
| transport_options | UUID[] | FK → TransportOption |
| hotel_options | UUID[] | FK → Hotel |
| estimated_cost | Decimal | |
| estimated_duration | String | |

### Expense

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| trip_id | UUID | FK → Trip |
| category | String | Transport/Accommodation/Food/Activity/Other |
| amount | Decimal | |
| currency | String | INR by default |
| description | String | |
| user_id | UUID | FK → User |
| created_at | DateTime | |

### GroupTrip

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | |
| owner_id | UUID | FK → User |
| created_at | DateTime | |

### GroupMember

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| group_id | UUID | FK → GroupTrip |
| user_id | UUID | FK → User |
| role | String | owner/admin/member |
| joined_at | DateTime | |

### Booking

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK → User |
| transport_option_id | UUID | FK → TransportOption |
| hotel_id | UUID | FK → Hotel |
| status | String | pending/confirmed/cancelled |
| booked_at | DateTime | |
| total_price | Decimal | |

### PaymentRecord

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| booking_id | UUID | FK → Booking |
| amount | Decimal | |
| currency | String | |
| provider | String | |
| status | String | pending/failed/succeeded |
| payment_id | String | External provider ID |
| created_at | DateTime | |