"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import { Textarea } from "@/components/shared/Textarea";
import { Button } from "@/components/shared/Button";
import { useServices } from "@/hooks/useServices";
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
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post<CreateBookingResponse>("/bookings", form, true);
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
            label: `${service.name} — GHS ${service.basePrice}`,
          })),
        ]}
      />

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
        onChange={(e) => setForm({ ...form, scheduledDate: new Date(e.target.value).toISOString() })}
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

