import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Hotel } from "../lib/demo-data";
import { SmartImage } from "./SmartImage";
import { formatINR } from "../lib/format";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="card-hover group flex flex-col overflow-hidden"
    >
      <div className="relative">
        <SmartImage
          src={hotel.image}
          alt={hotel.name}
          gradient="from-brand-500 to-cyan-500"
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 badge-accent">
          <Star className="h-3 w-3 fill-accent-500" /> {hotel.rating}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900">{hotel.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5" /> {hotel.location}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="badge-slate">
              {a}
            </span>
          ))}
          {hotel.amenities.length > 3 && (
            <span className="badge-slate">+{hotel.amenities.length - 3}</span>
          )}
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="text-xs text-slate-400">from</div>
            <div className="text-lg font-extrabold text-slate-900">
              {formatINR(hotel.pricePerNight)}
              <span className="text-xs font-medium text-slate-400"> /night</span>
            </div>
          </div>
          <span className="btn-primary btn-sm">View details</span>
        </div>
      </div>
    </Link>
  );
}
