"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Image with a branded gradient fallback so the UI still looks premium
 * if the remote photo fails to load (e.g. offline).
 *
 * Uses next/image's optimized renderer when `width`, `height` or `fill` is
 * provided; otherwise falls back to a plain sized `<img>` for callers that
 * control sizing purely via className.
 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  fill,
  className = "",
  gradient = "from-brand-500 via-cyan-500 to-brand-700",
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  gradient?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br ${gradient} ${className}`}
        aria-hidden
      >
        <span className="text-white/80">
          <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 16l5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="8" r="2.2" />
          </svg>
        </span>
      </div>
    );
  }
  if (fill || width || height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width ?? 0}
        height={height ?? 0}
        fill={fill ?? undefined}
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}