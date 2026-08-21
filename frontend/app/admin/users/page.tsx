"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Users</h1>
          <p className="mt-1 text-slate-500">Manage platform users and their roles</p>
        </div>
        <a href="/admin/users/new" className="btn btn-primary btn-sm">Add User</a>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-sm font-semibold text-slate-500">User</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Role</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Status</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Joined</th>
                <th className="pb-3 text-sm font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-4">
                  <div className="font-medium text-slate-900">admin@travelsphere.com</div>
                  <div className="text-sm text-slate-500">TravelSphere Admin</div>
                </td>
                <td className="py-4">
                  <Badge tone="rose">Admin</Badge>
                </td>
                <td className="py-4">
                  <Badge tone="green">Active</Badge>
                </td>
                <td className="py-4 text-sm text-slate-500">2026-08-20</td>
                <td className="py-4">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-4">
                  <div className="font-medium text-slate-900">test@test.com</div>
                  <div className="text-sm text-slate-500">Test User</div>
                </td>
                <td className="py-4">
                  <Badge tone="slate">Customer</Badge>
                </td>
                <td className="py-4">
                  <Badge tone="green">Active</Badge>
                </td>
                <td className="py-4 text-sm text-slate-500">2026-08-20</td>
                <td className="py-4">
                  <Button variant="ghost" size="sm">Edit</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}