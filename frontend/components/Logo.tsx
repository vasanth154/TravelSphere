import Link from "next/link";
import { Globe2 } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2 ${className}`} aria-label="TravelSphere home">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-pop">
        <Globe2 className="h-5 w-5 text-white" aria-hidden />
      </span>
      <span className="text-lg font-extrabold tracking-tight text-slate-900">
        Travel<span className="text-brand-600">Sphere</span>
      </span>
    </Link>
  );
}
