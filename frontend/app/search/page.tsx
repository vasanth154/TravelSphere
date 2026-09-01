"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CalendarDays,
  Users,
  Sparkles,
  Wallet,
  Search,
  Check,
} from "lucide-react";
import { searchTransport } from "../../lib/api";
import { DESTINATIONS } from "../../lib/demo-data";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { SwapButton } from "../../components/ui/SwapButton";

const TRIP_TYPES = [
  { id: "leisure", label: "Leisure", icon: "🌴", profile: "comfort_focused" },
  { id: "adventure", label: "Adventure", icon: "🧗", profile: "convenience_focused" },
  { id: "pilgrimage", label: "Pilgrimage", icon: "🛕", profile: "budget_sensitive" },
  { id: "business", label: "Business", icon: "💼", profile: "time_sensitive" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧", profile: "comfort_focused" },
  { id: "romantic", label: "Romantic", icon: "💖", profile: "comfort_focused" },
];

const STEPS = ["Where", "When", "Who", "Trip type", "Preferences"];

export default function PlanPage() {
  const router = useRouter();
  const cities = DESTINATIONS.map((d) => d.name).concat(["Bengaluru", "Delhi", "Hyderabad", "Kolkata"]);
  const [form, setForm] = useState({
    origin: "Chennai",
    destination: "Madurai",
    departure_date: "2026-09-12",
    return_date: "",
    travelers: 1,
    tripType: "leisure" as string,
    budget: 2000,
  });
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const profile = TRIP_TYPES.find((t) => t.id === form.tripType)?.profile;
      const res = await searchTransport({
        origin: form.origin,
        destination: form.destination,
        departure_date: form.departure_date,
        return_date: form.return_date || undefined,
        travelers: form.travelers,
        budget: form.budget,
      });
      sessionStorage.setItem(
        "searchResults",
        JSON.stringify({ ...res, profile }),
      );
      router.push("/search/results");
    } catch {
      setError("Search failed. Please ensure the backend is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = TRIP_TYPES.find((t) => t.id === form.tripType)?.profile;

  return (
    <div className="app-shell">
      <div className="section pt-10">
        <span className="eyebrow">Trip planner</span>
        <h1 className="h2">Plan your journey</h1>
        <p className="lede">
          A few quick steps and we&apos;ll compare every way to get you there.
        </p>

        {/* Stepper */}
        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  i === step
                    ? "bg-brand-600 text-white"
                    : i < step
                      ? "bg-brand-50 text-brand-700"
                      : "bg-white text-slate-500 border border-slate-200"
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    i < step ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Step 1: Where */}
            <Section step={0} active={step} title="Where are you going?" icon={MapPin}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="relative">
                  <Field label="From" htmlFor="origin" required>
                    <input id="origin" list="cities" className="field" value={form.origin}
                      onChange={(e) => set("origin", e.target.value)} required />
                  </Field>
                  <SwapButton onSwap={() => setForm((f) => ({ ...f, origin: f.destination, destination: f.origin }))} />
                </div>
                <Field label="To" htmlFor="destination" required>
                  <input id="destination" list="cities" className="field" value={form.destination}
                    onChange={(e) => set("destination", e.target.value)} required />
                </Field>
              </div>
              <datalist id="cities">
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Section>

            {/* Step 2: When */}
            <Section step={1} active={step} title="When are you travelling?" icon={CalendarDays}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Departure" htmlFor="dep" required>
                  <input id="dep" type="date" className="field" value={form.departure_date}
                    onChange={(e) => set("departure_date", e.target.value)} required />
                </Field>
                <Field label="Return (optional)" htmlFor="ret">
                  <input id="ret" type="date" className="field" value={form.return_date}
                    onChange={(e) => set("return_date", e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Step 3: Who */}
            <Section step={2} active={step} title="Who is travelling?" icon={Users}>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={10} value={form.travelers}
                  onChange={(e) => set("travelers", Number(e.target.value))}
                  className="w-full accent-brand-600" aria-label="Travellers" />
                <span className="min-w-[90px] rounded-lg bg-brand-50 px-3 py-2 text-center text-sm font-bold text-brand-700">
                  {form.travelers} {form.travelers === 1 ? "traveller" : "travellers"}
                </span>
              </div>
            </Section>

            {/* Step 4: Trip type */}
            <Section step={3} active={step} title="What type of trip?" icon={Sparkles}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {TRIP_TYPES.map((t) => (
                  <button type="button" key={t.id} onClick={() => set("tripType", t.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all ${
                      form.tripType === t.id
                        ? "border-brand-500 bg-brand-50 shadow-soft"
                        : "border-slate-200 bg-white hover:border-brand-200"
                    }`}>
                    <span className="text-2xl" aria-hidden>{t.icon}</span>
                    <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Step 5: Preferences */}
            <Section step={4} active={step} title="Preferences" icon={Wallet}>
              <Field label={`Budget per person: ₹${form.budget.toLocaleString("en-IN")}`} htmlFor="budget">
                <input id="budget" type="range" min={500} max={10000} step={100}
                  value={form.budget} onChange={(e) => set("budget", Number(e.target.value))}
                  className="w-full accent-brand-600" />
              </Field>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedProfile && (
                  <Badge tone="brand">
                    <Sparkles className="h-3 w-3" /> Optimising for{" "}
                    {selectedProfile.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </Section>
          </div>

          {/* Summary card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <h3 className="font-bold text-slate-900">Trip summary</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row k="From" v={form.origin} />
                <Row k="To" v={form.destination} />
                <Row k="Departure" v={form.departure_date} />
                <Row k="Travellers" v={String(form.travelers)} />
                <Row k="Style" v={TRIP_TYPES.find((t) => t.id === form.tripType)?.label ?? "—"} />
                <Row k="Budget" v={`₹${form.budget.toLocaleString("en-IN")}`} />
              </dl>
              {error && <p className="field-error mt-4">{error}</p>}
              <div className="mt-5 flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button type="button" className="flex-1" onClick={() => setStep(step + 1)}>
                    Continue
                  </Button>
                ) : (
                  <Button type="submit" loading={loading} className="flex-1">
                    <Search className="h-4 w-4" /> Compare options
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

function Section({
  step,
  active,
  title,
  icon: Icon,
  children,
}: {
  step: number;
  active: number;
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  const show = active === step;
  return (
    <section className={`card overflow-hidden transition-all ${show ? "ring-2 ring-brand-200" : "opacity-70"}`}>
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-bold text-slate-900">{title}</h2>
        {!show && <span className="ml-auto text-xs text-slate-400">Step {step + 1}</span>}
      </div>
      {show && <div className="p-5">{children}</div>}
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{k}</dt>
      <dd className="font-semibold text-slate-800">{v}</dd>
    </div>
  );
}
