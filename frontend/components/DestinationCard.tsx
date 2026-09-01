import Link from "next/link";
import { SmartImage } from "./SmartImage";

type DestinationCardProps = {
  name: string;
  sub: string;
  tagline?: string;
  image: string;
  gradient: string;
  href: string;
  meta: React.ReactNode;
};

export function DestinationCard({
  name,
  sub,
  tagline,
  image,
  gradient,
  href,
  meta,
}: DestinationCardProps) {
  return (
    <Link
      href={href}
      className="card-hover group relative block overflow-hidden rounded-2xl shadow-soft"
    >
      <div className="relative h-44 w-full">
        <SmartImage
          src={image}
          alt={name}
          fill
          gradient={gradient}
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="text-lg font-bold text-white">{name}</div>
          <div className="text-xs text-white/80">{sub}</div>
          {tagline && <div className="mt-1 text-xs text-white/70">{tagline}</div>}
          <div className="mt-2 text-xs font-semibold text-accent-300">{meta}</div>
        </div>
      </div>
    </Link>
  );
}
