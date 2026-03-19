"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function AdminPage() {
  return (
    <AuthGuard adminOnly>
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <AdminSidebar />
          <div className="card p-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-neutral-400">
              Manage bookings, customers, and operations.
            </p>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}

