import { describe, it, expect } from "vitest";
import { encodeSearchResult, decodeSearchResult } from "../lib/search-url";
import type { SearchResponse } from "../lib/api";

const sample: SearchResponse = {
  origin: "New York",
  destination: "Boston",
  departure_date: "2026-09-15",
  return_date: "2026-09-20",
  travelers: 2,
  budget: 2000,
  options: [
    {
      id: "flight-1",
      mode: "flight",
      provider: "TestAir",
      service_name: "NYC-BOS",
      source: "New York",
      destination: "Boston",
      departure: "08:00",
      arrival: "09:15",
      duration: 75,
      distance: 306,
      price: 120,
      currency: "USD",
      travelers: 2,
      stops: 0,
      availability: "available",
      comfort: 8,
      convenience: 9,
      fuel_cost: 0,
      toll_cost: 0,
      booking_url: null,
      booking_support: false,
      is_demo: true,
      data_source: "demo",
    },
  ],
  total_options: 1,
};

describe("search-url roundtrip", () => {
  it("encodes then decodes a search result back to the same shape", () => {
    const query = encodeSearchResult(sample);
    const decoded = decodeSearchResult(query);
    expect(decoded).not.toBeNull();
    expect(decoded!.origin).toBe("New York");
    expect(decoded!.destination).toBe("Boston");
    expect(decoded!.departure_date).toBe("2026-09-15");
    expect(decoded!.return_date).toBe("2026-09-20");
    expect(decoded!.travelers).toBe(2);
    expect(decoded!.budget).toBe(2000);
    expect(decoded!.options).toHaveLength(1);
    expect(decoded!.options![0]!.id).toBe("flight-1");
  });

  it("round-trips a result without return_date or budget", () => {
    const noReturn: SearchResponse = { ...sample, return_date: null, budget: null };
    const decoded = decodeSearchResult(encodeSearchResult(noReturn));
    expect(decoded!.return_date).toBeNull();
    expect(decoded!.budget).toBeNull();
  });

  it("returns null for an invalid query string", () => {
    expect(decodeSearchResult("")).toBeNull();
    expect(decodeSearchResult("origin=New+York")).toBeNull();
  });
});