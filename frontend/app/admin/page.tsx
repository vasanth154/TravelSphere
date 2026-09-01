"use client";

import { Users, Hotel, MapPin, CreditCard, TrendingUp, Activity } from "lucide-react";
import { adminDashboardStats } from "../../lib/api";
import { useAdminData } from "../../hooks/useAdminData";
import { Card } from "../../components/ui/Card";

export default function AdminDashboardPage() {
  const { data: stats, loading, error } = useAdminData<{
    total_users: number;
    total_admins: number;
    total_customers: number;
  }>({ load: adminDashboardStats });

  const statCards = [
    { label: "Total Users", value: stats?.total_users ?? 0, icon: Users, color: "bg-brand-500" },
    { label: "Admins", value: stats?.total_admins ?? 0, icon: Activity, color: "bg-rose-500" },
    { label: "Customers", value: stats?.total_customers ?? 0, icon: Users, color: "bg-emerald-500" },
    { label: "Hotels", value: 0, icon: Hotel, color: "bg-amber-500" },
    { label: "Destinations", value: 0, icon: MapPin, color: "bg-cyan-500" },
    { label: "Bookings", value: 0, icon: CreditCard, color: "bg-violet-500" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">Overview of your TravelSphere platform</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-slate-900">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="mt-2 text-sm text-slate-500">Common administrative tasks</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <a href="/admin/users" className="btn btn-secondary btn-block">Manage Users</a>
            <a href="/admin/hotels" className="btn btn-secondary btn-block">Manage Hotels</a>
            <a href="/admin/transport" className="btn btn-secondary btn-block">Manage Transport</a>
            <a href="/admin/destinations" className="btn btn-secondary btn-block">Manage Destinations</a>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-900">System Status</h2>
          <p className="mt-2 text-sm text-slate-500">Platform health overview</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">API Status</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Database</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Weather Service</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Active (Mock)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">AI Service</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Rule-based Mode
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}