"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ticket, Search, ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { getBookingByTicket } from "../../lib/api";

export default function BookingsPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const id = ticketId.trim().toUpperCase();
      await getBookingByTicket(id, mobile.trim());
      router.push(`/bookings/ticket/${id}?mobile=${encodeURIComponent(mobile.trim())}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <span className="eyebrow">Tickets & bookings</span>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="h2">Bookings & tickets</h1>
            <p className="lede">
              Book stays, transport and experiences, then track or cancel with your ticket ID.
            </p>
          </div>
          <Link href="/bookings/new" className="btn-primary">
            <Ticket className="h-4 w-4" /> New booking
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Book something new */}
          <div className="card flex flex-col gap-4 p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Ticket className="h-6 w-6" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Make a booking</h3>
              <p className="mt-1 text-sm text-slate-500">
                Book a hotel, flight, train, activity or food experience. We mint a unique ticket ID
                and email you confirmation.
              </p>
            </div>
            <Link href="/bookings/new" className="btn-accent btn-sm mt-auto self-start">
              Book now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Look up a ticket */}
          <div className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-brand-500" />
              <h3 className="font-bold text-slate-900">Look up your ticket</h3>
            </div>
            <form onSubmit={handleLookup} className="space-y-3">
              <Field label="Ticket ID" htmlFor="ticket" required>
                <input
                  id="ticket"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="field font-mono uppercase"
                  placeholder="TS-XXXX-XXXX"
                  required
                />
              </Field>
              <Field
                label="Mobile number"
                htmlFor="mobile"
                hint="Needed to view or cancel this ticket (unless you are logged in as the buyer)."
              >
                <input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="field"
                  placeholder="+91 98765 43210"
                />
              </Field>
              {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
              <Button type="submit" loading={busy}>
                <CalendarDays className="h-4 w-4" /> Find ticket
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
          Logged in?{" "}
          <Link href="/bookings/my" className="font-semibold text-brand-600">
            View all my bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
