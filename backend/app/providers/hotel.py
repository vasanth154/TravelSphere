"""Mock hotel provider for development and testing (OYO-style).

Returns deterministic demo hotels across Indian and select international
destinations. Designed as a drop-in stand-in until a real hotel API is wired.
"""

from __future__ import annotations

import uuid
from typing import Any

HOTELS: list[dict[str, Any]] = [
    {
        "id": "goa-palms",
        "name": "Palms & Sands Resort",
        "city": "Goa",
        "location": "Baga Beach Road",
        "rating": 4.4,
        "reviews": 812,
        "price_per_night": 2499,
        "currency": "INR",
        "amenities": ["Free WiFi", "Pool", "Restaurant", "Beachfront", "Bar"],
        "room_types": ["Standard", "Deluxe", "Pool View"],
        "distance_from_attractions": 0.4,
        "availability": "Available",
        "description": "Beachfront resort with a pool and sunset views.",
        "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "goa-casa",
        "name": "Casa Serena Boutique",
        "city": "Goa",
        "location": "Anjuna",
        "rating": 4.6,
        "reviews": 540,
        "price_per_night": 3199,
        "currency": "INR",
        "amenities": ["Free WiFi", "Spa", "Pool", "Restaurant", "Parking"],
        "room_types": ["Standard", "Garden", "Villa"],
        "distance_from_attractions": 1.1,
        "availability": "Available",
        "description": "Boutique stay close to Anjuna flea market and clubs.",
        "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "kochi-fort",
        "name": "Fort Kochi Heritage House",
        "city": "Kochi",
        "location": "Fort Kochi",
        "rating": 4.3,
        "reviews": 402,
        "price_per_night": 1899,
        "currency": "INR",
        "amenities": ["Free WiFi", "Parking", "Restaurant", "Airport Shuttle"],
        "room_types": ["Deluxe", "Heritage"],
        "distance_from_attractions": 0.6,
        "availability": "Available",
        "description": "Colonial heritage stay near Chinese fishing nets.",
        "image": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "ooty-cliff",
        "name": "The Cliff Retreat",
        "city": "Ooty",
        "location": "Fernhill",
        "rating": 4.2,
        "reviews": 318,
        "price_per_night": 2599,
        "currency": "INR",
        "amenities": ["Fireplace", "Restaurant", "Free WiFi", "Parking"],
        "room_types": ["Standard", "Fireplace Cottage"],
        "distance_from_attractions": 2.0,
        "availability": "Available",
        "description": "Cosy cottage with garden and valley views.",
        "image": "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "mumbai-ocean",
        "name": "Ocean View Grand",
        "city": "Mumbai",
        "location": "Marine Drive",
        "rating": 4.5,
        "reviews": 1204,
        "price_per_night": 4599,
        "currency": "INR",
        "amenities": ["Sea View", "Spa", "Gym", "Restaurant", "Bar"],
        "room_types": ["Deluxe Sea View", "Suite"],
        "distance_from_attractions": 0.8,
        "availability": "Available",
        "description": "Skyline hotel facing the Arabian Sea.",
        "image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "delhi-heritage",
        "name": "Heritage Haveli",
        "city": "Delhi",
        "location": "Karol Bagh",
        "rating": 4.1,
        "reviews": 687,
        "price_per_night": 2199,
        "currency": "INR",
        "amenities": ["Free WiFi", "Restaurant", "Parking", "Laundry"],
        "room_types": ["Standard", "Deluxe"],
        "distance_from_attractions": 5.2,
        "availability": "Available",
        "description": "Budget-friendly heritage hotel with rooftop cafe.",
        "image": "https://images.unsplash.com/photo-1565383668446-9012d6b1dbf2?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "paris-marais",
        "name": "Maison du Marais",
        "city": "Paris",
        "location": "Le Marais",
        "rating": 4.6,
        "reviews": 731,
        "price_per_night": 9500,
        "currency": "EUR",
        "amenities": ["Free WiFi", "Bar", "Concierge"],
        "room_types": ["Classic", "Superior"],
        "distance_from_attractions": 1.3,
        "availability": "Available",
        "description": "Charming boutique hotel near Place des Vosges.",
        "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "tokyo-shibuya",
        "name": "Shibuya Moderne",
        "city": "Tokyo",
        "location": "Shibuya",
        "rating": 4.4,
        "reviews": 954,
        "price_per_night": 8200,
        "currency": "JPY",
        "amenities": ["Free WiFi", "Restaurant", "Laundry"],
        "room_types": ["Single", "Twin", "Suite"],
        "distance_from_attractions": 0.5,
        "availability": "Available",
        "description": "Modern compact hotel in the heart of Shibuya.",
        "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "dubai-sky",
        "name": "Skyline Palm Hotel",
        "city": "Dubai",
        "location": "Downtown",
        "rating": 4.7,
        "reviews": 1502,
        "price_per_night": 7200,
        "currency": "AED",
        "amenities": ["Pool", "Spa", "Gym", "Restaurant", "Bar", "Valet"],
        "room_types": ["Deluxe City", "Skyline Suite"],
        "distance_from_attractions": 1.8,
        "availability": "Available",
        "description": "Pool deck with Burj Khalifa views.",
        "image": "https://images.unsplash.com/photo-1556921532-c19a391da33d?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "bengaluru-garden",
        "name": "Garden Court Residency",
        "city": "Bengaluru",
        "location": "Indiranagar",
        "rating": 4.2,
        "reviews": 613,
        "price_per_night": 2799,
        "currency": "INR",
        "amenities": ["Free WiFi", "Gym", "Restaurant", "Parking"],
        "room_types": ["Standard", "Executive"],
        "distance_from_attractions": 3.1,
        "availability": "Limited",
        "description": "Smart business stay with rooftop cafe.",
        "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "madinathapura",
        "name": "Madurai Minakshi Heights",
        "city": "Madurai",
        "location": "Gandhi Museum Road",
        "rating": 3.9,
        "reviews": 274,
        "price_per_night": 1499,
        "currency": "INR",
        "amenities": ["Free WiFi", "Restaurant", "Parking", "Airport Shuttle"],
        "room_types": ["Standard", "Temple View"],
        "distance_from_attractions": 1.2,
        "availability": "Available",
        "description": "Budget stay a short walk from Minakshi Temple.",
        "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "chennai-harbour",
        "name": "Harbour View Suites",
        "city": "Chennai",
        "location": "Marina Beach",
        "rating": 4.1,
        "reviews": 456,
        "price_per_night": 2399,
        "currency": "INR",
        "amenities": ["Sea View", "Restaurant", "Gym", "Free WiFi"],
        "room_types": ["Marina View", "Suite"],
        "distance_from_attractions": 0.9,
        "availability": "Available",
        "description": "Beach-facing rooms near Marina.",
        "image": "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=60",
    },
    {
        "id": "london-kensington",
        "name": "Kensington Garden Lodge",
        "city": "London",
        "location": "Kensington",
        "rating": 4.3,
        "reviews": 867,
        "price_per_night": 7200,
        "currency": "GBP",
        "amenities": ["Free WiFi", "Bar", "Concierge", "Laundry"],
        "room_types": ["Classic", "Garden", "Family"],
        "distance_from_attractions": 2.4,
        "availability": "Available",
        "description": "Quiet Victorian lodge near Kensington gardens.",
        "image": "https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=600&q=60",
    },
]

SUPPORTED_CITIES = sorted({h["city"] for h in HOTELS})


class MockHotelProvider:
    """Demo hotel provider. Returns deterministic, OYO-style search results."""

    name = "MockHotelProvider"

    def search(
        self,
        destination: str,
        checkin: str = "",
        checkout: str = "",
        guests: int = 2,
        max_price: float | None = None,
        min_rating: float | None = None,
        amenities: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Filter demo hotels matching the request."""
        dest_lower = (destination or "").strip().lower()
        results = []
        for hotel in HOTELS:
            if dest_lower and hotel["city"].lower() not in dest_lower and dest_lower not in hotel["city"].lower():
                continue
            if max_price is not None and float(hotel["price_per_night"]) > max_price:
                continue
            if min_rating is not None and hotel["rating"] < min_rating:
                continue
            if amenities and not all(
                a.lower() in [x.lower() for x in hotel["amenities"]] for a in amenities
            ):
                continue
            results.append({**hotel, "id": f"{hotel['id']}__{uuid.uuid4().hex[:6]}"})
        return results

    def get_supported_cities(self) -> list[str]:
        return SUPPORTED_CITIES