export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const res = await fetch(`${API_BASE_URL}/search/transport`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }
  return res.json();
}

export async function compareTransport(
  options: TransportOption[],
  profile?: string,
): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE_URL}/transport/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ options, profile }),
  });
  if (!res.ok) {
    throw new Error(`Comparison failed: ${res.status}`);
  }
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
}

export async function register(payload: {
  email: string;
  password: string;
  full_name?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
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
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to get user");
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

export async function adminDashboardStats(): Promise<{
  total_users: number;
  total_admins: number;
  total_customers: number;
}> {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const res = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load admin stats");
  }
  return res.json();
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

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}));
  return typeof body.detail === "string" ? body.detail : `Request failed (${res.status})`;
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
  const res = await fetch(`${API_BASE_URL}/weather?${qs.toString()}`);
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/ai/itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function optimizeItinerary(params: {
  destination: string;
  start_date?: string;
  end_date?: string;
  itinerary: { date: string; activities: ItineraryActivity[] }[];
  trip_type?: string;
  preferences?: string | string[];
}): Promise<OptimizeResponse> {
  const res = await fetch(`${API_BASE_URL}/weather/optimize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}
