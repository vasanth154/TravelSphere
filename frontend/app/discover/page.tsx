"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Utensils,
  MapPin,
  Compass,
  Sparkles,
  Clock,
  Briefcase,
  Mountain,
  Search,
  Star,
} from "lucide-react";
import {
  discoverNearby,
  discoverFood,
  discoverTimePlan,
  whereShouldIGo,
  packingList,
  destinationGuide,
  travelChat,
  NearbyResponse,
  TimePlanResponse,
  WhereResponse,
  PackingResponse,
  GuideResponse,
} from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { SmartImage } from "../../components/SmartImage";
import { ChatWidget } from "../../components/ChatWidget";
import {
  demoNearby,
  demoFood,
  demoPlan,
  demoWhere,
  demoPack,
  demoGuide,
  resolveCity,
} from "../../lib/demo-discover";

type Tab = "nearby" | "food" | "plan" | "where" | "pack";

function DiscoverInner() {
  const params = useSearchParams();
  const [city, setCity] = useState(params.get("city") ?? "Goa");
  const [tab, setTab] = useState<Tab>("nearby");
  const [busy, setBusy] = useState(false);
  const [nearby, setNearby] = useState<NearbyResponse | null>(null);
  const [foodStyle, setFoodStyle] = useState("");
  const [foodBudget, setFoodBudget] = useState("");
  const [food, setFood] = useState<{ recommendations: NearbyResponse["restaurants"] } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState("evening");
  const [plan, setPlan] = useState<TimePlanResponse | null>(null);
  const [prefs, setPrefs] = useState("beach");
  const [where, setWhere] = useState<WhereResponse | null>(null);
  const [packDays, setPackDays] = useState(3);
  const [pack, setPack] = useState<PackingResponse | null>(null);
  const [guide, setGuide] = useState<GuideResponse | null>(null);

  useEffect(() => {
    void loadNearby();
    void loadGuide();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  async function loadNearby() {
    setBusy(true);
    try {
      setNearby(await discoverNearby({ city, max_cost: 100000 }));
    } catch {
      setNearby(demoNearby(resolveCity(city)));
    } finally {
      setBusy(false);
    }
  }

  async function loadGuide() {
    try {
      setGuide(await destinationGuide(city));
    } catch {
      setGuide(demoGuide(resolveCity(city)));
    }
  }

  async function runFood() {
    setBusy(true);
    try {
      setFood(
        await discoverFood({
          city,
          style: foodStyle || undefined,
          budget: foodBudget ? Number(foodBudget) : undefined,
        }),
      );
    } catch {
      setFood(demoFood(resolveCity(city)));
    } finally {
      setBusy(false);
    }
  }

  async function runPlan() {
    setBusy(true);
    try {
      setPlan(await discoverTimePlan({ city, time_of_day: timeOfDay }));
    } catch {
      setPlan(demoPlan(resolveCity(city), timeOfDay));
    } finally {
      setBusy(false);
    }
  }

  async function runWhere() {
    setBusy(true);
    try {
      setWhere(await whereShouldIGo({ preferences: prefs }));
    } catch {
      setWhere(demoWhere(prefs));
    } finally {
      setBusy(false);
    }
  }

  async function runPack() {
    setBusy(true);
    try {
      setPack(await packingList({ city, days: packDays }));
    } catch {
      setPack(demoPack(resolveCity(city), packDays));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <span className="eyebrow">Discover</span>
        <h1 className="h2">Explore, eat, plan & pack</h1>
        <p className="lede">Local inspiration for {city} — plus your AI travel buddy.</p>

        <div className="mt-6 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="City" htmlFor="dc">
              <input id="dc" className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Goa, Kochi, Paris…" />
            </Field>
          </div>
          <Button onClick={loadNearby} loading={busy}>
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "nearby", label: "What's around", icon: Compass },
            { key: "food", label: "Eat", icon: Utensils },
            { key: "plan", label: "Time plan", icon: Clock },
            { key: "where", label: "Where to go", icon: Mountain },
            { key: "pack", label: "Pack", icon: Briefcase },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.key ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Snapshot banner */}
        {nearby && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
            <p className="text-sm text-brand-800">{nearby.snapshot}</p>
          </div>
        )}

        <div className="mt-6">
          {tab === "nearby" && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><Utensils className="h-4 w-4 text-brand-500" /> Restaurants</h3>
                <div className="space-y-3">
                  {nearby?.restaurants.map((r) => (
                    <div key={r.name} className="flex gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <SmartImage
                        src={r.image || ""}
                        alt={r.name}
                        width={64}
                        height={64}
                        gradient="from-rose-500 via-orange-400 to-amber-400"
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800">{r.name}</span>
                          <Badge tone="brand">{r.rating}★</Badge>
                        </div>
                        <div className="text-xs text-slate-500 capitalize">{r.cuisine} · {r.type} · ~₹{r.avg_cost}</div>
                        {r.must_try && <div className="text-xs font-medium text-brand-600">Must try: {r.must_try}</div>}
                      </div>
                    </div>
                  ))}
                  {!nearby?.restaurants.length && <p className="text-sm text-slate-400">No matches.</p>}
                </div>
              </section>
              <section className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900"><MapPin className="h-4 w-4 text-brand-500" /> Activities</h3>
                <div className="space-y-3">
                  {nearby?.activities.map((a) => (
                    <div key={a.name} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <div className="font-semibold text-slate-800">{a.name}</div>
                      <div className="text-xs text-slate-500">{a.category} · {a.duration} min · ₹{a.cost}</div>
                      <div className="text-xs text-brand-600">{a.rating}★</div>
                    </div>
                  ))}
                  {!nearby?.activities.length && <p className="text-sm text-slate-400">No matches.</p>}
                </div>
              </section>
              <section className="card p-5">
                <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900">Getting around</h3>
                {nearby?.local_transport.map((t) => (
                  <div key={t.name} className="mb-2 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-700">{t.name}</span>
                    <span className="text-sm text-slate-500">₹{t.cost_per_day}/day</span>
                  </div>
                ))}
                {nearby?.weather_note && (
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">☀️ {nearby.weather_note}</p>
                )}
              </section>
            </div>
          )}

          {tab === "food" && (
            <section className="max-w-3xl">
              <div className="card p-5">
                <div className="flex flex-wrap items-end gap-3">
                  <Field label="Style" htmlFor="fs">
                    <input id="fs" className="field" placeholder="e.g. seafood, cafe" value={foodStyle} onChange={(e) => setFoodStyle(e.target.value)} />
                  </Field>
                  <Field label="Budget (₹)" htmlFor="fb">
                    <input id="fb" className="field" type="number" placeholder="optional" value={foodBudget} onChange={(e) => setFoodBudget(e.target.value)} />
                  </Field>
                  <Button onClick={runFood} loading={busy}>Find food</Button>
                </div>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {food?.recommendations.map((r) => (
                  <div key={r.name} className="card overflow-hidden">
                    <div className="relative">
                      <SmartImage
                        src={r.image || ""}
                        alt={r.name}
                        width={600}
                        height={400}
                        gradient="from-rose-500 via-orange-400 to-amber-400"
                        className="h-40 w-full object-cover"
                      />
                      <span className="absolute right-3 top-3 badge-accent">
                        <Star className="h-3 w-3 fill-accent-500" /> {r.rating}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900">{r.name}</h4>
                      <p className="mt-0.5 text-xs text-slate-500 capitalize">{r.cuisine} · {r.type} · ~₹{r.avg_cost}</p>
                      {r.must_try && (
                        <div className="mt-3 rounded-xl bg-slate-50 p-2.5">
                          <div className="flex items-center gap-2">
                            <SmartImage
                              src={r.dish_image || ""}
                              alt={r.must_try}
                              width={56}
                              height={56}
                              gradient="from-amber-500 via-orange-400 to-rose-400"
                              className="h-14 w-14 shrink-0 rounded-lg object-cover"
                            />
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Must try</div>
                              <div className="text-sm font-semibold text-brand-700">{r.must_try}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {food?.recommendations.length === 0 && (
                  <p className="text-sm text-slate-400">No matches. Try a higher budget.</p>
                )}
              </div>
            </section>
          )}

          {tab === "plan" && (
            <section className="card max-w-2xl p-5">
              <Field label="Time of day" htmlFor="tod">
                <select id="tod" className="field" value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </Field>
              <Button className="mt-3" onClick={runPlan} loading={busy}>Plan my {timeOfDay}</Button>
              {plan && (
                <div className="mt-4 space-y-4">
                  <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">{plan.tip}</div>
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase text-slate-400">Activities</div>
                    {plan.activities.map((a) => <div key={a.name} className="py-1 text-sm text-slate-700">• {a.name} <span className="text-slate-400">({a.category})</span></div>)}
                  </div>
                  <div>
                    <div className="mb-1 text-xs font-bold uppercase text-slate-400">Restaurants</div>
                    {plan.restaurants.map((r) => <div key={r.name} className="py-1 text-sm text-slate-700">• {r.name} <span className="text-slate-400">({r.type})</span></div>)}
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "where" && (
            <section className="card max-w-2xl p-5">
              <Field label="What do you feel like?" htmlFor="prefs">
                <input id="prefs" className="field" value={prefs} onChange={(e) => setPrefs(e.target.value)} placeholder="e.g. beach, heritage, food, adventure" />
              </Field>
              <Button className="mt-3" onClick={runWhere} loading={busy}>Where should I go?</Button>
              {where && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-cyan-500 p-5 text-white">
                    <div className="text-xs uppercase tracking-wide text-brand-100">Recommended</div>
                    <div className="text-2xl font-extrabold capitalize">{where.recommendation.city}</div>
                    <div className="mt-0.5 text-sm text-brand-100">{where.recommendation.category} · {where.recommendation.why}</div>
                  </div>
                  <div className="text-sm text-slate-600">{where.tip}</div>
                  {where.alternatives.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {where.alternatives.map((a) => (
                        <Badge key={a.city} tone="accent">{a.city}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {tab === "pack" && (
            <section className="card max-w-2xl p-5">
              <Field label="Days" htmlFor="pd">
                <input id="pd" className="field" type="number" min={1} value={packDays} onChange={(e) => setPackDays(Number(e.target.value))} />
              </Field>
              <Button className="mt-3" onClick={runPack} loading={busy}>Generate packing list</Button>
              {pack && (
                <div className="mt-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {pack.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                        <span className="h-2 w-2 rounded-full bg-brand-500" /> {item}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">💡 {pack.tip}</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Guide */}
        {guide && (
          <div className="card mt-10 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <MapPin className="h-5 w-5 text-brand-500" /> Weekend guide · {guide.city}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{guide.weather_note}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {(["day1", "day2"] as const).map((day) => (
                <div key={day} className="rounded-xl border border-slate-100 p-4">
                  <div className="mb-2 text-xs font-bold uppercase text-slate-400 capitalize">{day.replace("day", "Day ")}</div>
                  <div className="space-y-1.5 text-sm text-slate-700">
                    <div>🌅 {guide.itinerary[day].morning}</div>
                    <div>🌤 {guide.itinerary[day].afternoon}</div>
                    <div>🌙 {guide.itinerary[day].evening}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ChatWidget defaultCity={city} />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading…</div>}>
      <DiscoverInner />
    </Suspense>
  );
}