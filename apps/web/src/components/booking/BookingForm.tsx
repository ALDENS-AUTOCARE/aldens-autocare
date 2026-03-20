"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Textarea } from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { useServices } from "@/hooks/useServices";
import { useActiveSubscription } from "@/hooks/useActiveSubscription";
import { api } from "@/lib/api";

type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: {
    booking: {
      id: string;
    };
  };
};

export function BookingForm() {
  const router = useRouter();
  const { services } = useServices();
  const { subscription, capabilities } = useActiveSubscription();
  const [form, setForm] = useState({
    serviceId: "",
    vehicleType: "SUV",
    vehicleMake: "",
    vehicleModel: "",
    vehicleColor: "",
    vehiclePlate: "",
    serviceAddress: "",
    locationArea: "",
    scheduledDate: "",
    notes: "",
    useIncludedBooking: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedService = services.find((service) => service.id === form.serviceId);
  const canAttemptIncludedBooking = Boolean(subscription && capabilities.includedBookings > 0);
  const premiumBlocked = Boolean(selectedService?.isPremium && !capabilities.allowsPremiumServices);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (premiumBlocked) {
      setError("Your current membership plan does not include premium services.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        scheduledDate: form.scheduledDate
          ? new Date(form.scheduledDate).toISOString()
          : form.scheduledDate,
      };

      await api.post<CreateBookingResponse>("/bookings", payload, true);
      router.push("/dashboard/bookings");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4">
      <Select
        label="Service"
        value={form.serviceId}
        onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
        options={[
          { value: "", label: "Select a service" },
          ...services.map((service) => ({
            value: service.id,
            label: `${service.name} — GHS ${service.basePrice}${service.isPremium ? " • Premium" : ""}`,
          })),
        ]}
      />

      {selectedService ? (
        <div className="rounded-2xl border border-[--border] bg-black/20 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{selectedService.name}</h3>
            {selectedService.isPremium ? <Badge text="PREMIUM" /> : null}
          </div>
          <p className="mt-2 text-sm text-neutral-400">{selectedService.description}</p>
        </div>
      ) : null}

      {subscription ? (
        <div className="rounded-2xl border border-[--border] bg-black/20 p-4">
          <p className="text-sm font-semibold text-white">Active membership: {subscription.plan.name}</p>
          <p className="mt-2 text-sm text-neutral-400">
            Included bookings available on this plan: {capabilities.includedBookings} per month.
          </p>

          {canAttemptIncludedBooking ? (
            <label className="mt-4 flex items-start gap-3 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.useIncludedBooking}
                onChange={(e) => setForm({ ...form, useIncludedBooking: e.target.checked })}
                className="mt-1 h-4 w-4 rounded border-[--border] accent-[--gold]"
              />
              <span>
                Use an included booking credit for this appointment.
                <span className="block text-xs text-neutral-500">
                  Final eligibility is verified server-side for your current monthly period.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      ) : null}

      {premiumBlocked ? (
        <p className="text-sm text-amber-300">
          The selected service requires premium membership access.
        </p>
      ) : null}

      <Select
        label="Vehicle Type"
        value={form.vehicleType}
        onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
        options={[
          { value: "Sedan", label: "Sedan" },
          { value: "SUV", label: "SUV" },
          { value: "Pickup", label: "Pickup" },
          { value: "Van", label: "Van" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Vehicle Make"
          value={form.vehicleMake}
          onChange={(e) => setForm({ ...form, vehicleMake: e.target.value })}
        />
        <Input
          label="Vehicle Model"
          value={form.vehicleModel}
          onChange={(e) => setForm({ ...form, vehicleModel: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Vehicle Color"
          value={form.vehicleColor}
          onChange={(e) => setForm({ ...form, vehicleColor: e.target.value })}
        />
        <Input
          label="Plate Number"
          value={form.vehiclePlate}
          onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })}
        />
      </div>

      <Input
        label="Service Address"
        value={form.serviceAddress}
        onChange={(e) => setForm({ ...form, serviceAddress: e.target.value })}
      />

      <Input
        label="Location Area"
        value={form.locationArea}
        onChange={(e) => setForm({ ...form, locationArea: e.target.value })}
        placeholder="Tema Community 25"
      />

      <Input
        label="Scheduled Date & Time"
        type="datetime-local"
        value={form.scheduledDate}
        onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
      />

      <Textarea
        label="Notes"
        rows={4}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating booking..." : "Create Booking"}
      </Button>
    </form>
  );
}

