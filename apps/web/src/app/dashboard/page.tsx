"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BookingList } from "@/components/dashboard/BookingList";
import { useBookings } from "@/hooks/useBookings";

export default function DashboardPage() {
  const { bookings, loading } = useBookings();

  return (
    <AuthGuard>
      <section className="container-page py-16">
        <DashboardHeader
          title="Dashboard"
          subtitle="Manage your upcoming and recent bookings."
        />

        <div className="mb-6">
          <Link href="/book">
            <Button>New Booking</Button>
          </Link>
        </div>

        {loading ? <Loader /> : <BookingList bookings={bookings.slice(0, 3)} />}
      </section>
    </AuthGuard>
  );
}

