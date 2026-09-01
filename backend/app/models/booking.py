"""TravelSphere booking / ticket model.

A Booking captures customer contact details (name, mobile, email, address)
together with the travel item being purchased. Each booking holds a unique,
human-readable ticket ID and a lifecycle status, so the customer can look up
and manage their ticket after purchase.
"""

from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # UUID stored as string
    ticket_id: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)  # human readable TS-XXXXXX
    user_id: Mapped[str | None] = mapped_column(String, index=True)  # linked account (optional, guest bookings allowed)

    # Customer contact details (the booking ticket holder)
    customer_name: Mapped[str] = mapped_column(String, nullable=False)
    mobile: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)

    # Travel / item details
    item_type: Mapped[str] = mapped_column(String, nullable=False)  # transport|hotel|activity|food|place
    title: Mapped[str] = mapped_column(String, nullable=False)
    destination: Mapped[str | None] = mapped_column(String)
    travel_date: Mapped[str | None] = mapped_column(String)  # ISO date
    travelers: Mapped[int] = mapped_column(default=1)
    price: Mapped[float] = mapped_column(Float, default=0.0)  # in INR
    currency: Mapped[str] = mapped_column(String, default="INR")

    # Workflow
    status: Mapped[str] = mapped_column(String, default="confirmed")  # confirmed|pending|cancelled
    email_sent: Mapped[bool] = mapped_column(default=False)
    sms_sent: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[str | None] = mapped_column(String)  # ISO timestamp
