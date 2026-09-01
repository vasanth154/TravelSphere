"use client";

import { Wifi, Waves, Utensils, Car, Dumbbell, Wine, Flower2, BedDouble, Sparkles } from "lucide-react";
import { SmartImage } from "./SmartImage";

/**
 * Real facility photos for common hotel amenities. Each amenity maps to an
 * appetizing, high-quality facility image (pool, spa, restaurant, gym, etc.)
 * with a graceful branded gradient fallback if the photo can't load.
 */

const FACILITY_IMAGES: Record<string, string> = {
  "Free WiFi": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=70",
  WiFi: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=70",
  Pool: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=70",
  "Infinity Pool": "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=70",
  Spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=70",
  Restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=70",
  Bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=70",
  Gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=70",
  Parking: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=70",
  "Beachfront": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=70",
  "Sea View": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=70",
  "Airport Shuttle": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=70",
  "Airport Transport": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=70",
  Laundry: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=70",
  Concierge: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=600&q=70",
  "Valet parking": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=600&q=70",
  "Free cancellation": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=600&q=70",
};

const GRADIENTS = [
  "from-cyan-500 via-sky-400 to-blue-500",
  "from-emerald-500 via-teal-400 to-cyan-400",
  "from-amber-500 via-orange-400 to-rose-400",
  "from-fuchsia-500 via-purple-400 to-indigo-500",
];

const AMEN_ICON: Record<string, any> = {
  "Free WiFi": Wifi,
  WiFi: Wifi,
  Pool: Waves,
  "Infinity Pool": Waves,
  "Sea View": Waves,
  Beachfront: Waves,
  Spa: Flower2,
  Restaurant: Utensils,
  Bar: Wine,
  "Breakfast": Utensils,
  Gym: Dumbbell,
  "Kids pool": Waves,
  Parking: Car,
  "Free parking": Car,
  "Valet parking": Car,
  "Airport Shuttle": Car,
  "Airport Transport": Car,
  Laundry: Sparkles,
  Concierge: Sparkles,
  "Room service": BedDouble,
  "Air conditioning": Sparkles,
  "Housekeeping": Sparkles,
};

/** Map an amenity name to a real facility photo, or a curated fallback. */
export function facilityImage(amenity: string): string {
  const key = amenity in FACILITY_IMAGES ? amenity : amenity.trim();
  return (
    FACILITY_IMAGES[key] ||
    FACILITY_IMAGES[Object.keys(FACILITY_IMAGES).find((k) => k.toLowerCase().includes(amenity.toLowerCase())) ?? ""] ||
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=70"
  );
}

/** Facility photo tile with a matching lucide icon badge. */
export function FacilityTile({ amenity, index }: { amenity: string; index: number }) {
  const Icon = AMEN_ICON[amenity] ?? Sparkles;
  return (
    <div className="group relative overflow-hidden rounded-2xl">
      <SmartImage
        src={facilityImage(amenity)}
        alt={`${amenity} at this hotel`}
        width={600}
        height={400}
        gradient={GRADIENTS[index % GRADIENTS.length]}
        className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 text-white">
        <Icon className="h-4 w-4" />
        <span className="text-sm font-semibold drop-shadow">{amenity}</span>
      </div>
    </div>
  );
}