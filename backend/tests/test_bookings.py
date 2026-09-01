"""API tests for the TravelSphere booking / ticket system."""

from fastapi.testclient import TestClient

import app.main as m

client = TestClient(m.app)


def _guest_booking(**overrides):
    body = {
        "customer_name": "Anita Rao",
        "mobile": "+919876543210",
        "email": "anita.booking@example.com",
        "address": "22 Lake View Rd, Pune",
        "item_type": "hotel",
        "title": "Goa Beach Resort",
        "destination": "Goa",
        "travel_date": "2026-10-01",
        "travelers": 2,
        "price": 12000,
        "currency": "INR",
    }
    body.update(overrides)
    return body


def test_create_guest_booking_mints_ticket_id():
    email = "guest.create@example.com"
    resp = client.post("/bookings", json=_guest_booking(email=email))
    assert resp.status_code == 201
    data = resp.json()
    booking = data["booking"]
    assert booking["ticket_id"].startswith("TS-")
    assert len(booking["ticket_id"]) > 3
    assert booking["status"] == "confirmed"
    assert booking["customer_name"] == "Anita Rao"
    assert "email_sent" in data and "sms_sent" in data


def test_lookup_ticket_requires_matching_mobile():
    email = "guest.lookup@example.com"
    created = client.post("/bookings", json=_guest_booking(email=email))
    ticket_id = created.json()["booking"]["ticket_id"]

    # without mobile -> 403
    assert client.get(f"/bookings/ticket/{ticket_id}").status_code == 403
    # wrong mobile -> 403
    assert client.get(f"/bookings/ticket/{ticket_id}?mobile=9999999999").status_code == 403
    # matching mobile -> 200
    ok = client.get(f"/bookings/ticket/{ticket_id}?mobile=%2B919876543210")
    assert ok.status_code == 200
    assert ok.json()["booking"]["ticket_id"] == ticket_id


def test_lookup_unknown_ticket_returns_404():
    resp = client.get("/bookings/ticket/TS-DEADBEEF?mobile=%2B919876543210")
    assert resp.status_code == 404


def test_cancel_ticket_changes_status():
    email = "guest.cancel@example.com"
    created = client.post("/bookings", json=_guest_booking(email=email))
    ticket_id = created.json()["booking"]["ticket_id"]
    resp = client.patch(f"/bookings/ticket/{ticket_id}/cancel", json={"mobile": "+919876543210"})
    assert resp.status_code == 200
    assert resp.json()["booking"]["status"] == "cancelled"


def test_booking_validation_errors():
    # bad mobile
    r = client.post("/bookings", json=_guest_booking(mobile="12"))
    assert r.status_code == 422
    # bad email
    r = client.post("/bookings", json=_guest_booking(email="not-an-email"))
    assert r.status_code == 422
    # bad item_type
    r = client.post("/bookings", json=_guest_booking(item_type="spaceship"))
    assert r.status_code == 422
    # short name
    r = client.post("/bookings", json=_guest_booking(customer_name="A"))
    assert r.status_code == 422


def test_logged_in_booking_and_list_me():
    email = "duke.booking@example.com"
    client.post("/auth/register", json={"email": email, "password": "password123", "full_name": "Duke"})
    login = client.post("/auth/login", json={"email": email, "password": "password123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    created = client.post(
        "/bookings",
        json=_guest_booking(email=email, mobile="+911111111111", item_type="transport", title="Flight"),
        headers=headers,
    )
    assert created.status_code == 201
    ticket_id = created.json()["booking"]["ticket_id"]

    # owner can list
    me = client.get("/bookings/me", headers=headers)
    assert me.status_code == 200
    assert any(b["ticket_id"] == ticket_id for b in me.json()["bookings"])

    # owner can fetch without mobile
    fetched = client.get(f"/bookings/ticket/{ticket_id}", headers=headers)
    assert fetched.status_code == 200
