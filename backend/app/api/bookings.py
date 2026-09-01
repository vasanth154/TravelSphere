"""TravelSphere booking / ticket confirmation routes.

Creates a booking with full customer contact details (name, mobile, email,
address), mints a unique human-readable ticket ID, persists the booking in the
database, and triggers best-effort email/SMS confirmation. Tickets can be
looked up and cancelled by ticket ID + mobile.

The booking is ALWAYS persisted even if notification delivery fails, so
customer data is never lost.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field, field_validator

from ..db import SessionLocal
from ..models.booking import Booking
from ..notifications import send_confirmation
from .auth import decode_access_token, get_current_user

router = APIRouter(prefix="/bookings", tags=["bookings"])

_bearer = HTTPBearer(auto_error=False)


async def _optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),  # noqa: B008
) -> dict | None:
    """Resolve the current user if a valid token is present, else None (guest)."""
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None or payload.get("sub") is None:
        return None
    return {"id": payload["sub"]}

_ALLOWED_TYPES = {"transport", "hotel", "activity", "food", "place"}
_STATUSES = {"confirmed", "pending", "cancelled"}
_MOBILE_RE = re.compile(r"^\+?[0-9]{10,15}$")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _gen_ticket_id(db) -> str:
    """Mint a unique human-readable ticket ID (TS-XXXXXXXX) with retry."""
    for _ in range(20):
        candidate = "TS-" + uuid.uuid4().hex[:8].upper()
        exists = db.query(Booking).filter(Booking.ticket_id == candidate).first()
        if not exists:
            return candidate
    raise HTTPException(status_code=500, detail="Could not generate a unique ticket ID")


def _booking_dict(b: Booking) -> dict[str, Any]:
    return {
        "id": b.id,
        "ticket_id": b.ticket_id,
        "customer_name": b.customer_name,
        "mobile": b.mobile,
        "email": b.email,
        "address": b.address,
        "item_type": b.item_type,
        "title": b.title,
        "destination": b.destination,
        "travel_date": b.travel_date,
        "travelers": b.travelers,
        "price": b.price,
        "currency": b.currency,
        "status": b.status,
        "email_sent": b.email_sent,
        "sms_sent": b.sms_sent,
        "created_at": b.created_at,
    }


def _find_by_ticket(db, ticket_id: str) -> Booking:
    b = db.query(Booking).filter(Booking.ticket_id == ticket_id.strip().upper()).first()
    if b is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return b


class BookingCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=120)
    mobile: str = Field(..., min_length=10, max_length=16)
    email: EmailStr
    address: str | None = Field(None, max_length=500)
    item_type: str = Field(..., description="transport|hotel|activity|food|place")
    title: str = Field(..., min_length=1, max_length=200)
    destination: str | None = None
    travel_date: str | None = None
    travelers: int = Field(1, ge=1, le=100)
    price: float = Field(0.0, ge=0)
    currency: str = "INR"

    @field_validator("mobile")
    @classmethod
    def _mobile(cls, v: str) -> str:
        v = v.strip()
        if not _MOBILE_RE.match(v):
            raise ValueError("Invalid mobile number (10-15 digits, optional leading +)")
        return v

    @field_validator("item_type")
    @classmethod
    def _item_type(cls, v: str) -> str:
        if v not in _ALLOWED_TYPES:
            raise ValueError(f"item_type must be one of {sorted(_ALLOWED_TYPES)}")
        return v


class TicketLookup(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=16)


class BookingCancel(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=16)


@router.post("", status_code=201)
async def create_booking(payload: BookingCreate, user: dict | None = Depends(_optional_user)):  # noqa: B008
    """Create a booking (guest or logged-in) and confirm by email/SMS."""
    db = SessionLocal()
    try:
        ticket_id = _gen_ticket_id(db)
        booking = Booking(
            id=str(uuid.uuid4()),
            ticket_id=ticket_id,
            user_id=user["id"] if user else None,
            customer_name=payload.customer_name,
            mobile=payload.mobile,
            email=str(payload.email).lower(),
            address=payload.address,
            item_type=payload.item_type,
            title=payload.title,
            destination=payload.destination,
            travel_date=payload.travel_date,
            travelers=payload.travelers,
            price=payload.price,
            currency=payload.currency,
            status="confirmed",
            created_at=_now(),
        )
        db.add(booking)
        # Persist first so a notification failure never loses the booking.
        db.commit()
        db.refresh(booking)

        notified = send_confirmation(
            email=booking.email,
            mobile=booking.mobile,
            customer_name=booking.customer_name,
            ticket_id=booking.ticket_id,
            title=booking.title,
            destination=booking.destination,
            travel_date=booking.travel_date,
            price=booking.price,
            currency=booking.currency,
        )
        booking.email_sent = notified["email"]
        booking.sms_sent = notified["sms"]
        db.commit()
        db.refresh(booking)

        return {
            "booking": _booking_dict(booking),
            "email_sent": booking.email_sent,
            "sms_sent": booking.sms_sent,
        }
    finally:
        db.close()


@router.get("/me")
async def list_my_bookings(user: dict = Depends(get_current_user)):  # noqa: B008
    """List bookings created by the logged-in user."""
    db = SessionLocal()
    try:
        rows = db.query(Booking).filter(Booking.user_id == user["id"]).order_by(Booking.created_at).all()
        return {"bookings": [_booking_dict(r) for r in rows]}
    finally:
        db.close()


@router.get("/ticket/{ticket_id}")
async def lookup_ticket(ticket_id: str, mobile: str = "", user: dict | None = Depends(_optional_user)):  # noqa: B008
    """Look up a ticket by its ID.

    Privacy: a guest must also supply the registered mobile number to fetch the
    ticket; a logged-in user who owns the booking can fetch it directly.
    """
    db = SessionLocal()
    try:
        booking = _find_by_ticket(db, ticket_id)
        owned = user is not None and booking.user_id == user["id"]
        if not owned:
            if not mobile.strip():
                raise HTTPException(status_code=403, detail="Mobile number required to view this ticket")
            if booking.mobile != mobile.strip():
                raise HTTPException(status_code=403, detail="Mobile number does not match this ticket")
        return {"booking": _booking_dict(booking)}
    finally:
        db.close()


@router.patch("/ticket/{ticket_id}/cancel")
async def cancel_ticket(ticket_id: str, payload: BookingCancel, user: dict | None = Depends(_optional_user)):  # noqa: B008
    """Cancel a ticket. Owner (logged-in) or matching mobile (guest)."""
    db = SessionLocal()
    try:
        booking = _find_by_ticket(db, ticket_id)
        owned = user is not None and booking.user_id == user["id"]
        if not owned and booking.mobile != payload.mobile.strip():
            raise HTTPException(status_code=403, detail="Mobile number does not match this ticket")
        if booking.status == "cancelled":
            return {"booking": _booking_dict(booking)}
        booking.status = "cancelled"
        db.commit()
        db.refresh(booking)
        return {"booking": _booking_dict(booking)}
    finally:
        db.close()
