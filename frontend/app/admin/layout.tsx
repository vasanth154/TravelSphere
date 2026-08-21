"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Hotel,
  Train,
  MapPin,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getToken, getMe } from "../../lib/api";
import { Button } from "../../components/ui/Button";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Hotels", href: "/admin/hotels", icon: Hotel },
  { name: "Transport", href: "/admin/transport", icon: Train },
  { name: "Trips", href: "/admin/trips", icon: MapPin },
  { name: "Bookings", href: "/admin/bookings", icon: CreditCard },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Destinations", href: "/admin/destinations", icon: MapPin },
  { name: "Reviews", href: "/admin/reviews", icon: BarChart2 },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    // Verify user is admin
    getMe()
      .then((user) => {
        if (user.role !== "admin") {
          router.push("/search");
        } else {
          setUserRole(user.role);
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (userRole === null) {
    return (
      <div className="app-shell min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span>Loading admin dashboard…</span>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ts_token");
    }
    router.push("/login");
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 bg-white border-r border-slate-200 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200">
          {isSidebarOpen && (
            <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-brand-700">
              <span>TravelSphere</span>
              <span className="text-xs text-slate-400">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen((v) => !v)}
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                } ${!isSidebarOpen && "justify-center"}`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {isSidebarOpen && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Button variant="ghost" fullWidth onClick={handleLogout} className="text-rose-600 hover:bg-rose-50">
            <LogOut className="h-5 w-5 mr-2" />
            {isSidebarOpen && "Sign out"}
          </Button>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold text-slate-900">
              {navigation.find((n) => n.href === pathname)?.name || "Admin"}
            </h1>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}