"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Star,
  MapPin,
  Check,
  ChevronLeft,
  Wifi,
  Waves,
  Utensils,
  Car as CarIcon,
  Dumbbell,
  Wine,
  Flower2,
  ShieldCheck,
} from "lucide-react";
import { getHotel } from "../../../lib/demo-data";
import { SmartImage } from "../../../components/SmartImage";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { formatINR } from "../../../lib/format";

const AMEN_ICON: Record<string, any> = {
  "Free WiFi": Wifi,
  Pool: Waves,
  Spa: Flower2,
  Restaurant: Utensils,
  Parking: CarIcon,
  Gym: Dumbbell,
  Bar: Wine,
};

export default function HotelDetails() {
  const params = useParams<{ id: string }>();
  const hotel = getHotel(params.id);
  const [activeImg, setActiveImg] = useState(0);
  const [booked, setBooked] = useState<string | null>(null);

  if (!hotel) {
    return (
      <div className="app-shell">
        <div className="section max-w-2xl text-center">
          <h1 className="h2">Hotel not found</h1>
          <Link href="/hotels" className="btn-primary btn-lg mt-6">
            Back to hotels
          </Link>
        </div>
      </div>
    );
  }

  const images = hotel.images.length ? hotel.images : [hotel.image];

  return (
    <div className="app-shell">
      <div className="section pt-6">
        <Link href="/hotels" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600">
          <ChevronLeft className="h-4 w-4" /> All hotels
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div>
            {/* Gallery */}
            <div className="overflow-hidden rounded-3xl">
              <SmartImage
                src={images[activeImg]}
                alt={hotel.name}
                gradient="from-brand-500 to-cyan-500"
                className="h-72 w-full object-cover sm:h-96"
              />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`overflow-hidden rounded-xl border-2 transition-all ${
                    i === activeImg ? "border-brand-500" : "border-transparent opacity-70 hover:opacity-100"
                  }`}>
                  <SmartImage src={img} alt="" gradient="from-brand-400 to-cyan-400"
                    className="h-16 w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-slate-900">{hotel.name}</h1>
                <Badge tone="accent">
                  <Star className="h-3 w-3 fill-accent-500" /> {hotel.rating}
                </Badge>
                <span className="text-sm text-slate-500">({hotel.reviews.toLocaleString("en-IN")} reviews)</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-slate-500">
                <MapPin className="h-4 w-4" /> {hotel.location}
              </p>
            </div>

            {/* Description */}
            <h2 className="mt-8 text-xl font-bold text-slate-900">About this hotel</h2>
            <p className="mt-2 leading-relaxed text-slate-600">{hotel.description}</p>

            {/* Amenities */}
            <h2 className="mt-8 text-xl font-bold text-slate-900">Amenities</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {hotel.amenities.map((a) => {
                const Icon = AMEN_ICON[a] ?? Check;
                return (
                  <div key={a} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                    <Icon className="h-4 w-4 text-brand-600" /> {a}
                  </div>
                );
              })}
            </div>

            {/* Policies */}
            <h2 className="mt-8 text-xl font-bold text-slate-900">Policies & info</h2>
            <ul className="mt-3 space-y-2">
              {hotel.policies.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Sticky booking card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400">from</span>
                  <div className="text-2xl font-extrabold text-slate-900">
                    {formatINR(hotel.pricePerNight)}
                    <span className="text-sm font-medium text-slate-400"> /night</span>
                  </div>
                </div>
                <Badge tone="accent">
                  <Star className="h-3 w-3 fill-accent-500" /> {hotel.rating}
                </Badge>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-500">Coordinates</div>
                  <div className="text-sm text-slate-700">{hotel.coords}</div>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Choose a room
                  </div>
                  <div className="space-y-2">
                    {hotel.rooms.map((r) => (
                      <div key={r.name}
                        className={`flex items-center justify-between rounded-xl border p-3 ${
                          booked === r.name ? "border-brand-500 bg-brand-50" : "border-slate-200"
                        }`}>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{r.name}</div>
                          <div className="text-xs text-slate-500">
                            Sleeps {r.sleeps} · {r.refundable ? "Free cancel" : "Non-refundable"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-slate-900">{formatINR(r.price)}</div>
                          <button
                            onClick={() => setBooked(r.name)}
                            className="mt-1 text-xs font-bold text-brand-600 hover:underline"
                          >
                            {booked === r.name ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {booked && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                    <Check className="mr-1 inline h-4 w-4" /> {booked} selected
                  </div>
                )}

                <Button fullWidth size="lg"
                  disabled={!booked}
                  onClick={() => alert("Demo booking — connect a payment provider to confirm real reservations.")}>
                  {booked ? `Book ${booked}` : "Select a room"}
                </Button>
                <p className="text-center text-xs text-slate-400">
                  Demo experience · payments not connected
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
