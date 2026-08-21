"use client";

import {
  AlertTriangle,
  CloudRain,
  Info,
  ShieldAlert,
  Thermometer,
  Wind,
} from "lucide-react";
import { WeatherAlert, WeatherDay } from "../lib/api";
import { formatDate } from "../lib/format";
import { Badge } from "./ui/Badge";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekday(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return Number.isNaN(d.getTime()) ? "" : WEEKDAYS[d.getDay()];
}

const ALERT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  severe: ShieldAlert,
  rain: CloudRain,
  heat: Thermometer,
  wind: Wind,
};

const ALERT_STYLES: Record<string, string> = {
  danger: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export function WeatherCard({
  forecast,
  alerts,
  destination,
  compact = false,
}: {
  forecast: WeatherDay[];
  alerts: WeatherAlert[];
  destination?: string;
  compact?: boolean;
}) {
  const usable = forecast.filter((d) => d.available);
  if (usable.length === 0) {
    return (
      <div className="card flex items-center gap-3 p-4 text-sm text-slate-500">
        <Info className="h-5 w-5 shrink-0 text-brand-500" />
        Weather information is temporarily unavailable.
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-bold text-slate-900">
          <CloudRain className="h-5 w-5 text-brand-500" />
          {destination ? `Weather for ${destination}` : "Weather"}
        </h3>
        <span className="text-xs text-slate-400">{usable.length} days</span>
      </div>

      <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {usable.map((day) => (
          <div key={day.date} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {weekday(day.date)}
              </span>
              <span className="text-[10px] text-slate-400">{formatDate(day.date)}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-3xl" aria-hidden>
                {day.icon}
              </span>
              <div>
                <div className="text-xl font-extrabold text-slate-900">
                  {Math.round(day.temperature)}°C
                </div>
                <div className="text-xs text-slate-500 capitalize">{day.description}</div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span>💧 {day.precipitation_probability}%</span>
              <span>💨 {Math.round(day.wind_speed)} km/h</span>
            </div>
            <div className="mt-2">
              <Badge tone={day.category === "good_outdoor" ? "green" : day.category === "extreme" ? "rose" : day.category === "poor_outdoor" ? "accent" : "brand"}>
                {day.category_icon} {day.category_label}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {alerts.map((alert, i) => {
            const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
            return (
              <div
                key={i}
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-sm ${ALERT_STYLES[alert.severity] ?? ALERT_STYLES.info}`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <div>
                  <div className="font-semibold">{alert.title}</div>
                  <div className="opacity-80">{alert.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}