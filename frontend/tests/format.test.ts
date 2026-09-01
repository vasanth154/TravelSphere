import { describe, it, expect } from "vitest";
import { formatINR, formatDuration, formatDate } from "../lib/format";

describe("formatINR", () => {
  it("formats amount with ₹ and Indian grouping", () => {
    expect(formatINR(1500)).toBe("₹1,500");
    expect(formatINR(123456)).toBe("₹1,23,456");
  });

  it("rounds decimal amounts", () => {
    expect(formatINR(1999.6)).toBe("₹2,000");
  });
});

describe("formatDuration", () => {
  it("formats minutes under one hour", () => {
    expect(formatDuration(45)).toBe("45m");
  });

  it("formats full hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(95)).toBe("1h 35m");
  });
});

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-08-20")).not.toBe("2026-08-20");
  });

  it("returns input unchanged when parsing fails", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});