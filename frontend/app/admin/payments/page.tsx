"use client";

import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Payments</h1>
        <p className="mt-1 text-slate-500">View payment transactions and revenue</p>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-slate-500">
          <CreditCard className="h-12 w-12 mx-auto text-slate-300" />
          <p className="mt-4 text-lg">Payment management coming soon</p>
        </div>
      </Card>
    </div>
  );
}