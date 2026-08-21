"""TravelSphere travel search routes."""


from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..providers.transport import MockTransportProvider

router = APIRouter(prefix="/search", tags=["search"])


class SearchRequest(BaseModel):
    origin: str = Field(..., description="Starting location")
    destination: str = Field(..., description="Destination location")
    departure_date: str = Field(..., description="Departure date (YYYY-MM-DD)")
    return_date: str | None = Field(None, description="Return date (YYYY-MM-DD) for round trips")
    travelers: int = Field(1, ge=1, le=10, description="Number of travelers")
    budget: float | None = Field(None, ge=0, description="Maximum budget in INR")
    preferences: dict | None = Field(None, description="User preference profiles")


class SearchResponse(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str | None
    travelers: int
    budget: float | None
    options: list[dict]
    total_options: int


@router.post("/transport", response_model=SearchResponse)
async def search_transport(request: SearchRequest):
    """Search for transport options between origin and destination."""
    provider = MockTransportProvider()
    options = provider.search(
        origin=request.origin,
        destination=request.destination,
        departure_date=request.departure_date,
        return_date=request.return_date,
        travelers=request.travelers,
        budget=request.budget,
        preferences=request.preferences,
    )

    # Normalize options to dict format
    option_dicts = []
    for option in options:
        option_dicts.append({
            "id": option.id,
            "mode": option.mode,
            "provider": option.provider,
            "service_name": option.service_name,
            "source": option.source,
            "destination": option.destination,
            "departure": option.departure,
            "arrival": option.arrival,
            "duration": option.duration,
            "distance": option.distance,
            "price": option.price,
            "currency": option.currency,
            "travelers": option.travelers,
            "stops": option.stops,
            "availability": option.availability,
            "comfort": option.comfort,
            "convenience": option.convenience,
            "fuel_cost": option.fuel_cost,
            "toll_cost": option.toll_cost,
            "booking_url": option.booking_url,
            "booking_support": option.booking_support,
            "is_demo": option.is_demo,
            "data_source": option.data_source,
        })

    return SearchResponse(
        origin=request.origin,
        destination=request.destination,
        departure_date=request.departure_date,
        return_date=request.return_date,
        travelers=request.travelers,
        budget=request.budget,
        options=option_dicts,
        total_options=len(option_dicts),
    )