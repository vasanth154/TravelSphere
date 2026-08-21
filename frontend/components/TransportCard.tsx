"use client";

import { TransportIcon, transportLabel } from "./TransportIcon";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { formatINR, formatDuration } from "../lib/format";
import type { TransportOption, ComparisonResult } from "../lib/api";

export function TransportCard({
  option,
  comparison,
  selected,
  onSelect,
}: {
  option: TransportOption;
  comparison: ComparisonResult | null;
  selected: boolean;
  onSelect: () => void;
}) {
  const badges: { label: string; tone: "green" | "brand" | "accent" | "rose" }[] = [];
  if (comparison?.cheapest?.id === option.id) badges.push({ label: "Cheapest", tone: "green" });
  if (comparison?.fastest?.id === option.id) badges.push({ label: "Fastest", tone: "brand" });
  if (comparison?.best_value?.id === option.id) badges.push({ label: "Best value", tone: "accent" });
  if (comparison?.best_comfort?.id === option.id) badges.push({ label: "Best comfort", tone: "rose" });
  if (comparison?.best_convenience?.id === option.id) badges.push({ label: "Best convenience", tone: "rose" });

  return (
    <article
      className={`card-hover flex flex-col gap-4 p-5 sm:flex-row sm:items-center ${
        selected ? "ring-2 ring-brand-500" : ""
      }`}
    >
      <div className="flex items-center gap-3 sm:w-44">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <TransportIcon mode={option.mode} className="h-6 w-6" />
        </span>
        <div>
          <div className="font-bold text-slate-900">{transportLabel(option.mode)}</div>
          <div className="text-xs text-slate-500">{option.service_name}</div>
        </div>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{option.departure}</div>
          <div className="text-xs text-slate-400">depart</div>
        </div>
        <div className="flex flex-1 flex-col items-center text-slate-400">
          <div className="text-xs">{formatDuration(option.duration)}</div>
          <div className="my-1 h-px w-full bg-slate-200" />
          <div className="text-xs">{option.stops === 0 ? "Direct" : `${option.stops} stop(s)`}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-slate-900">{option.arrival}</div>
          <div className="text-xs text-slate-400">arrive</div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        <div className="text-right">
          <div className="text-xl font-extrabold text-slate-900">{formatINR(option.price)}</div>
          <div className="text-xs text-slate-400">
            comfort {option.comfort} · conv {option.convenience}
          </div>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone}>
                {b.label}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          variant={selected ? "secondary" : "primary"}
          size="sm"
          onClick={onSelect}
          aria-pressed={selected}
        >
          {selected ? "Selected" : "Select"}
        </Button>
      </div>
    </article>
  );
}
