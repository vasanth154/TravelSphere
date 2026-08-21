"use client";

import { BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Reviews</h1>
        <p className="mt-1 text-slate-500">Moderate customer reviews and ratings</p>
      </div>

      <Card className="p-6">
        <div className="text-center py-12 text-slate-500">
          <BarChart2 className="h-12 w-12 mx-auto text-slate-300" />
          <p className="mt-4 text-lg">Review moderation coming soon</p>
        </div>
      </Card>
    </div>
  );
}