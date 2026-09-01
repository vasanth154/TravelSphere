import {
  NearbyResponse,
  GuideResponse,
  TimePlanResponse,
  WhereResponse,
  PackingResponse,
} from "./api";

const IMG = (kw: string, lock: number) => `https://loremflickr.com/600/400/${kw}?lock=${lock}`;
const DISH = (kw: string, lock: number) => `https://loremflickr.com/400/300/${kw}?lock=${lock}`;

const CITIES = ["Goa", "Kochi", "Ooty", "Mumbai", "Delhi", "Paris", "Tokyo"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function demoNearby(city: string): NearbyResponse {
  const seed = city.length;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    city: cityName,
    is_demo: true,
    snapshot: `${cityName} is best visited Nov–Feb with pleasant weather and clear skies. Expect lively markets, fresh local food, and scenic spots within easy reach.`,
    weather_note: `${pick(["Rich and sunny", "Pleasant and breezy", "Warm with a sea breeze", "Crisp and clear"], seed)} — best visited Nov–Feb.`,
    restaurants: [
      {
        name: "The Spice Garden",
        cuisine: "Goan",
        type: "Multi-cuisine",
        avg_cost: 900,
        rating: 4.7,
        must_try: "Tandoori Pomfret",
        image: IMG("curry,restaurant,food", 11 + seed),
        dish_image: DISH("fish,grill,dish", 111 + seed),
      },
      {
        name: "Harbour Lights Café",
        cuisine: "Seafood",
        type: "Casual",
        avg_cost: 600,
        rating: 4.5,
        must_try: "Butter Garlic Prawns",
        image: IMG("seafood,restaurant,food", 12 + seed),
        dish_image: DISH("prawns,plate,seafood", 112 + seed),
      },
      {
        name: "The Curry Bowl",
        cuisine: "Coastal",
        type: "Family",
        avg_cost: 750,
        rating: 4.3,
        must_try: "Prawn Curry & Appam",
        image: IMG("curry,bowl,indian,food", 13 + seed),
        dish_image: DISH("appam,curry,coconut", 113 + seed),
      },
    ],
    activities: [
      { name: "Sunset Beach Cruise", category: "Water", duration: 120, cost: 800, rating: 4.7 },
      { name: "Falls Day Trip", category: "Adventure", duration: 360, cost: 1200, rating: 4.8 },
      { name: "Flea Market Walk", category: "Shopping", duration: 120, cost: 0, rating: 4.2 },
      { name: "Fort Heritage Tour", category: "Heritage", duration: 90, cost: 100, rating: 4.5 },
    ],
    local_transport: [
      { name: "Scooter Rental", cost_per_day: 350 },
      { name: "Taxi (per km)", cost_per_day: 500 },
      { name: "Local Bus", cost_per_day: 150 },
    ],
  };
}

export function demoFood(city: string): { city: string; recommendations: NearbyResponse["restaurants"]; is_demo: boolean } {
  return {
    city,
    is_demo: true,
    recommendations: [
      {
        name: "Tandoori Pomfret House",
        cuisine: "Coastal",
        type: "Signature",
        avg_cost: 1100,
        rating: 4.8,
        must_try: "Tandoori Pomfret",
        image: IMG("grilled,fish,restaurant", 21),
        dish_image: DISH("pomfret,tandoor,dish", 121),
      },
      {
        name: "The Breakfast Table",
        cuisine: "Café",
        type: "Casual",
        avg_cost: 500,
        rating: 4.4,
        must_try: "Mushroom Omelette + Filter Coffee",
        image: IMG("breakfast,cafe,food", 22),
        dish_image: DISH("omelette,coffee,breakfast", 122),
      },
      {
        name: "Spice Route Dining",
        cuisine: "Regional",
        type: "Fine",
        avg_cost: 1400,
        rating: 4.6,
        must_try: "Truffle Mushroom Risotto",
        image: IMG("fine,dining,plated,food", 23),
        dish_image: DISH("risotto,plated,dish", 123),
      },
    ],
  };
}

export function demoPlan(city: string, timeOfDay: string): TimePlanResponse {
  const meal = pick(["breakfast at a local café", "a hearty lunch", "an early dinner", "street-food tapas"], timeOfDay.length);
  return {
    city,
    time_of_day: timeOfDay,
    meal,
    is_demo: true,
    tip: `Best to move early — grab ${meal}, keep 90–120 min per big stop, and leave the evening for scenic views.`,
    activities: [
      { name: "Morning Riverfront Walk", category: "Sightseeing", duration: 60, cost: 0, rating: 4.6 },
      { name: "Old Quarter Food Trail", category: "Food", duration: 120, cost: 500, rating: 4.7 },
      { name: "Sunset Viewpoint", category: "Scenic", duration: 60, cost: 0, rating: 4.8 },
    ],
    restaurants: [
      { name: "The Spice Garden", type: "Multi-cuisine", rating: 4.7, avg_cost: 900 },
      { name: "Harbour Lights Café", type: "Casual", rating: 4.5, avg_cost: 600 },
    ],
  };
}

export function demoWhere(prefs: string): WhereResponse {
  const pref = prefs.toLowerCase();
  if (pref.includes("food")) {
    return {
      is_demo: true,
      recommendation: { city: "Kochi", category: "Culinary", tier: "Signature", why: "fresh seafood, spice markets and backwater dining" },
      alternatives: [
        { city: "Goa", category: "Beach & food", tier: "Relaxed", why: "global beach dining" },
        { city: "Delhi", category: "Street food", tier: "Bustling", why: "iconic chaat & kebabs" },
      ],
      tip: "Choose a city where the market, cafés and signature dishes are within walking distance.",
    };
  }
  if (pref.includes("beach") || pref.includes("sea")) {
    return {
      is_demo: true,
      recommendation: { city: "Goa", category: "Beach", tier: "Signature", why: "sunset cruises, water sports and beachfront stays" },
      alternatives: [
        { city: "Kochi", category: "Coastal", tier: "Heritage", why: "lakeside & backwater charm" },
        { city: "Ooty", category: "Hill", tier: "Scenic", why: "tea gardens and lakes" },
      ],
      tip: "Go in the shoulder months for fewer crowds and better prices.",
    };
  }
  if (pref.includes("heritage") || pref.includes("culture") || pref.includes("fort")) {
    return {
      is_demo: true,
      recommendation: { city: "Delhi", category: "Heritage", tier: "Must-see", why: "forts, monuments and museums within easy reach" },
      alternatives: [
        { city: "Fort Aguada", category: "Heritage", tier: "Iconic", why: "historic fort with ocean views" },
        { city: "Kochi", category: "Colonial", tier: "Charming", why: "Dutch warehouses and fort history" },
      ],
      tip: "Book guided walking tours to beat queues and skip-the-line.",
    };
  }
  return {
    is_demo: true,
    recommendation: { city: "Ooty", category: "Hill station", tier: "Scenic", why: "cool weather, mountains and quiet walks" },
    alternatives: [
      { city: "Goa", category: "Beach", tier: "Relaxed", why: "sun and sand" },
      { city: "Kochi", category: "Coastal", tier: "Heritage", why: "backwaters and culture" },
    ],
    tip: "Pack layers — hill towns can be cool in the evenings.",
  };
}

export function demoPack(city: string, days: number): PackingResponse {
  return {
    city,
    days,
    season: null,
    is_demo: true,
    items: [
      "Lightweight day backpack",
      "Comfortable walking shoes",
      "Reusable water bottle",
      "Power bank & travel adaptor",
      "Sunscreen & sunglasses",
      "Light rain jacket/poncho",
      "Compact first-aid kit",
      "Charged phone + offline maps",
      ...(days > 2 ? ["2–3 changes of clothes", "Quick-dry towel", "Laundry bag"] : []),
    ],
    tip: `Pack light — keep it to one carry-on for a ${days}-day trip, and layer for changing weather.`,
  };
}

export function demoGuide(city: string): GuideResponse {
  const seed = city.length;
  const cityName = city.charAt(0).toUpperCase() + city.slice(1);
  return {
    city: cityName,
    is_demo: true,
    snapshot: `${cityName} is best visited Nov–Feb with pleasant weather and clear skies.`,
    weather_note: `☀️ Best visited Nov–Feb — expect ${pick(["sunny days", "mild humidity", "cool breezes", "clear evenings"], seed)}.`,
    restaurants: demoNearby(city).restaurants,
    activities: demoNearby(city).activities,
    local_transport: demoNearby(city).local_transport,
    itinerary: {
      day1: {
        morning: "Start with the most iconic landmark before it gets busy.",
        afternoon: "Lunch at a highly rated local spot, then a museum or market.",
        evening: "Sunset viewpoint and a relaxed dinner.",
      },
      day2: {
        morning: "Outdoor activity — trail, water sport or heritage walk.",
        afternoon: "A quieter neighbourhood and a signature dish.",
        evening: "Night market or live-music café to close the trip.",
      },
    },
  };
}

export function resolveCity(city: string): string {
  const normalized =
    CITIES.find((c) => c.toLowerCase() === city.trim().toLowerCase()) ?? city.trim();
  return normalized || pick(CITIES, city.length);
}
