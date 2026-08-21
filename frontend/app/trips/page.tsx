"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plane,
  BedDouble,
  CalendarDays,
  MapPin,
  Users,
  ArrowRight,
  Clock,
  CheckCircle2,
  CircleDot,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";
import { DEMO_TRIPS, Trip, TripItem } from "../../lib/demo-data";
import { WeatherAlert, WeatherResponse, getWeather } from "../../lib/api";
import { SmartImage } from "../../components/SmartImage";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Spinner";
import { WeatherCard } from "../../components/WeatherCard";
import { ItineraryBuilder } from "../../components/ItineraryBuilder";
import { formatDate } from "../../lib/format";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return Number.isNaN(d.getTime()) ? dateStr : WEEKDAYS[d.getDay()];
}

function TripWeather({ trip }: { trip: Trip }) {
  const [forecast, setForecast] = useState<WeatherResponse | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [showPlan, setShowPlan] = useState(false);
  const dest = trip.destination.split(",")[0].trim();

  useEffect(() => {
    let cancelled = false;
    getWeather({ destination: dest, start_date: trip.startDate, end_date: trip.endDate })
      .then((res) => {
        if (cancelled) return;
        setForecast(res);
        setAlerts(res.alerts);
        setStatus("ok");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [dest, trip.startDate, trip.endDate]);

  return (
    <div>
      {status === "loading" && <Skeleton className="h-28 w-full" />}
      {status === "error" && <WeatherCard forecast={[]} alerts={[]} />}
      {status === "ok" && forecast && (
        <WeatherCard forecast={forecast.forecast} alerts={alerts} destination={dest} compact />
      )}
      <Button
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => setShowPlan((v) => !v)}
      >
        {showPlan ? "Hide daily plan" : "Plan my days"} <ArrowRightIcon className="h-4 w-4" />
      </Button>
      {showPlan && (
        <div className="mt-3">
          <ItineraryBuilder
            destination={dest}
            startDate={trip.startDate}
            endDate={trip.endDate}
            travelers={trip.travelers}
          />
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [saved, setSaved] = useState<any>(null);

  useEffect(() => {
    setTrips(DEMO_TRIPS);
    const raw = localStorage.getItem("ts_transport");
    if (raw) setSaved(JSON.parse(raw));
  }, []);

  const upcoming = trips.filter((t) => t.status === "upcoming");
  const past = trips.filter((t) => t.status === "completed");

  return (
    <div className="app-shell">
      <div className="section pt-8">
        <span className="eyebrow">Your travel</span>
        <h1 className="h2">My trips</h1>
        <p className="lede">Everything you&apos;ve planned, in one calm view.</p>

        {saved && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Plane className="h-5 w-5" />
            </span>
            <div className="text-sm">
              <div className="font-bold text-slate-900">Saved transport</div>
              <div className="text-slate-500">
                {saved.service_name} · {saved.route}
              </div>
            </div>
            <Link href="/hotels" className="btn-primary btn-sm ml-auto">
              Add a hotel <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        <h2 className="mt-10 text-xl font-bold text-slate-900">Upcoming</h2>
        <div className="mt-4 space-y-4">
          {upcoming.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
          {upcoming.length === 0 && <Empty />}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-bold text-slate-900">Past trips</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {past.map((t) => (
                <TripCard key={t.id} trip={t} compact />
              ))}
            </div>
          </>
        )}

        <div className="mt-10 rounded-3xl bg-gradient-to-br from-brand-600 to-cyan-500 p-8 text-center text-white shadow-pop">
          <h3 className="text-2xl font-extrabold">Start a new adventure</h3>
          <p className="mx-auto mt-2 max-w-md text-brand-50/90">
            Plan transport and stays together for a smoother trip.
          </p>
          <Link href="/search" className="btn-accent btn-lg mt-5">
            Plan a Trip <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TripCard({ trip, compact }: { trip: Trip; compact?: boolean }) {
  return (
    <article className="card overflow-hidden">
      <div className={`flex flex-col ${compact ? "" : "sm:flex-row"}`}>
        {!compact && (
          <SmartImage
            src={trip.image}
            alt={trip.destination}
            gradient="from-brand-500 to-cyan-500"
            className="h-40 w-full object-cover sm:h-auto sm:w-56"
          />
        )}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{trip.title}</h3>
                <Badge tone={trip.status === "upcoming" ? "brand" : "slate"}>
                  {trip.status === "upcoming" ? "Upcoming" : "Completed"}
                </Badge>
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5" /> {trip.destination}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-brand-500" />
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-brand-500" /> {trip.travelers} travellers
            </span>
          </div>

          <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
            {trip.items.map((item, i) => (
              <TripItemRow key={i} item={item} />
            ))}
          </div>
          {!compact && <TripWeather trip={trip} />}
        </div>
      </div>
    </article>
  );
}

function TripItemRow({ item }: { item: TripItem }) {
  const Icon = item.kind === "transport" ? Plane : BedDouble;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="font-semibold text-slate-800">{item.label}</div>
        <div className="text-xs text-slate-500">{item.detail}</div>
      </div>
      {item.status === "confirmed" ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Confirmed
        </span>
      ) : (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
          <Clock className="h-4 w-4" /> Pending
        </span>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="card flex flex-col items-center gap-3 p-10 text-center text-slate-500">
      <CircleDot className="h-8 w-8 text-slate-300" />
      <p>No upcoming trips yet.</p>
      <Link href="/search" className="btn-primary btn-sm">
        Plan a Trip
      </Link>
    </div>
  );
}
