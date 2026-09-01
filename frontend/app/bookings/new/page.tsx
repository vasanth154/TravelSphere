"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ticket, User, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { createBooking } from "../../../lib/api";

const ITEM_TYPES = [
  { value: "hotel", label: "Hotel / stay" },
  { value: "transport", label: "Transport" },
  { value: "activity", label: "Activity" },
  { value: "food", label: "Food experience" },
  { value: "place", label: "Place" },
];

function BookingForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const prefill = {
    item_type: sp.get("item_type") || "hotel",
    title: sp.get("title") || "",
    destination: sp.get("destination") || "",
    price: sp.get("price") || "",
    travel_date: sp.get("travel_date") || "",
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createBooking({
        customer_name: String(fd.get("customer_name")).trim(),
        mobile: String(fd.get("mobile")).trim(),
        email: String(fd.get("email")).trim(),
        address: String(fd.get("address") || "").trim() || undefined,
        item_type: String(fd.get("item_type")),
        title: String(fd.get("title")).trim(),
        destination: String(fd.get("destination") || "").trim() || undefined,
        travel_date: String(fd.get("travel_date") || "").trim() || undefined,
        travelers: Number(fd.get("travelers") || 1),
        price: Number(fd.get("price") || 0),
        currency: "INR",
      });
      const ticketId = res.booking.ticket_id;
      const mobile = String(fd.get("mobile")).trim();
      router.push(`/bookings/ticket/${ticketId}?mobile=${encodeURIComponent(mobile)}&new=1`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/bookings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </Link>

      <div className="card p-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Ticket className="h-6 w-6" />
        </span>
        <h1 className="mt-3 h2">Book a ticket</h1>
        <p className="lede">
          Tell us who to confirm the ticket for. You&apos;ll get a unique ticket ID and email/SMS
          confirmation.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Trip / item details */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">What are you booking?</h3>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type" htmlFor="item_type" required>
                  <select id="item_type" name="item_type" className="field" defaultValue={prefill.item_type}>
                    {ITEM_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date" htmlFor="travel_date">
                  <input id="travel_date" name="travel_date" type="date" className="field" defaultValue={prefill.travel_date} />
                </Field>
              </div>
              <Field label="Name / description" htmlFor="title" required>
                <input id="title" name="title" className="field" placeholder="e.g. Taj Fort Aguada, IndiGo Flight, Scuba dive" defaultValue={prefill.title} required />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Destination" htmlFor="destination">
                  <input id="destination" name="destination" className="field" placeholder="e.g. Goa" defaultValue={prefill.destination} />
                </Field>
                <Field label="Guests" htmlFor="travelers">
                  <input id="travelers" name="travelers" type="number" min={1} max={100} className="field" defaultValue={1} />
                </Field>
              </div>
              <Field label={`Price (₹)`} htmlFor="price">
                <input id="price" name="price" type="number" min={0} step="0.01" className="field" defaultValue={prefill.price} />
              </Field>
            </div>
          </div>

          {/* Customer details */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">Who is the ticket for?</h3>
            <div className="grid gap-4">
              <Field label="Full name" htmlFor="customer_name" required>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="customer_name" name="customer_name" className="field pl-9" placeholder="Ravi Kumar" minLength={2} required />
                </div>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number" htmlFor="mobile" required>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="mobile" name="mobile" type="tel" className="field pl-9" placeholder="+91 98765 43210" pattern="\+?[0-9]{10,15}" required />
                  </div>
                </Field>
                <Field label="Email" htmlFor="email" required>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input id="email" name="email" type="email" className="field pl-9" placeholder="you@example.com" required />
                  </div>
                </Field>
              </div>
              <Field label="Address" htmlFor="address" hint="Optional — used on your ticket.">
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input id="address" name="address" className="field pl-9" placeholder="12 MG Road, Bengaluru" />
                </div>
              </Field>
            </div>
          </div>

          {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}

          <Button type="submit" loading={busy} fullWidth>
            Confirm & get ticket
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <div className="app-shell">
      <div className="section pt-8">
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading…</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </div>
  );
}
