"use client";

import { useState } from "react";
import type { Booking } from "@/types/booking";
import { Badge } from "@/components/shared/Badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/shared/Button";
import { api } from "@/lib/api";

type Props = {
  bookings: Booking[];
  onReload?: () => void;
};

type PaymentInitResponse = {
  success: boolean;
  message: string;
  data: {
    checkoutUrl: string;
  };
};

export function BookingList({ bookings }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function payNow(bookingId: string) {
    try {
      setBusyId(bookingId);
      const res = await api.post<PaymentInitResponse>(
        "/payments/initiate-booking-payment",
        {
          bookingId,
          paymentType: "FULL_BOOKING_PAYMENT",
          provider: "PAYSTACK",
        },
        true
      );

      window.location.href = res.data.checkoutUrl;
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (!bookings.length) {
    return <EmptyState title="No bookings yet" description="Your bookings will appear here." />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{booking.service?.name || "Booking"}</h3>
                <p className="text-sm text-neutral-400">{booking.vehicleType}</p>
                <p className="mt-1 text-sm text-neutral-400">{booking.serviceAddress}</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {new Date(booking.scheduledDate).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge text={booking.status} />
                <Badge text={booking.paymentStatus} />
              </div>
            </div>

            {booking.paymentStatus === "PENDING" && booking.status !== "CANCELLED" ? (
              <div>
                <Button disabled={busyId === booking.id} onClick={() => payNow(booking.id)}>
                  {busyId === booking.id ? "Initializing payment..." : "Pay Now"}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

