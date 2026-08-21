import Link from "next/link";
import { Share2, Camera, Send, Play } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  const cols = [
    {
      title: "Explore",
      links: [
        { label: "Plan a Trip", href: "/search" },
        { label: "Hotels", href: "/hotels" },
        { label: "Transport", href: "/search/results" },
        { label: "My Trips", href: "/trips" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About us", href: "/" },
        { label: "Careers", href: "/" },
        { label: "Press", href: "/" },
        { label: "Blog", href: "/" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/" },
        { label: "Contact", href: "/" },
        { label: "Privacy", href: "/" },
        { label: "Terms", href: "/" },
      ],
    },
  ];

  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="section grid gap-10 pb-10 pt-14 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-slate-500">
            AI-powered multi-modal travel planning for India. Compare transport,
            book stays, and build trips in one place.
          </p>
          <div className="mt-5 flex gap-3 text-slate-400">
            <a href="#" aria-label="Twitter" className="hover:text-brand-600"><Send className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:text-brand-600"><Camera className="h-5 w-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-brand-600"><Share2 className="h-5 w-5" /></a>
            <a href="#" aria-label="YouTube" className="hover:text-brand-600"><Play className="h-5 w-5" /></a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-slate-500 transition-colors hover:text-brand-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 py-5">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} TravelSphere · Demo experience — live
          availability & payments are not connected.
        </p>
      </div>
    </footer>
  );
}
