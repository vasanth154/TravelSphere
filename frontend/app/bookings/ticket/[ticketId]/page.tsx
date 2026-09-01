"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Ticket,
  CheckCircle2,
  Mail,
  MessageSquare,
  MapPin,
  CalendarDays,
  Users,
  Ticket as TicketIcon,
  Wallet,
  ArrowLeft,
  XCircle,
} from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { Badge } from "../../../../components/ui/Badge";
import { getBookingByTicket, cancelBookingByTicket, Booking } from "../../../../lib/api";
import { formatINR } from "../../../../lib/format";

function TicketView() {
  const params = useParams();
  const sp = useSearchParams();
  const ticketId = String(params.ticketId || "").toUpperCase();
  const mobile = sp.get("mobile") || "";
  const isNew = sp.get("new") === "1";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await getBookingByTicket(ticketId, mobile || undefined);
      setBooking(res.booking);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [ticketId, mobile]);

  useEffect(() => {
    if (ticketId) void load();
  }, [ticketId, load]);

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm("Cancel this ticket? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await cancelBookingByTicket(ticketId, mobile || undefined);
      setBooking(res.booking);
      setMessage("Ticket cancelled.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const statusTone = (s: Booking["status"]) =>
    s === "confirmed" ? "green" : s === "cancelled" ? "rose" : "accent";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      {error && (
        <div className="card p-8 text-center">
          <XCircle className="mx-auto h-10 w-10 text-rose-400" />
          <h2 className="mt-3 text-lg font-bold text-slate-900">Couldn&apos;t find that ticket</h2>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <Link href="/bookings" className="btn-primary btn-sm mt-5">Look up again</Link>
        </div>
      )}

      {!error && (isNew || booking) && booking && (
        <div className="card overflow-hidden">
          {/* Confirmation banner */}
          {isNew && (
            <div className="flex items-center gap-3 bg-emerald-50 px-6 py-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <div>
                <div className="font-bold text-emerald-800">Booking confirmed!</div>
                <div className="text-sm text-emerald-700">
                  {booking.email_sent ? "Email confirmation sent." : "Email confirmation is not configured yet."}
                  {booking.sms_sent ? " SMS sent." : ""}
                </div>
              </div>
            </div>
          )}

          <div className="border-t-4 border-brand-600 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Ticket className="h-4 w-4" /> TravelSphere ticket
                </div>
                <div className="mt-1 font-mono text-2xl font-extrabold tracking-wide text-slate-900">
                  {booking.ticket_id}
                </div>
              </div>
              <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
            </div>

            <div className="mt-6 grid gap-4 border-y border-slate-100 py-5 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Wallet className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-slate-400">Booking</div>
                  <div className="font-semibold capitalize text-slate-800">{booking.item_type} · {booking.title}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-slate-400">Destination</div>
                  <div className="font-semibold text-slate-800">{booking.destination || "–"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-slate-400">Date</div>
                  <div className="font-semibold text-slate-800">{booking.travel_date || "–"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-xs text-slate-400">Guests · Amount</div>
                  <div className="font-semibold text-slate-800">
                    {booking.travelers} · {formatINR(booking.price)}
                  </div>
                </div>
              </div>
            </div>

            <h4 className="mt-5 text-sm font-bold uppercase tracking-wide text-slate-400">Ticket holder</h4>
            <div className="mt-2 grid gap-2 text-sm text-slate-700">
              <div className="font-semibold text-slate-900">{booking.customer_name}</div>
              <div className="flex items-center gap-1 text-slate-500">{booking.mobile}</div>
              <div className="flex items-center gap-1 text-slate-500">{booking.email}</div>
              {booking.address && <div className="text-slate-500">{booking.address}</div>}
            </div>

            {(booking.email_sent || booking.sms_sent) && (
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
                {booking.email_sent && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> Email sent</span>}
                {booking.sms_sent && <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> SMS sent</span>}
              </div>
            )}

            {booking.status === "confirmed" && (
              <div className="mt-6">
                <Button variant="ghost" className="!border !border-rose-200 !text-rose-600 hover:!bg-rose-50" onClick={handleCancel} loading={busy} disabled={busy}>
                  <TicketIcon className="h-4 w-4" /> Cancel this ticket
                </Button>
                {message && <div className="mt-2 text-sm font-semibold text-emerald-600">{message}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {!error && !booking && (
        <div className="card p-10 text-center text-slate-400">Loading ticket…</div>
      )}
    </div>
  );
}

export default function TicketPage() {
  return (
    <div className="app-shell">
      <div className="section pt-8">
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}>
          <TicketView />
        </Suspense>
      </div>
    </div>
  );
}
