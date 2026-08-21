"""Mock transport provider for development and testing."""

import random
import uuid
from typing import Any

from app.models.transport import TransportOption

MOCK_TRANSPORT_DATA: list[dict[str, Any]] = [
    # Chennai to Madurai
    {"mode": "bus", "service_name": "TNSTC Volvo", "departure": "06:00", "arrival": "10:30", "duration": "260", "distance": "210", "price": 350, "stops": 3, "comfort": 7, "convenience": 6},
    {"mode": "bus", "service_name": "Private Bus", "departure": "07:30", "arrival": "12:00", "duration": "270", "distance": "210", "price": 420, "stops": 2, "comfort": 6, "convenience": 7},
    {"mode": "train", "service_name": "Chennai Madurai Express", "departure": "06:15", "arrival": "10:45", "duration": "270", "distance": "210", "price": 280, "stops": 5, "comfort": 8, "convenience": 7},
    {"mode": "train", "service_name": "Vaigai Superfast", "departure": "07:00", "arrival": "11:30", "duration": "270", "distance": "210", "price": 350, "stops": 3, "comfort": 9, "convenience": 8},
    {"mode": "flight", "service_name": "Chennai-Madurai Flight", "departure": "07:30", "arrival": "08:45", "duration": "75", "distance": "435", "price": 1800, "stops": 0, "comfort": 8, "convenience": 9},
    {"mode": "flight", "service_name": "Chennai-Madurai Flight (IndiGo)", "departure": "09:00", "arrival": "10:15", "duration": "75", "distance": "435", "price": 2200, "stops": 0, "comfort": 7, "convenience": 8},
    {"mode": "car", "service_name": "Self Drive Car", "departure": "06:00", "arrival": "10:15", "duration": "255", "distance": "210", "price": 800, "stops": 0, "comfort": 9, "convenience": 8},
    {"mode": "cab", "service_name": "Ola Outstation", "departure": "06:30", "arrival": "10:45", "duration": "255", "distance": "210", "price": 1200, "stops": 0, "comfort": 7, "convenience": 8},
    {"mode": "bike", "service_name": "Rental Bike", "departure": "06:00", "arrival": "09:30", "duration": "210", "distance": "210", "price": 450, "stops": 0, "comfort": 5, "convenience": 6},
    {"mode": "metro", "service_name": "Chennai Metro to Airport + Flight", "departure": "06:00", "arrival": "11:00", "duration": "300", "distance": "210", "price": 180, "stops": 5, "comfort": 6, "convenience": 5},
]


class MockTransportProvider:
    """Mock transport provider that generates realistic demo data."""
    
    def __init__(self):
        self.name = "MockTransportProvider"
        self.supported_modes = ["bus", "train", "flight", "car", "cab", "bike", "metro"]
    
    def search(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: str | None = None,
        travelers: int = 1,
        budget: float | None = None,
        preferences: dict[str, Any] | None = None,
    ) -> list[TransportOption]:
        """Search for transport options between origin and destination."""
        options = []
        
        # Generate mock data based on routes
        base_price_multiplier = 1.0
        if budget and budget > 0:
            base_price_multiplier = min(2.0, budget / 500.0)
        
        for i, data in enumerate(random.sample(MOCK_TRANSPORT_DATA, min(len(MOCK_TRANSPORT_DATA), 10))):
            # Scale price by budget multiplier
            price = round(data["price"] * base_price_multiplier * random.uniform(0.8, 1.2))
            
            # Skip if over budget
            if budget and price > budget:
                continue
            
            # Generate arrival/departure times
            from datetime import datetime, timedelta, timezone
            dep_dt = datetime.now(timezone.utc).replace(hour=6, minute=0, second=0, microsecond=0) + timedelta(hours=random.randint(0, 18))
            
            option = TransportOption(
                id=f"mock_{data['mode']}_{i}_{uuid.uuid4().hex[:8]}",
                mode=data["mode"],
                provider=self.name,
                service_name=data["service_name"],
                source=origin,
                destination=destination,
                departure=dep_dt.strftime("%H:%M"),
                arrival=(dep_dt + timedelta(minutes=int(data["duration"]))).strftime("%H:%M"),
                duration=int(data["duration"]),
                distance=round(float(data["distance"]) * random.uniform(0.95, 1.05)),
                price=price,
                currency="INR",
                travelers=travelers,
                stops=int(data["stops"]),
                availability="Available",
                comfort=round(data["comfort"] * random.uniform(0.9, 1.1)),
                convenience=round(data["convenience"] * random.uniform(0.9, 1.1)),
                fuel_cost=round(price * 0.15),
                toll_cost=round(price * 0.05),
                booking_url=f"https://example.com/booking/{data['mode']}/{i}",
                booking_support=data["mode"] != "flight",
                is_demo=True,
                data_source="mock_demo",
            )
            options.append(option)
        
        return options
    
    def get_available_modes(self) -> list[str]:
        """Return list of supported transport modes."""
        return self.supported_modes