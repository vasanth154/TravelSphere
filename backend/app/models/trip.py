"""TravelSphere trip, booking and expense models.

A Trip is the central object for the "wallet" pillar: it holds transport and
hotel bookings (TripItem), group members (via a join code) and expenses.
"""

from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID stored as string
    code: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)  # join code
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    origin: Mapped[str | None] = mapped_column(String)
    destination: Mapped[str | None] = mapped_column(String)
    start_date: Mapped[str | None] = mapped_column(String)  # ISO date
    end_date: Mapped[str | None] = mapped_column(String)  # ISO date
    travelers: Mapped[int] = mapped_column(default=1)
    budget: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String, default="planning")  # planning|active|completed|cancelled
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp
    updated_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp


class TripMember(Base):
    __tablename__ = "trip_members"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    trip_id: Mapped[str] = mapped_column(String, ForeignKey("trips.id"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, default="member")  # owner|member
    joined_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp


class TripItem(Base):
    """A saved or booked item in a trip (transport, hotel, activity, food, place)."""

    __tablename__ = "trip_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    trip_id: Mapped[str] = mapped_column(String, ForeignKey("trips.id"), index=True, nullable=False)
    added_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    item_type: Mapped[str] = mapped_column(String, nullable=False)  # transport|hotel|activity|food|place
    title: Mapped[str] = mapped_column(String, nullable=False)
    provider: Mapped[str | None] = mapped_column(String)
    mode: Mapped[str | None] = mapped_column(String)  # transport mode
    source: Mapped[str | None] = mapped_column(String)
    destination: Mapped[str | None] = mapped_column(String)
    date: Mapped[str | None] = mapped_column(String)
    departure: Mapped[str | None] = mapped_column(String)
    arrival: Mapped[str | None] = mapped_column(String)
    duration: Mapped[int | None] = mapped_column()
    price: Mapped[float] = mapped_column(Float, default=0.0)  # in INR
    currency: Mapped[str] = mapped_column(String, default="INR")
    travelers: Mapped[int] = mapped_column(default=1)
    status: Mapped[str] = mapped_column(String, default="saved")  # saved|booked|cancelled
    details: Mapped[str | None] = mapped_column(Text)  # optional JSON extras
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    trip_id: Mapped[str] = mapped_column(String, ForeignKey("trips.id"), index=True, nullable=False)
    added_by: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, default="other")  # transport|hotel|food|local|activities|other
    amount: Mapped[float] = mapped_column(Float, nullable=False)  # in INR
    paid_by: Mapped[str | None] = mapped_column(String)  # user id
    date: Mapped[str | None] = mapped_column(String)  # ISO date
    notes: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp