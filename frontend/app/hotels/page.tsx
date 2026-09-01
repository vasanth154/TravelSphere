"use client";

import { useMemo, useState, Suspense, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, MapPin, Star, X, Sparkles } from "lucide-react";
import { HOTELS } from "../../lib/demo-data";
import { HotelCard } from "../../components/HotelCard";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { searchHotels, toFrontendHotel, recommendHotel, BackendHotel } from "../../lib/api";

const AMENITIES = ["Free WiFi", "Pool", "Spa", "Restaurant", "Parking", "Beachfront", "Gym", "Bar"];

function HotelsInner() {
  const params = useSearchParams();
  const [city, setCity] = useState(params.get("city") ?? "");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [activeAmen, setActiveAmen] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [liveHotels, setLiveHotels] = useState<BackendHotel[]>([]);
  const [aiPick, setAiPick] = useState<{ name: string; reason: string } | null>(null);
  const [usingDemo, setUsingDemo] = useState(true);

  const results = useMemo(() => {
    if (liveHotels.length > 0) {
      return liveHotels
        .filter((h) => {
          if (city && !h.city.toLowerCase().includes(city.toLowerCase())) return false;
          if (h.price_per_night > maxPrice) return false;
          if (activeAmen.size > 0 && !Array.from(activeAmen).every((a) => h.amenities.includes(a)))
            return false;
          return true;
        })
        .map(toFrontendHotel);
    }
    return HOTELS.filter((h) => {
      if (city && !h.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (h.pricePerNight > maxPrice) return false;
      if (activeAmen.size > 0 && !Array.from(activeAmen).every((a) => h.amenities.includes(a)))
        return false;
      return true;
    });
  }, [city, maxPrice, activeAmen, liveHotels]);

  const runSearch = useCallback(async () => {
    if (!city) return;
    setLoading(true);
    setAiPick(null);
    try {
      const [res, rec] = await Promise.all([
        searchHotels({
          destination: city,
          checkin: checkin || undefined,
          checkout: checkout || undefined,
          guests,
          max_price: maxPrice,
        }),
        recommendHotel({ destination: city, guests, max_price: maxPrice, travel_purpose: "leisure" }),
      ]);
      setLiveHotels(res.hotels);
      setUsingDemo(res.is_demo);
      try {
        sessionStorage.setItem("ts_hotels", JSON.stringify(res.hotels));
      } catch {
        /* storage unavailable */
      }
      if (rec.recommendation) {
        setAiPick({ name: rec.recommendation.name, reason: rec.reason });
      }
    } catch {
      setLiveHotels([]);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
    document.getElementById("hotel-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [city, checkin, checkout, guests, maxPrice]);

  // Initial load when arriving with a city in the URL (e.g. from destination cards)
  useEffect(() => {
    if (city) void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (a: string) =>
    setActiveAmen((p) => {
      const n = new Set(p);
      n.has(a) ? n.delete(a) : n.add(a);
      return n;
    });

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <span className="eyebrow">Stays</span>
        <h1 className="h2">Find your perfect stay</h1>

        {/* Search bar */}
        <form
          className="card-hover mt-6 rounded-3xl bg-white p-5 shadow-card sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void runSearch();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_0.7fr_auto] lg:items-end">
            <Field label="Destination" htmlFor="city">
              <input id="city" className="field" placeholder="City or hotel name"
                value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            <Field label="Check-in" htmlFor="ci">
              <input id="ci" type="date" className="field" value={checkin}
                onChange={(e) => setCheckin(e.target.value)} />
            </Field>
            <Field label="Check-out" htmlFor="co">
              <input id="co" type="date" className="field" value={checkout}
                onChange={(e) => setCheckout(e.target.value)} />
            </Field>
            <Field label="Guests" htmlFor="g">
              <input id="g" type="number" min={1} max={12} className="field"
                value={guests} onChange={(e) => setGuests(Number(e.target.value))} />
            </Field>
            <Button className="lg:h-[50px]" type="submit" loading={loading}>
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </form>

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Filters */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Max price / night
                </div>
                <input type="range" min={3000} max={20000} step={500} value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-600" />
                <div className="mt-1 text-sm font-semibold text-brand-700">
                  {maxPrice >= 20000 ? "₹20,000+" : `₹${maxPrice.toLocaleString("en-IN")}`}
                </div>
              </div>
              <div className="mt-5">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Amenities
                </div>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => (
                    <button key={a} onClick={() => toggle(a)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        activeAmen.has(a)
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              {(city || activeAmen.size > 0 || maxPrice < 20000) && (
                <Button variant="ghost" size="sm" className="mt-5"
                  onClick={() => { setCity(""); setActiveAmen(new Set()); setMaxPrice(20000); setLiveHotels([]); setUsingDemo(true); }}>
                  <X className="h-4 w-4" /> Clear filters
                </Button>
              )}
            </div>
          </aside>

          {/* Results */}
          <div id="hotel-results">
            <p className="mb-4 text-sm text-slate-500">
              <span className="font-bold text-slate-800">{results.length}</span> stays
              <Badge tone={usingDemo ? "accent" : "green"} className="ml-2">
                {usingDemo ? "Demo data" : "Live search"}
              </Badge>
            </p>

            {aiPick && (
              <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <div>
                  <div className="text-sm font-bold text-brand-800">AI pick · {aiPick.name}</div>
                  <p className="mt-0.5 text-sm text-brand-700">{aiPick.reason}</p>
                </div>
              </div>
            )}

            {results.length === 0 ? (
              <div className="card p-10 text-center text-slate-500">
                No stays match your filters. Try widening your search.
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((h) => (
                  <HotelCard key={h.id} hotel={h} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading…</div>}>
      <HotelsInner />
    </Suspense>
  );
}
