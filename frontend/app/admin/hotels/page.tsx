"use client";

import { Hotel } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminHotelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Hotels</h1>
          <p className="mt-1 text-slate-500">Manage hotel listings and availability</p>
        </div>
        <a href="/admin/hotels/new" className="btn btn-primary btn-sm">Add Hotel</a>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-slate-500">
          <Hotel className="h-12 w-12 mx-auto text-slate-300" />
          <p className="mt-4 text-lg">Hotel management coming soon</p>
          <p className="text-sm">Add, edit, and manage hotel listings</p>
        </div>
      </Card>
    </div>
  );
}