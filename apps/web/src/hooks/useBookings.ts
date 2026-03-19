"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/types/booking";

type BookingsResponse = {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
  };
};

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    try {
      const res = await api.get<BookingsResponse>("/bookings/my", true);
      setBookings(res.data.bookings);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return { bookings, loading, error, reload: loadBookings };
}

