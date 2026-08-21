import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading…", className = "" }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-16 text-slate-500 ${className}`} role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-brand-500" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} aria-hidden />;
}
