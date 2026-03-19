"use client";

import { BookingForm } from "@/components/booking/BookingForm";
import { AuthGuard } from "@/components/shared/AuthGuard";

export default function BookPage() {
  return (
    <AuthGuard>
      <section className="container-page py-16">
        <h1 className="text-4xl font-bold">Book Your Service</h1>
        <p className="mt-3 text-neutral-400">
          Schedule your detailing appointment in Tema or Accra.
        </p>
        <div className="mt-8 max-w-3xl">
          <BookingForm />
        </div>
      </section>
    </AuthGuard>
  );
}

