"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sparkles,
  ArrowRight,
  Plane,
  ShieldCheck,
  IndianRupee,
  Bot,
} from "lucide-react";
import { DESTINATIONS, INTERNATIONAL_DESTINATIONS, HOTELS } from "../lib/demo-data";
import { searchTransport } from "../lib/api";
import { SmartImage } from "../components/SmartImage";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { DestinationCard } from "../components/DestinationCard";
import { HotelCard } from "../components/HotelCard";

const MODES = [
  { icon: "bus", label: "Bus" },
  { icon: "train", label: "Train" },
  { icon: "flight", label: "Flight" },
  { icon: "cab", label: "Cab" },
  { icon: "car", label: "Self-drive" },
  { icon: "metro", label: "Metro" },
  { icon: "bike", label: "Bike" },
];

export default function Home() {
  const router = useRouter();
  const [form, setForm] = useState({
    origin: "Chennai",
    destination: "Madurai",
    departure_date: "2026-09-12",
    travelers: 1,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const quickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await searchTransport(form);
      sessionStorage.setItem("searchResults", JSON.stringify(res));
      router.push("/search/results");
    } catch {
      setError("Search failed. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="relative z-10">
        <SmartImage
          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1900&q=80"
          alt="Scenic travel landscape"
          gradient="from-brand-700 via-brand-600 to-cyan-600"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-900/80 via-brand-800/70 to-slate-900/85" />
        <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 text-center sm:px-6 lg:px-8 lg:pt-28">
          <span className="badge-accent mb-5 inline-flex">
            <Sparkles className="h-3.5 w-3.5" /> AI-powered trip planning
          </span>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Plan smarter trips across <span className="text-accent-300">India</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-50/90">
            Compare every way to travel, book the right stay, and build a complete
            trip — all in one calm, beautiful place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/search" className="btn-accent btn-lg">
              Plan a Trip <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hotels"
              className="btn-lg border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              Explore Hotels
            </Link>
          </div>
        </div>

        {/* Planning widget overlapping hero bottom */}
        <div className="mx-auto -mb-16 max-w-5xl px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={quickSearch}
            className="card-hover rounded-3xl bg-white/95 p-5 shadow-card backdrop-blur sm:p-6"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_0.8fr_auto] lg:items-end">
              <Field label="From" htmlFor="origin" required>
                <input
                  id="origin"
                  className="field"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  required
                />
              </Field>
              <Field label="To" htmlFor="destination" required>
                <input
                  id="destination"
                  className="field"
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  required
                />
              </Field>
              <Field label="Departure" htmlFor="date" required>
                <input
                  id="date"
                  type="date"
                  className="field"
                  value={form.departure_date}
                  onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                  required
                />
              </Field>
              <Field label="Travellers" htmlFor="trav">
                <input
                  id="trav"
                  type="number"
                  min={1}
                  max={10}
                  className="field"
                  value={form.travelers}
                  onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })}
                />
              </Field>
              <Button type="submit" loading={loading} className="lg:h-[50px]">
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
            {error && <p className="field-error mt-3">{error}</p>}
          </form>
        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="section pt-24">
        <div className="flex items-end justify-between">
          <div>
            <span className="eyebrow">Trending now</span>
            <h2 className="h2">Popular destinations</h2>
          </div>
          <Link href="/hotels" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:block">
            View all stays →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((d) => (
            <DestinationCard
              key={d.id}
              name={d.name}
              sub={d.state}
              tagline={d.tagline}
              image={d.image}
              gradient={d.gradient}
              href={`/hotels?city=${encodeURIComponent(d.name)}`}
              meta={`Stays from ₹${d.priceFrom.toLocaleString("en-IN")}`}
            />
          ))}
        </div>
      </section>

      {/* EXPLORE THE WORLD */}
      <section className="section">
        <div>
          <span className="eyebrow">Go global</span>
          <h2 className="h2">Explore the world</h2>
          <p className="lede">
            Discover unforgettable places beyond India — curated international
            escapes for every kind of traveller.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTERNATIONAL_DESTINATIONS.map((d) => (
            <DestinationCard
              key={d.id}
              name={d.name}
              sub={d.country}
              tagline={d.tagline}
              image={d.image}
              gradient={d.gradient}
              href={`/search?destination=${encodeURIComponent(d.name)}`}
              meta="Explore destinations →"
            />
          ))}
        </div>
      </section>

      {/* WHY TRAVELSPHERE */}
      <section className="bg-white py-16">
        <div className="section py-0">
          <div className="text-center">
            <span className="eyebrow">Why TravelSphere</span>
            <h2 className="h2">Built for the way India travels</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Feature icon={Bot} title="AI recommendations" desc="Multi-model suggestions tuned to your trip and budget." />
            <Feature icon={IndianRupee} title="Honest comparison" desc="See the true cost — including fuel & tolls for self-drive." />
            <Feature icon={ShieldCheck} title="Secure & private" desc="JWT auth, hashed passwords and no payment data stored." />
            <Feature icon={Plane} title="Real multi-modal" desc="Combine transport and stays into one itinerary." />
          </div>
        </div>
      </section>

      {/* FEATURED HOTELS */}
      <section className="section">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow">Featured stays</span>
            <h2 className="h2">Hotels across India</h2>
          </div>
          <Link
            href="/hotels"
            className="btn-secondary btn-sm hidden sm:inline-flex"
          >
            View all hotels <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOTELS.map((h) => (
            <HotelCard key={h.id} hotel={h} />
          ))}
        </div>
      </section>

      {/* TRANSPORT MODES */}
      <section className="section">
        <div className="text-center">
          <span className="eyebrow">One search, every option</span>
          <h2 className="h2">Search every way to travel</h2>
          <p className="lede mx-auto">
            Buses, trains, flights, cabs, self-drive, metro and bikes — compared
            side by side on price, time and comfort.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {MODES.map((m) => (
            <Link
              key={m.label}
              href="/search"
              className="card-hover flex flex-col items-center gap-2 p-5 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <ModeGlyph mode={m.icon} />
              </span>
              <span className="text-sm font-semibold text-slate-700">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="section">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 px-8 py-14 text-center shadow-pop">
          <h3 className="text-3xl font-extrabold text-white">Ready to plan your next trip?</h3>
          <p className="mx-auto mt-3 max-w-xl text-brand-50/90">
            Start with a destination and let TravelSphere compare every option for you.
          </p>
          <Link href="/search" className="btn-accent btn-lg mt-6">
            Start planning <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <div className="mt-4 font-bold text-slate-900">{title}</div>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}

function ModeGlyph({ mode }: { mode: string }) {
  const map: Record<string, string> = {
    bus: "🚌",
    train: "🚆",
    flight: "✈️",
    cab: "🚕",
    car: "🚗",
    metro: "🚇",
    bike: "🏍️",
  };
  return <span className="text-xl" aria-hidden>{map[mode] ?? "🚉"}</span>;
}
