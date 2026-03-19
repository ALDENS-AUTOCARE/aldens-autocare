"use client";

import { AuthGuard } from "@/components/shared/AuthGuard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BookingList } from "@/components/dashboard/BookingList";
import { Loader } from "@/components/shared/Loader";
import { useBookings } from "@/hooks/useBookings";

export default function DashboardBookingsPage() {
  const { bookings, loading } = useBookings();

  return (
    <AuthGuard>
      <section className="container-page py-16">
        <DashboardHeader
          title="My Bookings"
          subtitle="Track all your detailing appointments."
        />
        {loading ? <Loader /> : <BookingList bookings={bookings} />}
      </section>
    </AuthGuard>
  );
}

