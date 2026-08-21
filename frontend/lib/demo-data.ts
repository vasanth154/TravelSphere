// Demo data for UI only. Backend transport search is real; hotels/trips are
// illustrative (live availability & payments are not connected).

export type Destination = {
  id: string;
  name: string;
  state: string;
  tagline: string;
  image: string;
  gradient: string;
  priceFrom: number;
};

export const DESTINATIONS: Destination[] = [
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    tagline: "Coastal heritage & temple trails",
    image: "https://loremflickr.com/900/600/chennai?lock=chennai",
    gradient: "from-rose-500 via-orange-400 to-amber-400",
    priceFrom: 1200,
  },
  {
    id: "madurai",
    name: "Madurai",
    state: "Tamil Nadu",
    tagline: "The city of temples",
    image: "https://loremflickr.com/900/600/madurai,temple?lock=madurai",
    gradient: "from-amber-500 via-orange-400 to-rose-400",
    priceFrom: 900,
  },
  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    tagline: "Beaches, sunsets & nightlife",
    image: "https://loremflickr.com/900/600/goa,beach?lock=goa",
    gradient: "from-cyan-500 via-sky-400 to-teal-400",
    priceFrom: 1800,
  },
  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "Forts, palaces & pink city charm",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=900&q=70",
    gradient: "from-pink-500 via-rose-400 to-accent-400",
    priceFrom: 1500,
  },
  {
    id: "kerala",
    name: "Kerala",
    state: "Kerala",
    tagline: "Backwaters & green escapes",
    image: "https://images.unsplash.com/photo-1634141693341-9d51836aa188?auto=format&fit=crop&w=900&q=70",
    gradient: "from-emerald-500 via-teal-400 to-cyan-400",
    priceFrom: 2100,
  },
  {
    id: "agra",
    name: "Agra",
    state: "Uttar Pradesh",
    tagline: "The Taj Mahal & Mughal splendour",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=70",
    gradient: "from-indigo-500 via-sky-400 to-brand-400",
    priceFrom: 1400,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    tagline: "Bollywood, bays & bustle",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=900&q=70",
    gradient: "from-slate-600 via-sky-500 to-brand-500",
    priceFrom: 1900,
  },
  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    tagline: "Ghats, aarti & the Ganges",
    image: "https://images.unsplash.com/photo-1762513839526-c596f5e99a9a?auto=format&fit=crop&w=900&q=70",
    gradient: "from-orange-600 via-amber-500 to-rose-400",
    priceFrom: 1100,
  },
];

export type InternationalDestination = {
  id: string;
  name: string;
  country: string;
  tagline: string;
  image: string;
  gradient: string;
};

export const INTERNATIONAL_DESTINATIONS: InternationalDestination[] = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    tagline: "Art, fashion & the Eiffel Tower",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=70",
    gradient: "from-rose-500 via-pink-400 to-purple-400",
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "UAE",
    tagline: "Futuristic skyline & desert luxury",
    image: "https://images.unsplash.com/photo-1769161852093-b1f785eccd76?auto=format&fit=crop&w=900&q=70",
    gradient: "from-amber-500 via-orange-400 to-rose-400",
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    tagline: "Temples, rice terraces & beaches",
    image: "https://images.unsplash.com/photo-1768837919316-a33de7a6ad39?auto=format&fit=crop&w=900&q=70",
    gradient: "from-emerald-500 via-teal-400 to-cyan-400",
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    tagline: "Marina Bay & a garden city",
    image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=900&q=70",
    gradient: "from-cyan-500 via-sky-400 to-blue-500",
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    tagline: "Big Ben, museums & royal parks",
    image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=900&q=70",
    gradient: "from-slate-600 via-indigo-500 to-brand-500",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    tagline: "Neon streets & ancient shrines",
    image: "https://images.unsplash.com/photo-1764418658531-25596053801e?auto=format&fit=crop&w=900&q=70",
    gradient: "from-fuchsia-500 via-rose-400 to-orange-400",
  },
  {
    id: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    tagline: "Alps, lakes & scenic mountain rails",
    image: "https://images.unsplash.com/photo-1687178151530-883e1495b4aa?auto=format&fit=crop&w=900&q=70",
    gradient: "from-sky-500 via-cyan-400 to-emerald-400",
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    tagline: "Turquoise lagoons & overwater villas",
    image: "https://images.unsplash.com/photo-1769389352398-f7b694034eb5?auto=format&fit=crop&w=900&q=70",
    gradient: "from-cyan-400 via-sky-400 to-blue-500",
  },
  {
    id: "newyork",
    name: "New York",
    country: "United States",
    tagline: "Skyline, liberty & endless energy",
    image: "https://images.unsplash.com/photo-1761301643442-6ce65946665f?auto=format&fit=crop&w=900&q=70",
    gradient: "from-slate-700 via-blue-500 to-indigo-500",
  },
  {
    id: "bangkok",
    name: "Bangkok",
    country: "Thailand",
    tagline: "Temples & the Chao Phraya river",
    image: "https://images.unsplash.com/photo-1755251042986-91270ffd76f5?auto=format&fit=crop&w=900&q=70",
    gradient: "from-amber-500 via-orange-400 to-rose-400",
  },
];

export type Room = {
  name: string;
  sleeps: number;
  price: number;
  refundable: boolean;
};

export type Hotel = {
  id: string;
  name: string;
  city: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  pricePerNight: number;
  amenities: string[];
  description: string;
  rooms: Room[];
  policies: string[];
  coords: string;
};

export const HOTELS: Hotel[] = [
  {
    id: "h1",
    name: "Taj Coromandel",
    city: "Chennai",
    location: "Nungambakkam, 2.1 km from city centre",
    rating: 4.7,
    reviews: 2841,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80",
    ],
    pricePerNight: 9200,
    amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Parking", "Gym", "Bar", "Airport shuttle"],
    description:
      "An iconic luxury stay in the heart of Chennai blending heritage architecture with modern comfort. Steps from shopping, business hubs and cultural landmarks.",
    rooms: [
      { name: "Deluxe King", sleeps: 2, price: 9200, refundable: true },
      { name: "Executive Suite", sleeps: 3, price: 13800, refundable: true },
      { name: "Club Twin", sleeps: 2, price: 8800, refundable: false },
    ],
    policies: [
      "Check-in from 2:00 PM · Check-out until 12:00 PM",
      "Free cancellation up to 48 hours before arrival",
      "No extra beds for children under 6",
    ],
    coords: "13.0569° N, 80.2425° E",
  },
  {
    id: "h2",
    name: "The Gateway Hotel",
    city: "Madurai",
    location: "Near Meenakshi Temple, 1.4 km from centre",
    rating: 4.4,
    reviews: 1736,
    image: "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f97?auto=format&fit=crop&w=1200&q=80",
    ],
    pricePerNight: 5400,
    amenities: ["Free WiFi", "Restaurant", "Pool", "Parking", "Bar"],
    description:
      "Comfortable business and leisure hotel within walking distance of the Meenakshi Amman Temple, with garden views and warm Tamil hospitality.",
    rooms: [
      { name: "Superior Queen", sleeps: 2, price: 5400, refundable: true },
      { name: "Heritage Suite", sleeps: 4, price: 7900, refundable: false },
    ],
    policies: [
      "Check-in from 1:00 PM · Check-out until 11:00 AM",
      "Free cancellation up to 24 hours before arrival",
    ],
    coords: "9.9195° N, 78.1191° E",
  },
  {
    id: "h3",
    name: "Goa Marriott Resort",
    city: "Goa",
    location: "Miramar Beach, Panaji",
    rating: 4.6,
    reviews: 3210,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
    ],
    pricePerNight: 11500,
    amenities: ["Beachfront", "Free WiFi", "Pool", "Spa", "Restaurant", "Bar", "Gym"],
    description:
      "Beachfront resort on Miramar Beach with lagoon-style pools, multiple dining options and easy access to Panaji's Latin Quarter.",
    rooms: [
      { name: "Ocean View King", sleeps: 2, price: 11500, refundable: true },
      { name: "Lagoon Suite", sleeps: 4, price: 16900, refundable: true },
    ],
    policies: [
      "Check-in from 3:00 PM · Check-out until 12:00 PM",
      "Free cancellation up to 72 hours before arrival",
    ],
    coords: "15.4909° N, 73.8271° E",
  },
  {
    id: "h4",
    name: "Umaid Bhawan Palace",
    city: "Jaipur",
    location: "Civil Lines, 3.0 km from centre",
    rating: 4.8,
    reviews: 1290,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
    ],
    pricePerNight: 12800,
    amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "Valet parking", "Garden"],
    description:
      "A regal palace hotel offering royal suites, courtyards and fine dining — the quintessential Rajasthani luxury experience.",
    rooms: [
      { name: "Palace Room", sleeps: 2, price: 12800, refundable: true },
      { name: "Royal Suite", sleeps: 4, price: 21500, refundable: false },
    ],
    policies: [
      "Check-in from 2:00 PM · Check-out until 12:00 PM",
      "Free cancellation up to 48 hours before arrival",
    ],
    coords: "26.2389° N, 73.0243° E",
  },
];

export function getHotel(id: string): Hotel | undefined {
  return HOTELS.find((h) => h.id === id);
}

export type TripItem = {
  kind: "transport" | "hotel";
  label: string;
  detail: string;
  status: "confirmed" | "pending";
};

export type Trip = {
  id: string;
  title: string;
  destination: string;
  image: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "completed";
  travelers: number;
  items: TripItem[];
};

export const DEMO_TRIPS: Trip[] = [
  {
    id: "t1",
    title: "Chennai → Madurai Temple Trail",
    destination: "Madurai, Tamil Nadu",
    image: "/images/destinations/madurai.svg",
    startDate: "2026-09-12",
    endDate: "2026-09-15",
    status: "upcoming",
    travelers: 2,
    items: [
      { kind: "transport", label: "Vaigai Superfast (Train)", detail: "Chennai → Madurai · 07:00–11:30", status: "confirmed" },
      { kind: "hotel", label: "The Gateway Hotel", detail: "2 nights · Superior Queen", status: "confirmed" },
    ],
  },
  {
    id: "t2",
    title: "Goa Beach Escape",
    destination: "Goa",
    image: "/images/destinations/goa.svg",
    startDate: "2026-10-03",
    endDate: "2026-10-07",
    status: "upcoming",
    travelers: 4,
    items: [
      { kind: "transport", label: "Chennai–Goa Flight", detail: "Direct · 2h 10m", status: "pending" },
      { kind: "hotel", label: "Goa Marriott Resort", detail: "4 nights · Ocean View King", status: "confirmed" },
    ],
  },
  {
    id: "t3",
    title: "Jaipur Heritage Weekend",
    destination: "Jaipur, Rajasthan",
    image: "/images/destinations/jaipur.svg",
    startDate: "2026-05-20",
    endDate: "2026-05-23",
    status: "completed",
    travelers: 2,
    items: [
      { kind: "transport", label: "Rajdhani Express", detail: "Delhi → Jaipur", status: "confirmed" },
      { kind: "hotel", label: "Umaid Bhawan Palace", detail: "3 nights · Palace Room", status: "confirmed" },
    ],
  },
];
