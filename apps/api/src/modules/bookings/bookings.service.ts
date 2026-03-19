import { bookingsRepository } from "./bookings.repository";
import { servicesService } from "../services/services.service";

const cancellableStatuses = ["PENDING", "AWAITING_PAYMENT", "CONFIRMED"] as const;

export const bookingsService = {
  async create(userId: string, input: {
    serviceId: string;
    vehicleType: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehiclePlate?: string;
    serviceAddress: string;
    locationArea?: string;
    scheduledDate: string;
    notes?: string;
  }) {
    await servicesService.findActiveById(input.serviceId);

    const scheduledDate = new Date(input.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      throw new Error("Scheduled date must be in the future");
    }

    return bookingsRepository.create({
      customerId: userId,
      serviceId: input.serviceId,
      vehicleType: input.vehicleType,
      vehicleMake: input.vehicleMake,
      vehicleModel: input.vehicleModel,
      vehicleColor: input.vehicleColor,
      vehiclePlate: input.vehiclePlate,
      serviceAddress: input.serviceAddress,
      locationArea: input.locationArea,
      scheduledDate,
      notes: input.notes,
    });
  },

  async findMine(userId: string) {
    return bookingsRepository.findManyByCustomerId(userId);
  },

  async findOneForUser(userId: string, bookingId: string, role: string) {
    const booking = await bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
    if (!isAdmin && booking.customerId !== userId) {
      throw new Error("Booking not found");
    }

    return booking;
  },

  async cancel(userId: string, bookingId: string) {
    const booking = await bookingsRepository.findById(bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== userId) {
      throw new Error("Booking not found");
    }

    if (!cancellableStatuses.includes(booking.status as (typeof cancellableStatuses)[number])) {
      throw new Error("This booking cannot be cancelled");
    }

    return bookingsRepository.updateStatus(bookingId, "CANCELLED");
  },
};

