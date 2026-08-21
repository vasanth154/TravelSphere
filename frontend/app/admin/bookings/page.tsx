"use client";

import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Bookings</h1>
        <p className="mt-1 text-slate-500">View and manage all bookings</p>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-slate-500">
          <CreditCard className="h-12 w-12 mx-auto text-slate-300" />
          <p className="mt-4 text-lg">Booking management coming soon</p>
        </div>
      </Card>
    </div>
  );
}