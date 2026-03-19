"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { useAuthContext } from "@/components/shared/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardProfilePage() {
  const { user } = useAuthContext();

  return (
    <AuthGuard>
      <section className="container-page py-16">
        <DashboardHeader title="Profile" subtitle="Your account details." />

        <div className="card p-6 max-w-xl space-y-3">
          <p><span className="text-neutral-400">Name:</span> {user?.fullName}</p>
          <p><span className="text-neutral-400">Email:</span> {user?.email}</p>
          <p><span className="text-neutral-400">Phone:</span> {user?.phone || "—"}</p>
          <p><span className="text-neutral-400">Role:</span> {user?.role}</p>
        </div>
      </section>
    </AuthGuard>
  );
}

