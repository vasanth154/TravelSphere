"use client";

import { ArrowLeftRight } from "lucide-react";

/**
 * Floating circular button that sits between the "From" and "To" fields of a
 * route form. Place inside a `relative` container wrapping the From field.
 */
export function SwapButton({
  onSwap,
  className = "",
}: {
  onSwap: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSwap}
      aria-label="Swap origin and destination"
      title="Swap origin and destination"
      className={`absolute right-0 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 hover:shadow ${className}`}
    >
      <ArrowLeftRight className="h-4 w-4" />
    </button>
  );
}