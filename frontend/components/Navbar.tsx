"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle2 } from "lucide-react";
import { Logo } from "./Logo";
import { getToken } from "../lib/api";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Plan a Trip" },
  { href: "/hotels", label: "Hotels" },
  { href: "/discover", label: "Discover" },
  { href: "/bookings", label: "Bookings" },
  { href: "/trips", label: "My Trips" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(item.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block">
          {authed ? (
            <Link
              href="/trips"
              className="btn-secondary btn-sm"
              aria-label="My account"
            >
              <UserCircle2 className="h-4 w-4" aria-hidden />
              My Trips
            </Link>
          ) : (
            <Link href="/login" className="btn-primary btn-sm">
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost btn-sm md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              {authed ? (
                <Link href="/trips" onClick={() => setOpen(false)} className="btn-secondary btn-block btn-sm">
                  My Trips
                </Link>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="btn-primary btn-block btn-sm">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
