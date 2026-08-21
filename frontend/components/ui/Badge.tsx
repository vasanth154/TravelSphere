import { ReactNode } from "react";

type Tone = "brand" | "accent" | "green" | "rose" | "slate";

export function Badge({
  tone = "brand",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  const toneClass = {
    brand: "badge-brand",
    accent: "badge-accent",
    green: "badge-green",
    rose: "badge-rose",
    slate: "badge-slate",
  }[tone];
  return <span className={`${toneClass} ${className}`}>{children}</span>;
}
