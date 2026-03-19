import type { Booking } from "@/types/booking";
import { Badge } from "@/components/shared/Badge";
import { EmptyState } from "@/components/shared/EmptyState";

type Props = {
  bookings: Booking[];
};

export function BookingList({ bookings }: Props) {
  if (!bookings.length) {
    return <EmptyState title="No bookings yet" description="Your bookings will appear here." />;
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card p-5">
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
        </div>
      ))}
    </div>
  );
}

