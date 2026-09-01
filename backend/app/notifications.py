"""TravelSphere email + SMS confirmation notifications.

Free / zero-cost approach:
  - Email: sent over any SMTP server configured via env vars (e.g. Gmail app
    password, or a free transactional sender). Uses only the Python stdlib
    (smtplib + email), so no paid dependency is introduced.
  - SMS: uses the carrier "email-to-SMS" gateways (e.g. Verizon @vtext.com,
    AT&T @txt.att.net, T-Mobile @tmomail.net). The message is delivered to the
    phone as an SMS at zero cost. Only active if SMS_GATEWAY_DOMAIN is set.

Both channels are best-effort: a ticket is always persisted regardless of
whether notifications succeed, so customer data is never lost on failure.
"""

from __future__ import annotations

import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

# ---------------------------------------------------------------------------
# SMTP / email configuration (env driven, never hardcoded secrets)
# ---------------------------------------------------------------------------


def _enabled() -> bool:
    return os.getenv("ENABLE_EMAIL", "false").lower() in ("1", "true", "yes", "on")


def _smtp_config() -> dict | None:
    host = os.getenv("SMTP_HOST")
    if not host:
        return None
    return {
        "host": host,
        "port": int(os.getenv("SMTP_PORT", "587")),
        "user": os.getenv("SMTP_USER", ""),
        "password": os.getenv("SMTP_PASSWORD", ""),
        "from_email": os.getenv("SMTP_FROM", host),
        "from_name": os.getenv("SMTP_FROM_NAME", "TravelSphere"),
        "tls": os.getenv("SMTP_TLS", "true").lower() in ("1", "true", "yes", "on"),
    }


def _send_email(message: EmailMessage) -> None:
    cfg = _smtp_config()
    if not cfg:
        raise RuntimeError("SMTP not configured (set SMTP_HOST)")
    if cfg["tls"]:
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=30) as server:
            server.starttls()
            if cfg["user"]:
                server.login(cfg["user"], cfg["password"])
            server.send_message(message)
    else:
        with smtplib.SMTP(cfg["host"], cfg["port"], timeout=30) as server:
            if cfg["user"]:
                server.login(cfg["user"], cfg["password"])
            server.send_message(message)


# ---------------------------------------------------------------------------
# SMS via carrier email-to-SMS gateway (free)
# ---------------------------------------------------------------------------


def _sms_enabled() -> bool:
    return os.getenv("ENABLE_SMS", "false").lower() in ("1", "true", "yes", "on")


def _carrier_domain() -> str | None:
    domain = os.getenv("SMS_GATEWAY_DOMAIN", "").strip()
    return domain or None


def _lookup_domain(mobile: str) -> str | None:
    """Resolve a mobile number to an email-to-SMS gateway address."""
    domain = _carrier_domain()
    if not domain:
        return None
    return f"{mobile}@{domain}"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def send_confirmation(*, email: str, mobile: str, customer_name: str, ticket_id: str, title: str, destination: str | None = None, travel_date: str | None = None, price: float = 0.0, currency: str = "INR") -> dict:
    """Send ticket confirmation via email and (optionally) SMS.

    Returns {"email": bool, "sms": bool} indicating which channels succeeded.
    Never raises: any failure is caught and reported as False so the caller
    can persist the booking without losing it.
    """
    result = {"email": False, "sms": False}

    # --- Email --------------------------------------------------------------#
    if _enabled():
        try:
            cfg = _smtp_config()
            if cfg:
                msg = EmailMessage()
                msg["Subject"] = f"TravelSphere booking confirmed - {ticket_id}"
                msg["From"] = formataddr((cfg["from_name"], cfg["from_email"]))
                msg["To"] = email
                body = _render_email(
                    customer_name=customer_name,
                    ticket_id=ticket_id,
                    title=title,
                    destination=destination,
                    travel_date=travel_date,
                    price=price,
                    currency=currency,
                )
                msg.set_content(body)
                _send_email(msg)
                result["email"] = True
        except Exception:  # noqa: BLE001 - notification is best-effort; never lose the booking
            result["email"] = False

    # --- SMS ----------------------------------------------------------------#
    if _sms_enabled():
        sms_email = _lookup_domain(mobile)
        if sms_email:
            try:
                cfg = _smtp_config()
                if cfg:
                    msg = EmailMessage()
                    msg["Subject"] = "TravelSphere ticket"
                    msg["From"] = formataddr((cfg["from_name"], cfg["from_email"]))
                    msg["To"] = sms_email
                    text = f"TS ticket {ticket_id} confirmed for {title}"
                    if travel_date:
                        text += f" on {travel_date}"
                    text += ". Thank you!"
                    msg.set_content(text)
                    _send_email(msg)
                    result["sms"] = True
            except Exception:  # noqa: BLE001 - notification is best-effort; never lose the booking
                result["sms"] = False

    return result


def _render_email(*, customer_name: str, ticket_id: str, title: str, destination: str | None, travel_date: str | None, price: float, currency: str) -> str:
    lines = [
        f"Hi {customer_name},",
        "",
        "Your TravelSphere booking is confirmed.",
        "",
        f"Ticket ID: {ticket_id}",
        f"Booking  : {title}",
    ]
    if destination:
        lines.append(f"Location : {destination}")
    if travel_date:
        lines.append(f"Date     : {travel_date}")
    lines += [
        f"Amount   : {currency} {price}",
        "",
        "Keep this ticket ID handy to check your booking status or cancel.",
        "",
        "Safe travels,",
        "The TravelSphere Team",
    ]
    return "\n".join(lines)
