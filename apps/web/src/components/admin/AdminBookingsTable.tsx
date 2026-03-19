"use client";

import { useState } from "react";
import type { Booking } from "@/types/booking";
import { api } from "@/lib/api";
import { Button } from "@/components/shared/Button";

type Props = {
  bookings: Booking[];
  onUpdated?: () => void;
};

const nextActions: Record<string, string[]> = {
  PENDING: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function AdminBookingsTable({ bookings, onUpdated }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    try {
      setBusyId(id);
      await api.patch(`/admin/bookings/${id}/status`, { status }, true);
      await onUpdated?.();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="border-b border-[--border] text-left text-neutral-400">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Vehicle</th>
            <th className="px-4 py-3">Area</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-[--border] align-top">
              <td className="px-4 py-3">{booking.service?.name || "—"}</td>
              <td className="px-4 py-3">{booking.vehicleType}</td>
              <td className="px-4 py-3">{booking.locationArea || "—"}</td>
              <td className="px-4 py-3">
                {new Date(booking.scheduledDate).toLocaleString()}
              </td>
              <td className="px-4 py-3">{booking.status}</td>
              <td className="px-4 py-3">{booking.paymentStatus}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {(nextActions[booking.status] || []).map((status) => (
                    <Button
                      key={status}
                      variant="ghost"
                      disabled={busyId === booking.id}
                      onClick={() => updateStatus(booking.id, status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

