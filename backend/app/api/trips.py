"""TravelSphere trips, bookings, group collaboration and expense routes.

Covers the "wallet / trip management" pillar: create trips, join via code,
save/book transport+hotel items, track group expenses and view budgets.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..db import SessionLocal
from ..models.trip import Expense, Trip, TripItem, TripMember
from .auth import get_current_user

router = APIRouter(prefix="/trips", tags=["trips"])


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _trip_dict(trip: Trip) -> dict[str, Any]:
    return {
        "id": trip.id,
        "code": trip.code,
        "owner_id": trip.owner_id,
        "title": trip.title,
        "origin": trip.origin,
        "destination": trip.destination,
        "start_date": trip.start_date,
        "end_date": trip.end_date,
        "travelers": trip.travelers,
        "budget": trip.budget,
        "status": trip.status,
        "created_at": trip.created_at,
        "updated_at": trip.updated_at,
    }


def _item_dict(item: TripItem) -> dict[str, Any]:
    return {
        "id": item.id,
        "trip_id": item.trip_id,
        "added_by": item.added_by,
        "item_type": item.item_type,
        "title": item.title,
        "provider": item.provider,
        "mode": item.mode,
        "source": item.source,
        "destination": item.destination,
        "date": item.date,
        "departure": item.departure,
        "arrival": item.arrival,
        "duration": item.duration,
        "price": item.price,
        "currency": item.currency,
        "travelers": item.travelers,
        "status": item.status,
        "details": item.details,
        "created_at": item.created_at,
    }


def _expense_dict(exp: Expense) -> dict[str, Any]:
    return {
        "id": exp.id,
        "trip_id": exp.trip_id,
        "added_by": exp.added_by,
        "title": exp.title,
        "category": exp.category,
        "amount": exp.amount,
        "paid_by": exp.paid_by,
        "date": exp.date,
        "notes": exp.notes,
        "created_at": exp.created_at,
    }


def _member_dict(m: TripMember) -> dict[str, Any]:
    return {"id": m.id, "trip_id": m.trip_id, "user_id": m.user_id, "role": m.role, "joined_at": m.joined_at}


class TripCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    origin: str | None = None
    destination: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    travelers: int = Field(1, ge=1, le=100)
    budget: float | None = Field(None, ge=0)


class JoinRequest(BaseModel):
    code: str = Field(..., min_length=4, max_length=16)


class ItemCreate(BaseModel):
    item_type: str = Field(..., description="transport|hotel|activity|food|place")
    title: str = Field(..., min_length=1, max_length=200)
    provider: str | None = None
    mode: str | None = None
    source: str | None = None
    destination: str | None = None
    date: str | None = None
    departure: str | None = None
    arrival: str | None = None
    duration: int | None = Field(None, ge=0)
    price: float = Field(0.0, ge=0)
    currency: str = "INR"
    travelers: int = 1
    details: str | None = None


class ItemStatus(BaseModel):
    status: str = Field(..., description="saved|booked|cancelled")


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    category: str = "other"
    amount: float = Field(..., gt=0)
    paid_by: str | None = None
    date: str | None = None
    notes: str | None = None


@router.post("", status_code=201)
async def create_trip(payload: TripCreate, user: dict = Depends(get_current_user)):  # noqa: B008
    """Create a new trip owned by the current user."""
    trip_id = str(uuid.uuid4())
    code = uuid.uuid4().hex[:8].upper()
    db = SessionLocal()
    try:
        trip = Trip(
            id=trip_id,
            code=code,
            owner_id=user["id"],
            title=payload.title,
            origin=payload.origin,
            destination=payload.destination,
            start_date=payload.start_date,
            end_date=payload.end_date,
            travelers=payload.travelers,
            budget=payload.budget,
            status="planning",
            created_at=_now(),
            updated_at=_now(),
        )
        db.add(trip)
        owner = TripMember(id=str(uuid.uuid4()), trip_id=trip_id, user_id=user["id"], role="owner", joined_at=_now())
        db.add(owner)
        db.commit()
        db.refresh(trip)
        return {"trip": _trip_dict(trip), "code": code}
    finally:
        db.close()


@router.get("")
async def list_trips(user: dict = Depends(get_current_user)):  # noqa: B008
    """List trips where the user is owner or member."""
    db = SessionLocal()
    try:
        member_ids = [
            m.trip_id
            for m in db.query(TripMember).filter(TripMember.user_id == user["id"]).all()
        ]
        trips = db.query(Trip).filter(Trip.id.in_(member_ids)).all() if member_ids else []
        return {"trips": [_trip_dict(t) for t in trips]}
    finally:
        db.close()


@router.get("/{trip_id}")
async def get_trip(trip_id: str, user: dict = Depends(get_current_user)):  # noqa: B008
    """Get a trip with its members, items and expenses."""
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found")
        membership = (
            db.query(TripMember)
            .filter(TripMember.trip_id == trip_id, TripMember.user_id == user["id"])
            .first()
        )
        if membership is None and trip.owner_id != user["id"]:
            raise HTTPException(status_code=403, detail="Not a member of this trip")

        items = db.query(TripItem).filter(TripItem.trip_id == trip_id).all()
        expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
        members = db.query(TripMember).filter(TripMember.trip_id == trip_id).all()

        return {
            "trip": _trip_dict(trip),
            "members": [_member_dict(m) for m in members],
            "items": [_item_dict(i) for i in items],
            "expenses": [_expense_dict(e) for e in expenses],
        }
    finally:
        db.close()


@router.post("/join")
async def join_trip(payload: JoinRequest, user: dict = Depends(get_current_user)):  # noqa: B008
    """Join a trip using its share code."""
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(Trip.code == payload.code.strip().upper()).first()
        if trip is None:
            raise HTTPException(status_code=404, detail="Invalid trip code")
        existing = (
            db.query(TripMember)
            .filter(TripMember.trip_id == trip.id, TripMember.user_id == user["id"])
            .first()
        )
        if existing:
            return {"trip": _trip_dict(trip), "already_member": True}
        db.add(
            TripMember(id=str(uuid.uuid4()), trip_id=trip.id, user_id=user["id"], role="member", joined_at=_now())
        )
        trip.updated_at = _now()
        db.commit()
        return {"trip": _trip_dict(trip), "already_member": False}
    finally:
        db.close()


def _membership_guard(db, trip_id: str, user: dict) -> Trip:
    """Return the trip if the user is owner or member, else raise 403/404."""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    membership = (
        db.query(TripMember)
        .filter(TripMember.trip_id == trip_id, TripMember.user_id == user["id"])
        .first()
    )
    if membership is None and trip.owner_id != user["id"]:
        raise HTTPException(status_code=403, detail="Not a member of this trip")
    return trip


@router.post("/{trip_id}/items", status_code=201)
async def add_item(trip_id: str, payload: ItemCreate, user: dict = Depends(get_current_user)):  # noqa: B008
    """Add or book a transport/hotel/activity item to a trip."""
    db = SessionLocal()
    try:
        _membership_guard(db, trip_id, user)
        item = TripItem(
            id=str(uuid.uuid4()),
            trip_id=trip_id,
            added_by=user["id"],
            item_type=payload.item_type,
            title=payload.title,
            provider=payload.provider,
            mode=payload.mode,
            source=payload.source,
            destination=payload.destination,
            date=payload.date,
            departure=payload.departure,
            arrival=payload.arrival,
            duration=payload.duration,
            price=payload.price,
            currency=payload.currency,
            travelers=payload.travelers,
            status="booked" if payload.item_type in ("transport", "hotel") else "saved",
            details=payload.details,
            created_at=_now(),
        )
        db.add(item)
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip:
            trip.updated_at = _now()
        db.commit()
        db.refresh(item)
        return {"item": _item_dict(item)}
    finally:
        db.close()


@router.patch("/{trip_id}/items/{item_id}")
async def update_item_status(
    trip_id: str, item_id: str, payload: ItemStatus, user: dict = Depends(get_current_user)  # noqa: B008
):
    """Update the status of a trip item (saved/booked/cancelled)."""
    db = SessionLocal()
    try:
        _membership_guard(db, trip_id, user)
        item = (
            db.query(TripItem)
            .filter(TripItem.id == item_id, TripItem.trip_id == trip_id)
            .first()
        )
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        item.status = payload.status
        db.commit()
        db.refresh(item)
        return {"item": _item_dict(item)}
    finally:
        db.close()


@router.delete("/{trip_id}/items/{item_id}", status_code=204)
async def delete_item(trip_id: str, item_id: str, user: dict = Depends(get_current_user)):  # noqa: B008
    """Remove an item from a trip."""
    db = SessionLocal()
    try:
        _membership_guard(db, trip_id, user)
        item = (
            db.query(TripItem)
            .filter(TripItem.id == item_id, TripItem.trip_id == trip_id)
            .first()
        )
        if item is None:
            raise HTTPException(status_code=404, detail="Item not found")
        db.delete(item)
        db.commit()
        return
    finally:
        db.close()


@router.post("/{trip_id}/expenses", status_code=201)
async def add_expense(trip_id: str, payload: ExpenseCreate, user: dict = Depends(get_current_user)):  # noqa: B008
    """Add an expense to a trip."""
    db = SessionLocal()
    try:
        _membership_guard(db, trip_id, user)
        expense = Expense(
            id=str(uuid.uuid4()),
            trip_id=trip_id,
            added_by=user["id"],
            title=payload.title,
            category=payload.category,
            amount=payload.amount,
            paid_by=payload.paid_by or user["id"],
            date=payload.date,
            notes=payload.notes,
            created_at=_now(),
        )
        db.add(expense)
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip:
            trip.updated_at = _now()
        db.commit()
        db.refresh(expense)
        return {"expense": _expense_dict(expense)}
    finally:
        db.close()


@router.get("/{trip_id}/budget")
async def trip_budget(trip_id: str, user: dict = Depends(get_current_user)):  # noqa: B008
    """Compute spent, planned and remaining budget for a trip."""
    db = SessionLocal()
    try:
        trip = _membership_guard(db, trip_id, user)

        expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
        items = db.query(TripItem).filter(TripItem.trip_id == trip_id).all()

        spent = sum(e.amount for e in expenses)
        planned = sum(i.price for i in items if i.status != "cancelled")
        actual = spent + planned

        budget = trip.budget
        if budget is not None:
            remaining = budget - actual
        else:
            remaining = None

        per_person = actual / trip.travelers if trip.travelers else actual

        return {
            "trip_id": trip_id,
            "budget": budget,
            "spent": round(spent, 2),
            "planned": round(planned, 2),
            "total": round(actual, 2),
            "remaining": round(remaining, 2) if remaining is not None else None,
            "per_person": round(per_person, 2),
            "travelers": trip.travelers,
        }
    finally:
        db.close()