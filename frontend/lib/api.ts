export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Shared fetch wrapper: single auth header, error parsing, timeout & JSON
// handling for every API call.
// ---------------------------------------------------------------------------

interface ApiFetchOptions extends RequestInit {
  timeoutMs?: number;
  auth?: boolean;
}

async function parseApiError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return typeof body.detail === "string" ? body.detail : `Request failed (${res.status})`;
}

async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { timeoutMs = 20000, auth = true, headers, ...rest } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const mergedHeaders: Record<string, string> = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string>),
    };
    if (auth) {
      const token = getToken();
      if (token) mergedHeaders.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(await parseApiError(res));
    }

    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export interface TransportOption {
  id: string;
  mode: string;
  provider: string;
  service_name: string;
  source: string;
  destination: string;
  departure: string;
  arrival: string;
  duration: number;
  distance: number;
  price: number;
  currency: string;
  travelers: number;
  stops: number;
  availability: string;
  comfort: number;
  convenience: number;
  fuel_cost: number;
  toll_cost: number;
  booking_url: string | null;
  booking_support: boolean;
  is_demo: boolean;
  data_source: string;
}

export interface SearchResponse {
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  travelers: number;
  budget: number | null;
  options: TransportOption[];
  total_options: number;
}

export interface ComparisonResult {
  cheapest: TransportOption | null;
  fastest: TransportOption | null;
  best_value: TransportOption | null;
  best_comfort: TransportOption | null;
  best_convenience: TransportOption | null;
  ranked: TransportOption[];
}

export async function searchTransport(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  travelers: number;
  budget?: number;
}): Promise<SearchResponse> {
  return apiFetch<SearchResponse>("/search/transport", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function compareTransport(
  options: TransportOption[],
  profile?: string,
): Promise<ComparisonResult> {
  return apiFetch<ComparisonResult>("/transport/compare", {
    method: "POST",
    body: JSON.stringify({ options, profile }),
  });
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  };
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: false,
  });
}

export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("ts_token", token);
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ts_token");
  }
  return null;
}

export async function getMe(): Promise<{
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}> {
  if (!getToken()) {
    throw new Error("Not authenticated");
  }
  return apiFetch<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  }>("/auth/me");
}

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export async function adminDashboardStats(): Promise<{
  total_users: number;
  total_admins: number;
  total_customers: number;
}> {
  return apiFetch<{
    total_users: number;
    total_admins: number;
    total_customers: number;
  }>("/admin/dashboard/stats");
}

// ---------------------------------------------------------------------------
// Weather-aware trip planning
// ---------------------------------------------------------------------------

export interface WeatherDay {
  date: string;
  temperature: number;
  temperature_min: number | null;
  feels_like: number | null;
  condition: string;
  description: string;
  precipitation_probability: number;
  rainfall_mm: number;
  wind_speed: number;
  humidity: number | null;
  available: boolean;
  category: string;
  category_label: string;
  category_icon: string;
  icon: string;
}

export interface WeatherAlert {
  type: string;
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  date: string;
}

export interface ActivityRecommendation {
  icon: string;
  title: string;
  type: string;
  why: string;
}

export interface WeatherResponse {
  destination: string;
  start_date: string;
  end_date: string;
  source: string;
  available: boolean;
  forecast: WeatherDay[];
  alerts: WeatherAlert[];
  recommendations: (ActivityRecommendation & { date: string; day_label: string })[];
}

export interface ItineraryActivity {
  icon?: string;
  title: string;
  type: string;
  time?: string;
}

export interface ItineraryDay {
  date: string;
  day_label: string;
  weather: WeatherDay | null;
  category?: string;
  category_label?: string;
  category_icon?: string;
  activities: ItineraryActivity[];
  rationale?: string;
}

export interface ItineraryResponse {
  destination: string;
  start_date: string;
  end_date: string;
  trip_type: string;
  weather_available: boolean;
  weather_note: string | null;
  forecast: WeatherDay[] | null;
  itinerary: ItineraryDay[];
  summary: string;
  alerts: WeatherAlert[];
  is_ai_generated: boolean;
  data_source: string;
}

export interface OptimizeChange {
  date: string;
  category: string;
  category_label: string;
  category_icon: string;
  rationale: string;
  before: ItineraryActivity[];
  after: ItineraryActivity[];
  moved: { title: string; from_date: string; to_date: string | null }[];
  best_alternative_date: string | null;
}

export interface OptimizeResponse {
  destination: string;
  weather_available: boolean;
  forecast: {
    date: string;
    condition: string;
    description: string;
    temperature: number;
    precipitation_probability: number;
  }[];
  alerts: WeatherAlert[];
  changes: OptimizeChange[];
  moved: { title: string; from_date: string; to_date: string | null }[];
  summary: string;
}

export async function getWeather(params: {
  destination: string;
  lat?: number;
  lon?: number;
  start_date?: string;
  end_date?: string;
  trip_type?: string;
  preferences?: string | string[];
}): Promise<WeatherResponse> {
  const qs = new URLSearchParams({ destination: params.destination });
  if (params.lat != null) qs.set("lat", String(params.lat));
  if (params.lon != null) qs.set("lon", String(params.lon));
  if (params.start_date) qs.set("start_date", params.start_date);
  if (params.end_date) qs.set("end_date", params.end_date);
  if (params.trip_type) qs.set("trip_type", params.trip_type);
  if (params.preferences) qs.set("preferences", params.preferences.toString());
  return apiFetch<WeatherResponse>(`/weather?${qs.toString()}`, { auth: false });
}

export async function generateItinerary(params: {
  destination: string;
  origin?: string;
  start_date: string;
  end_date: string;
  travelers: number;
  budget?: string;
  trip_type?: string;
  preferences?: string | string[];
  preference?: string;
}): Promise<ItineraryResponse> {
  return apiFetch<ItineraryResponse>("/ai/itinerary", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

export async function optimizeItinerary(params: {
  destination: string;
  start_date?: string;
  end_date?: string;
  itinerary: { date: string; activities: ItineraryActivity[] }[];
  trip_type?: string;
  preferences?: string | string[];
}): Promise<OptimizeResponse> {
  return apiFetch<OptimizeResponse>("/weather/optimize", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

// ---------------------------------------------------------------------------
// Hotels API
// ---------------------------------------------------------------------------

export interface BackendHotel {
  id: string;
  name: string;
  city: string;
  location: string;
  rating: number;
  reviews: number;
  price_per_night: number;
  currency: string;
  amenities: string[];
  room_types: string[];
  distance_from_attractions: number;
  availability: string;
  description: string;
  image: string;
}

/** Map a backend hotel to the frontend Hotel shape used by cards/detail pages. */
export function toFrontendHotel(
  h: BackendHotel,
): {
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
  rooms: { name: string; sleeps: number; price: number; refundable: boolean }[];
  policies: string[];
  coords: string;
} {
  const image = h.image || `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=60`;
  return {
    id: h.id,
    name: h.name,
    city: h.city,
    location: `${h.location}${h.distance_from_attractions != null ? `, ${h.distance_from_attractions} km from attractions` : ""}`,
    rating: h.rating ?? 0,
    reviews: h.reviews ?? 0,
    image,
    images: [image],
    pricePerNight: h.price_per_night ?? 0,
    amenities: h.amenities ?? [],
    description: h.description ?? "",
    rooms: (h.room_types ?? []).map((rt) => ({
      name: rt,
      sleeps: 2,
      price: h.price_per_night ?? 0,
      refundable: true,
    })),
    policies: [
      "Check-in from 2:00 PM · Check-out until 12:00 PM",
      "Free cancellation up to 48 hours before arrival",
    ],
    coords: "",
  };
}

export interface HotelSearchResponse {
  destination: string;
  hotels: BackendHotel[];
  total: number;
  is_demo: boolean;
}

export interface HotelComparison {
  cheapest: BackendHotel | null;
  top_rated: BackendHotel | null;
  closest: BackendHotel | null;
  best_value: BackendHotel | null;
  ranked: BackendHotel[];
}

export async function searchHotels(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  max_price?: number;
  min_rating?: number;
  amenities?: string[];
}): Promise<HotelSearchResponse> {
  return apiFetch<HotelSearchResponse>("/hotels/search", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

export async function compareHotels(hotels: BackendHotel[]): Promise<HotelComparison> {
  return apiFetch<HotelComparison>("/hotels/compare", {
    method: "POST",
    body: JSON.stringify({ hotels }),
    auth: false,
  });
}

export async function recommendHotel(params: {
  destination: string;
  checkin?: string;
  checkout?: string;
  guests?: number;
  max_price?: number;
  min_rating?: number;
  budget?: number;
  travel_purpose?: string;
}): Promise<{
  destination: string;
  recommendation: BackendHotel | null;
  reason: string;
  alternatives: BackendHotel[];
  is_demo: boolean;
}> {
  return apiFetch("/hotels/recommend", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

export interface PackageEstimate {
  origin: string;
  destination: string;
  nights: number;
  travelers: number;
  transport: {
    options_count: number;
    one_way_cheapest: number | null;
    round_trip: number | null;
    fares: number[];
  };
  hotel: { matches: number; cheapest_per_night: number | null; est_total: number | null; rooms: number };
  food: { style: string; est_total: number; per_day: number };
  local_travel: { est_total: number; per_day: number };
  activities: { est_total: number; per_day: number };
  estimated_total: number;
  currency: string;
  is_demo: boolean;
}

export async function estimatePackage(params: {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  travelers: number;
  budget?: number;
  food_style?: string;
}): Promise<PackageEstimate> {
  return apiFetch<PackageEstimate>("/package/estimate", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

// ---------------------------------------------------------------------------
// Discovery API
// ---------------------------------------------------------------------------

export interface NearbyPlace {
  name: string;
  cuisine?: string;
  avg_cost?: number;
  rating?: number;
  type?: string;
  must_try?: string;
  category?: string;
  cost?: number;
  duration?: number;
  cost_per_day?: number;
  image?: string;
  dish_image?: string;
}

export interface NearbyResponse {
  city: string;
  restaurants: NearbyPlace[];
  activities: NearbyPlace[];
  local_transport: NearbyPlace[];
  weather_note: string;
  snapshot: string;
  is_demo: boolean;
}

export interface TimePlanResponse {
  city: string;
  time_of_day: string;
  meal: string;
  activities: NearbyPlace[];
  restaurants: NearbyPlace[];
  tip: string;
  is_demo: boolean;
}

export interface WhereResponse {
  recommendation: { city: string; category: string; tier: string; why: string };
  alternatives: { city: string; category: string; tier: string; why: string }[];
  tip: string;
  is_demo: boolean;
}

export interface PackingResponse {
  city: string;
  days: number;
  season: string | null;
  items: string[];
  tip: string;
  is_demo: boolean;
}

export interface GuideResponse {
  city: string;
  snapshot: string;
  weather_note: string;
  restaurants: NearbyPlace[];
  activities: NearbyPlace[];
  local_transport: NearbyPlace[];
  itinerary: {
    day1: { morning: string; afternoon: string; evening: string };
    day2: { morning: string; afternoon: string; evening: string };
  };
  is_demo: boolean;
}

export function discoverNearby(params: {
  city: string;
  category?: string;
  max_cost?: number;
}): Promise<NearbyResponse> {
  const qs = new URLSearchParams({ city: params.city });
  if (params.category) qs.set("category", params.category);
  if (params.max_cost != null) qs.set("max_cost", String(params.max_cost));
  return apiFetch<NearbyResponse>(`/discover/nearby?${qs.toString()}`, { auth: false });
}

export function discoverFood(params: {
  city: string;
  style?: string;
  budget?: number;
}): Promise<{ city: string; recommendations: NearbyPlace[]; is_demo: boolean }> {
  const qs = new URLSearchParams({ city: params.city });
  if (params.style) qs.set("style", params.style);
  if (params.budget != null) qs.set("budget", String(params.budget));
  return apiFetch(`/discover/food?${qs.toString()}`, { auth: false });
}

export function discoverTimePlan(params: {
  city: string;
  time_of_day?: string;
  travelers?: number;
}): Promise<TimePlanResponse> {
  const qs = new URLSearchParams({ city: params.city, time_of_day: params.time_of_day ?? "evening" });
  if (params.travelers != null) qs.set("travelers", String(params.travelers));
  return apiFetch<TimePlanResponse>(`/discover/time-plan?${qs.toString()}`, { auth: false });
}

export function whereShouldIGo(params: {
  preferences?: string;
  budget?: number;
}): Promise<WhereResponse> {
  const qs = new URLSearchParams();
  if (params.preferences) qs.set("preferences", params.preferences);
  if (params.budget != null) qs.set("budget", String(params.budget));
  return apiFetch<WhereResponse>(`/discover/where-should-i-go?${qs.toString()}`, { auth: false });
}

export function packingList(params: { city: string; days?: number; season?: string }): Promise<PackingResponse> {
  const qs = new URLSearchParams({ city: params.city, days: String(params.days ?? 3) });
  if (params.season) qs.set("season", params.season);
  return apiFetch<PackingResponse>(`/discover/packing-list?${qs.toString()}`, { auth: false });
}

export function destinationGuide(city: string): Promise<GuideResponse> {
  return apiFetch<GuideResponse>(`/discover/destination-guide?city=${encodeURIComponent(city)}`, { auth: false });
}

// ---------------------------------------------------------------------------
// AI travel chat
// ---------------------------------------------------------------------------

export interface ChatResponse {
  answer: string;
  intent: "generative" | "rules" | "fallback";
  is_ai_generated: boolean;
  data_source: string;
  data: Record<string, unknown> | null;
}

export async function travelChat(message: string): Promise<ChatResponse> {
  return apiFetch<ChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
    auth: false,
  });
}

// ---------------------------------------------------------------------------
// Trips API (auth required)
// ---------------------------------------------------------------------------

export interface Trip {
  id: string;
  code: string;
  owner_id: string;
  title: string;
  origin: string | null;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  travelers: number;
  budget: number | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface TripMember {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string | null;
}

export interface TripItem {
  id: string;
  trip_id: string;
  added_by: string;
  item_type: string;
  title: string;
  provider: string | null;
  mode: string | null;
  source: string | null;
  destination: string | null;
  date: string | null;
  departure: string | null;
  arrival: string | null;
  duration: number | null;
  price: number;
  currency: string;
  travelers: number;
  status: string;
  details: string | null;
  created_at: string | null;
}

export interface TripExpense {
  id: string;
  trip_id: string;
  added_by: string;
  title: string;
  category: string;
  amount: number;
  paid_by: string | null;
  date: string | null;
  notes: string | null;
  created_at: string | null;
}

export interface TripDetail {
  trip: Trip;
  members: TripMember[];
  items: TripItem[];
  expenses: TripExpense[];
}

export async function createTrip(params: {
  title: string;
  origin?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  travelers?: number;
  budget?: number;
}): Promise<{ trip: Trip; code: string }> {
  return apiFetch<{ trip: Trip; code: string }>("/trips", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function listTrips(): Promise<{ trips: Trip[] }> {
  return apiFetch<{ trips: Trip[] }>("/trips");
}

export async function getTrip(tripId: string): Promise<TripDetail> {
  return apiFetch<TripDetail>(`/trips/${tripId}`);
}

export async function joinTrip(code: string): Promise<{ trip: Trip; already_member: boolean }> {
  return apiFetch<{ trip: Trip; already_member: boolean }>("/trips/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export async function addTripItem(
  tripId: string,
  params: {
    item_type: string;
    title: string;
    provider?: string;
    mode?: string;
    source?: string;
    destination?: string;
    date?: string;
    departure?: string;
    arrival?: string;
    duration?: number;
    price?: number;
    currency?: string;
    travelers?: number;
    details?: string;
  },
): Promise<{ item: TripItem }> {
  return apiFetch<{ item: TripItem }>(`/trips/${tripId}/items`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function updateTripItemStatus(
  tripId: string,
  itemId: string,
  status: string,
): Promise<{ item: TripItem }> {
  return apiFetch<{ item: TripItem }>(`/trips/${tripId}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteTripItem(tripId: string, itemId: string): Promise<void> {
  return apiFetch<void>(`/trips/${tripId}/items/${itemId}`, { method: "DELETE" });
}

export async function addTripExpense(
  tripId: string,
  params: { title: string; category: string; amount: number; paid_by?: string; date?: string; notes?: string },
): Promise<{ expense: TripExpense }> {
  return apiFetch<{ expense: TripExpense }>(`/trips/${tripId}/expenses`, {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getTripBudget(tripId: string): Promise<{
  trip_id: string;
  budget: number | null;
  spent: number;
  planned: number;
  total: number;
  remaining: number | null;
  per_person: number;
  travelers: number;
}> {
  return apiFetch(`/trips/${tripId}/budget`);
}

// ---------------------------------------------------------------------------
// Booking / ticket system
// ---------------------------------------------------------------------------

export interface Booking {
  id: string;
  ticket_id: string;
  customer_name: string;
  mobile: string;
  email: string;
  address: string | null;
  item_type: string;
  title: string;
  destination: string | null;
  travel_date: string | null;
  travelers: number;
  price: number;
  currency: string;
  status: "confirmed" | "pending" | "cancelled";
  email_sent: boolean;
  sms_sent: boolean;
  created_at: string | null;
}

export interface BookingCreateParams {
  customer_name: string;
  mobile: string;
  email: string;
  address?: string;
  item_type: string;
  title: string;
  destination?: string;
  travel_date?: string;
  travelers?: number;
  price?: number;
  currency?: string;
}

/** Create a booking (guest or logged-in). Returns the ticket + notification flags. */
export async function createBooking(
  params: BookingCreateParams,
): Promise<{ booking: Booking; email_sent: boolean; sms_sent: boolean }> {
  return apiFetch<{ booking: Booking; email_sent: boolean; sms_sent: boolean }>("/bookings", {
    method: "POST",
    body: JSON.stringify(params),
    auth: false,
  });
}

/** List the logged-in user's bookings. */
export async function listMyBookings(): Promise<{ bookings: Booking[] }> {
  return apiFetch<{ bookings: Booking[] }>("/bookings/me");
}

/** Look up a ticket by ID (guest must pass mobile; owner can omit it). */
export async function getBookingByTicket(
  ticketId: string,
  mobile?: string,
): Promise<{ booking: Booking }> {
  const qs = mobile ? `?mobile=${encodeURIComponent(mobile)}` : "";
  return apiFetch<{ booking: Booking }>(`/bookings/ticket/${ticketId}${qs}`, { auth: false });
}

/** Cancel a ticket (guest must pass mobile; owner can omit it). */
export async function cancelBookingByTicket(
  ticketId: string,
  mobile?: string,
): Promise<{ booking: Booking }> {
  return apiFetch<{ booking: Booking }>(`/bookings/ticket/${ticketId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ mobile: mobile ?? "" }),
    auth: false,
  });
}
