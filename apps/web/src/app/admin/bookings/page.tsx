"use client";

import { useEffect, useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBookingsTable } from "@/components/admin/AdminBookingsTable";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Loader } from "@/components/shared/Loader";
import { api } from "@/lib/api";
import type { Booking } from "@/types/booking";

type AdminBookingsResponse = {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
  };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const res = await api.get<AdminBookingsResponse>("/admin/bookings", true);
        setBookings(res.data.bookings);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <AuthGuard adminOnly>
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <AdminSidebar />
          <div>
            <h1 className="text-3xl font-bold">Admin Bookings</h1>
            <p className="mt-2 text-neutral-400">View and manage all bookings.</p>
            <div className="mt-8">
              {loading ? <Loader /> : <AdminBookingsTable bookings={bookings} />}
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}

