import type { SearchResponse } from "./api";

/**
 * Serializes search results into URL query params so the results page can be
 * shared, bookmarked and refreshed without losing data.
 */
export function encodeSearchResult(result: SearchResponse): string {
  const params = new URLSearchParams();
  params.set("origin", result.origin);
  params.set("destination", result.destination);
  params.set("departure_date", result.departure_date);
  if (result.return_date) params.set("return_date", result.return_date);
  params.set("travelers", String(result.travelers));
  if (result.budget != null) params.set("budget", String(result.budget));
  params.set("options", JSON.stringify(result.options));
  return params.toString();
}

export function decodeSearchResult(query: string): SearchResponse | null {
  const params = new URLSearchParams(query);
  const origin = params.get("origin");
  const destination = params.get("destination");
  const departureDate = params.get("departure_date");
  const rawOptions = params.get("options");
  if (!origin || !destination || !departureDate || !rawOptions) return null;

  try {
    return {
      origin,
      destination,
      departure_date: departureDate,
      return_date: params.get("return_date"),
      travelers: Number(params.get("travelers") ?? 1),
      budget: params.get("budget") ? Number(params.get("budget")) : null,
      options: JSON.parse(rawOptions) as SearchResponse["options"],
      total_options: JSON.parse(rawOptions).length,
    };
  } catch {
    return null;
  }
}
