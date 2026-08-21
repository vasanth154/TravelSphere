"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal, CheckCircle2, Route, Plane, Train, Bus, Car, Search, Check, ArrowRight as ArrowRightIcon } from "lucide-react";
import {
  SearchResponse,
  compareTransport,
  searchTransport,
  ComparisonResult,
  TransportOption,
} from "../../../lib/api";
import { TransportCard } from "../../../components/TransportCard";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Spinner } from "../../../components/ui/Spinner";
import { ItineraryBuilder } from "../../../components/ItineraryBuilder";

type SortKey = "recommended" | "cheapest" | "fastest";
const SORTS: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "Recommended" },
  { key: "cheapest", label: "Cheapest" },
  { key: "fastest", label: "Fastest" },
];

const CITIES = [
  "New York", "Los Angeles", "Chicago", "Miami", "Boston", "San Francisco",
  "Seattle", "Denver", "Austin", "Dallas", "Atlanta", "Houston",
  "Dubai", "Singapore", "London", "Paris", "Rome", "Barcelona",
  "Tokyo", "Sydney", "Toronto", "Cape Town", "Bangkok", "Madrid",
  "Amsterdam", "Berlin", "Vienna", "Istanbul", "Mumbai", "Delhi",
  "Bengaluru", "Chennai", "Goa", "Hyderabad", "Jaipur", "Kolkata",
  "Ooty", "Kochi", "Pune", "Madurai", "Varanasi", "Agra", "Kerala",
];

const POPULAR_DESTINATIONS = [
  { id: "newyork", name: "New York", country: "USA", image: "https://images.unsplash.com/photo-1761301643442-6ce65946665f?auto=format&fit=crop&w=400&q=60" },
  { id: "boston", name: "Boston", country: "USA", image: "https://images.unsplash.com/photo-1592922302544-471a5a0a4aef?auto=format&fit=crop&w=400&q=60" },
  { id: "dubai", name: "Dubai", country: "UAE", image: "https://images.unsplash.com/photo-1769389352398-f7b694034eb5?auto=format&fit=crop&w=400&q=60" },
  { id: "london", name: "London", country: "UK", image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=400&q=60" },
  { id: "goa", name: "Goa", country: "India", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=60" },
  { id: "paris", name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=60" },
  { id: "tokyo", name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1764418658531-25596053801e?auto=format&fit=crop&w=400&q=60" },
];

const QUICK_IDEAS = [
  { id: "weekend", label: "Weekend getaway" },
  { id: "business", label: "Business trip" },
  { id: "beach", label: "Beach vacation" },
  { id: "city", label: "City break" },
];

const transportModes = [
  { id: "flight", label: "Flight", icon: Plane },
  { id: "train", label: "Train", icon: Train },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "car", label: "Car", icon: Car },
];

interface SearchForm {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  mode: string | null;
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [profile, setProfile] = useState<string | undefined>(undefined);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [modes, setModes] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchForm>({
    origin: "New York",
    destination: "Boston",
    departureDate: "",
    returnDate: "",
    travelers: 1,
    mode: null,
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("searchResults");
    if (!raw) {
      setLoading(false);
      return;
    }
    const parsed = JSON.parse(raw) as SearchResponse & { profile?: string };
    setData(parsed);
    setProfile(parsed.profile);
    compareTransport(parsed.options, parsed.profile)
      .then(setComparison)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError("");

    try {
      const params = {
        origin: searchForm.origin,
        destination: searchForm.destination,
        departure_date: searchForm.departureDate || new Date().toISOString().split("T")[0],
        return_date: searchForm.returnDate || undefined,
        travelers: searchForm.travelers,
        budget: 2000,
      };

      const res = await searchTransport(params);
      sessionStorage.setItem("searchResults", JSON.stringify(res));
      router.push("/search/results");
    } catch (err) {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDestinationClick = (destination: string) => {
    setSearchForm((s) => ({ ...s, destination, mode: null }));
  };

  const handleQuickIdea = (ideaId: string) => {
    setSearchForm((s) => ({ ...s, mode: ideaId }));
  };

  const toggleMode = (m: string) =>
    setModes((prev) => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });

  const onSelect = (opt: TransportOption) => {
    setSelectedId(opt.id);
    setSaved(true);
    localStorage.setItem(
      "ts_transport",
      JSON.stringify({ ...opt, route: `${data?.origin} → ${data?.destination}` }),
    );
  };

  const visible = useMemo(() => {
    if (!data) return [];
    let opts = data.options;
    if (modes.size > 0) opts = opts.filter((o) => modes.has(o.mode));
    const arr = [...opts];
    if (sort === "cheapest") arr.sort((a, b) => a.price - b.price);
    else if (sort === "fastest") arr.sort((a, b) => a.duration - b.duration);
    else if (comparison?.ranked) {
      const order = new Map(comparison.ranked.map((o, i) => [o.id, i]));
      arr.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
    }
    return arr;
  }, [data, modes, sort, comparison]);

  if (loading) return <Spinner label="Finding the best options…" />;

  if (!data) {
    return (
      <div className="app-shell">
        <div className="section">
          <div className="mb-6">
            <span className="eyebrow">Where will you go next?</span>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Compare every way to travel
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              Compare flights, trains, buses and driving options to find the best way
              to travel.
            </p>
          </div>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="card p-6 shadow-lg sm:p-8 lg:p-10">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="origin">From</label>
                    <input
                      id="origin"
                      type="text"
                      placeholder="New York"
                      value={searchForm.origin}
                      onChange={(e) => setSearchForm((s) => ({ ...s, origin: e.target.value }))}
                      className="field"
                      list="cities"
                      required
                    />
                    <datalist id="cities">
                      {CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="destination">To</label>
                    <input
                      id="destination"
                      type="text"
                      placeholder="Boston"
                      value={searchForm.destination}
                      onChange={(e) => setSearchForm((s) => ({ ...s, destination: e.target.value }))}
                      className="field"
                      list="cities"
                      required
                    />
                    <datalist id="cities">
                      {CITIES.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="field-label" htmlFor="departure-date">Departure</label>
                    <input
                      id="departure-date"
                      type="date"
                      value={searchForm.departureDate}
                      onChange={(e) => setSearchForm((s) => ({ ...s, departureDate: e.target.value }))}
                      className="field"
                      required
                    />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="return-date">Return (optional)</label>
                    <input
                      id="return-date"
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm((s) => ({ ...s, returnDate: e.target.value }))}
                      className="field"
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="travelers">Travelers</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="travelers"
                      type="number"
                      min={1}
                      max={10}
                      value={searchForm.travelers}
                      onChange={(e) => setSearchForm((s) => ({ ...s, travelers: Number(e.target.value) }))}
                      className="w-20 rounded-xl border border-slate-300 px-3 py-2 text-center text-lg font-semibold"
                    />
                    <span className="text-sm text-slate-600">
                      {searchForm.travelers} {searchForm.travelers === 1 ? "adult" : "adults"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-slate-700">Travel mode</p>
                  <div className="flex gap-2">
                    {transportModes.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setSearchForm((s) => ({ ...s, mode: mode.id }))}
                        className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${
                          searchForm.mode === mode.id
                            ? "border-brand-500 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-brand-200"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <mode.icon className="h-5 w-5" />
                          {mode.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {searchError && (
                  <p className="text-xs text-rose-600">{searchError}</p>
                )}

                <Button type="submit" loading={searchLoading} className="w-full">
                  <Search className="h-4 w-4" />
                  {searchLoading ? "Searching..." : "Search & Compare"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Popular destinations</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleDestinationClick(dest.name)}
                  className="card-hover group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-card"
                >
                  <div className="relative aspect-video overflow-hidden rounded-xl">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-sm font-semibold">{dest.name}</p>
                      <p className="text-xs opacity-90">{dest.country}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-lg font-bold text-slate-900">Quick trip ideas</h3>
            <div className="flex flex-wrap gap-2">
              {QUICK_IDEAS.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => handleQuickIdea(idea.id)}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-700"
                >
                  {idea.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-brand-500 via-cyan-500 to-emerald-500 p-6 text-center text-white">
            <div className="mb-3 flex items-center justify-center gap-6 text-sm font-semibold">
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Search
              </span>
              <span className="text-2xl">→</span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Compare
              </span>
              <span className="text-2xl">→</span>
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Choose
              </span>
            </div>
            <p className="text-brand-50/90">Compare every way to travel in one place.</p>
          </div>
        </div>
      </div>
    );
  }

  const availableModes = Array.from(new Set(data.options.map((o) => o.mode)));

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Route className="h-5 w-5" />
            </span>
            <div>
              <div className="text-lg font-bold text-slate-900">
                {data.origin} → {data.destination}
              </div>
              <div className="text-sm text-slate-500">
                {data.departure_date} · {data.travelers}{" "}
                {data.travelers === 1 ? "traveller" : "travellers"}
                {data.budget ? ` · budget ₹${data.budget.toLocaleString("en-IN")}` : ""}
              </div>
            </div>
          </div>
          <Link href="/search" className="btn-secondary btn-sm">
            <ArrowLeft className="h-4 w-4" /> Modify
          </Link>
        </div>

        {saved && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            Transport saved to your trip.
            <Link href="/hotels" className="ml-auto font-bold text-emerald-800 hover:underline">
              Add a hotel <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <h3 className="flex items-center gap-2 font-bold text-slate-900">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </h3>
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Travel mode
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableModes.map((m) => (
                    <button
                      key={m}
                      onClick={() => toggleMode(m)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        modes.has(m)
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                <span className="font-bold text-slate-800">{visible.length}</span> options
                {data.options[0]?.is_demo && (
                  <Badge tone="accent" className="ml-2">
                    Demo data
                  </Badge>
                )}
              </p>
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {SORTS.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSort(s.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      sort === s.key ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {visible.map((opt) => (
                <TransportCard
                  key={opt.id}
                  option={opt}
                  comparison={comparison}
                  selected={selectedId === opt.id}
                  onSelect={() => onSelect(opt)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <span className="eyebrow">Weather-aware planning</span>
          <h2 className="h2">Plan your days</h2>
          <p className="lede">
            Turn your transport into a full day-by-day plan that adapts to the
            weather at {data.destination}.
          </p>
          <div className="mt-6">
            <ItineraryBuilder
              destination={data.destination}
              origin={data.origin}
              startDate={data.departure_date}
              endDate={data.return_date}
              travelers={data.travelers}
              budget={data.budget}
              profile={profile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}