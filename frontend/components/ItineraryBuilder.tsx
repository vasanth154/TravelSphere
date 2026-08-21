"use client";

import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  ItineraryActivity,
  ItineraryDay,
  ItineraryResponse,
  OptimizeResponse,
  generateItinerary,
  optimizeItinerary,
} from "../lib/api";
import { formatDate } from "../lib/format";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Field } from "./ui/Field";
import { Spinner } from "./ui/Spinner";
import { WeatherCard } from "./WeatherCard";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return Number.isNaN(d.getTime()) ? dateStr : WEEKDAYS[d.getDay()];
}

const TRIP_TYPES = [
  { value: "leisure", label: "Leisure" },
  { value: "adventure", label: "Adventure" },
  { value: "culture", label: "Culture" },
  { value: "family", label: "Family" },
  { value: "romantic", label: "Romantic" },
];

export function ItineraryBuilder({
  destination,
  origin,
  startDate,
  endDate,
  travelers,
  budget,
  profile,
}: {
  destination: string;
  origin?: string;
  startDate: string;
  endDate?: string | null;
  travelers: number;
  budget?: number | null;
  profile?: string;
}) {
  const [tripType, setTripType] = useState("leisure");
  const [preferences, setPreferences] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<OptimizeResponse | null>(null);

  const effectiveEnd = endDate || startDate;

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setOptimizeResult(null);
    try {
      const result = await generateItinerary({
        destination,
        origin,
        start_date: startDate,
        end_date: effectiveEnd,
        travelers,
        budget: budget != null ? budget.toString() : undefined,
        trip_type: tripType,
        preferences: preferences.trim() ? preferences.trim() : undefined,
      });
      setItinerary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong generating your itinerary.");
    } finally {
      setLoading(false);
    }
  }

  async function onOptimize() {
    if (!itinerary) return;
    setOptimizing(true);
    setError(null);
    try {
      const days = itinerary.itinerary.map((d) => ({
        date: d.date,
        activities: d.activities.map((a) => ({ title: a.title, type: a.type, time: a.time })),
      }));
      const result = await optimizeItinerary({
        destination,
        start_date: itinerary.start_date,
        end_date: itinerary.end_date,
        itinerary: days,
        trip_type: itinerary.trip_type,
        preferences: preferences.trim() ? preferences.trim() : undefined,
      });
      setOptimizeResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong optimizing your itinerary.");
    } finally {
      setOptimizing(false);
    }
  }

  function applyChanges() {
    if (!itinerary || !optimizeResult) return;
    const byDate = new Map<string, ItineraryDay>(itinerary.itinerary.map((d) => [d.date, d]));
    for (const change of optimizeResult.changes) {
      const day = byDate.get(change.date);
      if (day) day.activities = change.after;
    }
    for (const move of optimizeResult.moved) {
      if (!move.to_date) continue;
      const target = byDate.get(move.to_date);
      if (target && !target.activities.some((a) => a.title === move.title)) {
        target.activities.push({ title: move.title, type: "outdoor" });
      }
    }
    setItinerary({ ...itinerary, itinerary: [...byDate.values()] });
    setOptimizeResult(null);
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-accent-500" />
            Plan your days in {destination}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            A weather-aware itinerary that balances outdoor highlights with comfortable indoor plans.
          </p>
        </div>
        {!itinerary && (
          <Button onClick={onGenerate} loading={loading} variant="accent">
            {loading ? "Building your plan…" : "Generate itinerary"}
          </Button>
        )}
      </div>

      {!itinerary && !loading && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Trip type" htmlFor="trip-type">
            <select
              id="trip-type"
              className="field"
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
            >
              {TRIP_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Preferences"
            htmlFor="preferences"
            hint="e.g. beach, food, photography, relaxed pace"
          >
            <input
              id="preferences"
              className="field"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="What do you love?"
            />
          </Field>
        </div>
      )}

      {loading && <Spinner label="Building your weather-aware itinerary…" />}

      {error && (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {itinerary && (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-brand-500" />
              {formatDate(itinerary.start_date)} – {formatDate(itinerary.end_date)}
            </span>
            <Badge tone={itinerary.is_ai_generated ? "brand" : "slate"}>
              {itinerary.is_ai_generated ? "AI generated" : "Rule-based plan"}
            </Badge>
            {!itinerary.weather_available && itinerary.weather_note && (
              <Badge tone="accent">{itinerary.weather_note}</Badge>
            )}
          </div>

          {itinerary.summary && (
            <p className="mt-3 text-sm text-slate-600">{itinerary.summary}</p>
          )}

          {itinerary.forecast && (
            <div className="mt-5">
              <WeatherCard
                forecast={itinerary.forecast}
                alerts={itinerary.alerts}
                destination={destination}
              />
            </div>
          )}

          <div className="mt-6 space-y-4">
            {itinerary.itinerary.map((day, i) => (
              <DayCard key={day.date} day={day} index={i} destination={destination} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onOptimize} variant="secondary" loading={optimizing}>
              <RefreshCw className="h-4 w-4" />
              {optimizing ? "Checking the forecast…" : "Optimize for weather"}
            </Button>
            <Button onClick={onGenerate} variant="ghost">
              Regenerate
            </Button>
          </div>

          {optimizeResult && (
            <OptimizePanel
              result={optimizeResult}
              onApply={applyChanges}
              onKeep={() => setOptimizeResult(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

function DayCard({
  day,
  index,
  destination,
}: {
  day: ItineraryDay;
  index: number;
  destination: string;
}) {
  const w = day.weather;
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 font-bold text-brand-700">
            {index + 1}
          </span>
          <div>
            <div className="font-bold text-slate-900">
              {weekday(day.date)} · {formatDate(day.date)}
            </div>
            {day.day_label && (
              <div className="text-xs text-slate-500">{day.day_label}</div>
            )}
          </div>
        </div>
        {w && (
          <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            <span aria-hidden>{w.icon}</span>
            {Math.round(w.temperature)}°C
            {w.category_icon && <span aria-hidden>{w.category_icon}</span>}
          </span>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {day.activities.map((a, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span aria-hidden className="mt-0.5 w-6 text-center">
              {a.icon ?? "•"}
            </span>
            <div className="flex-1">
              <span className="font-medium text-slate-800">{a.title}</span>
              {a.time && (
                <span className="ml-2 text-xs text-slate-400">{a.time}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {day.rationale && (
        <p className="mt-3 text-xs text-slate-500">{day.rationale}</p>
      )}
      {w?.category === "poor_outdoor" || w?.category === "extreme" ? (
        <p className="mt-2 text-xs font-semibold text-rose-600">
          {w.category_label} — indoor plans recommended for {destination}.
        </p>
      ) : null}
    </article>
  );
}

function OptimizePanel({
  result,
  onApply,
  onKeep,
}: {
  result: OptimizeResponse;
  onApply: () => void;
  onKeep: () => void;
}) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-accent-300 bg-accent-50/50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 font-bold text-slate-900">
            <RefreshCw className="h-5 w-5 text-accent-600" />
            Weather-aware improvements
          </h4>
          <p className="mt-1 text-sm text-slate-600">{result.summary}</p>
        </div>
      </div>

      {result.changes.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white/70 px-4 py-3 text-sm text-emerald-700">
          Your itinerary already works with the forecast. No changes needed.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {result.changes.map((change) => (
            <div key={change.date} className="rounded-xl bg-white p-4 shadow-soft">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900">
                  {weekday(change.date)} · {formatDate(change.date)}
                </span>
                <Badge tone="accent">
                  {change.category_icon} {change.category_label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500">{change.rationale}</p>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Before
                  </div>
                  <ul className="space-y-1.5">
                    {change.before.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-400 line-through">
                        <span aria-hidden>{a.icon ?? "•"}</span> {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                    After
                  </div>
                  <ul className="space-y-1.5">
                    {change.after.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                        <span aria-hidden>{a.icon ?? "•"}</span> {a.title}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {change.moved.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {change.moved.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700"
                    >
                      {m.title} <ArrowRight className="h-3 w-3" />{" "}
                      {m.to_date ? formatDate(m.to_date) : "another day"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {result.changes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={onApply} variant="primary">
            <CheckCircle2 className="h-4 w-4" /> Apply changes
          </Button>
          <Button onClick={onKeep} variant="ghost">
            <XCircle className="h-4 w-4" /> Keep original
          </Button>
        </div>
      )}
    </div>
  );
}