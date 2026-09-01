"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, ArrowLeft, CalendarDays, Users, MapPin } from "lucide-react";
import { Badge } from "../../../components/ui/Badge";
import { listMyBookings, Booking } from "../../../lib/api";
import { formatINR } from "../../../lib/format";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await listMyBookings();
      setBookings(res.bookings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusTone = (s: Booking["status"]) =>
    s === "confirmed" ? "green" : s === "cancelled" ? "rose" : "accent";

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <Link href="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to bookings
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="eyebrow">Your tickets</span>
            <h1 className="h2">My bookings</h1>
          </div>
          <Link href="/bookings/new" className="btn-primary">
            <Ticket className="h-4 w-4" /> New booking
          </Link>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            To view your bookings, please{" "}
            <Link href="/login" className="btn-primary btn-sm mx-1 align-middle">Log in</Link>
            or <span className="font-semibold">{error}</span>
          </div>
        )}

        {!error && busy && <div className="p-10 text-center text-slate-400">Loading…</div>}

        {!error && !busy && bookings.length === 0 && (
          <div className="card mt-5 flex flex-col items-center gap-3 p-10 text-center text-slate-500">
            <Ticket className="h-8 w-8 text-slate-300" />
            <p>No bookings yet. Create your first ticket.</p>
            <Link href="/bookings/new" className="btn-primary btn-sm">Book now</Link>
          </div>
        )}

        {!error && !busy && bookings.length > 0 && (
          <div className="mt-6 space-y-4">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/bookings/ticket/${b.ticket_id}`}
                className="card flex flex-wrap items-center gap-4 p-5 transition hover:shadow-pop"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Ticket className="h-6 w-6" />
                </span>
                <div className="min-w-[180px] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-slate-900">{b.ticket_id}</span>
                    <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  </div>
                  <div className="mt-0.5 font-semibold capitalize text-slate-800">{b.item_type} · {b.title}</div>
                  <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500">
                    {b.destination && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {b.destination}</span>}
                    {b.travel_date && <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {b.travel_date}</span>}
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.travelers}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{formatINR(b.price)}</div>
                  <div className="text-xs text-slate-400">{b.customer_name}</div>
                </div>
                <span className="btn-secondary btn-sm">View</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
