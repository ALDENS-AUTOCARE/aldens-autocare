import type { Booking } from "@/types/booking";

type Props = {
  bookings: Booking[];
};

export function AdminBookingsTable({ bookings }: Props) {
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
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-[--border]">
              <td className="px-4 py-3">{booking.service?.name || "—"}</td>
              <td className="px-4 py-3">{booking.vehicleType}</td>
              <td className="px-4 py-3">{booking.locationArea || "—"}</td>
              <td className="px-4 py-3">
                {new Date(booking.scheduledDate).toLocaleString()}
              </td>
              <td className="px-4 py-3">{booking.status}</td>
              <td className="px-4 py-3">{booking.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

