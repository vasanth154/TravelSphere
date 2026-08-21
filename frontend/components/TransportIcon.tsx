import {
  Bus,
  TrainFront,
  Plane,
  Car,
  Bike,
  TramFront,
  Ship,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  bus: Bus,
  train: TrainFront,
  flight: Plane,
  car: Car,
  cab: Car,
  bike: Bike,
  metro: TramFront,
  ferry: Ship,
};

const LABELS: Record<string, string> = {
  bus: "Bus",
  train: "Train",
  flight: "Flight",
  car: "Car",
  cab: "Cab",
  bike: "Bike",
  metro: "Metro",
  ferry: "Ferry",
};

export function TransportIcon({
  mode,
  className = "h-5 w-5",
}: {
  mode: string;
  className?: string;
}) {
  const Icon = ICONS[mode] ?? TrainFront;
  return <Icon className={className} aria-hidden />;
}

export function transportLabel(mode: string): string {
  return LABELS[mode] ?? mode;
}
