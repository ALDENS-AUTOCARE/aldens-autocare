import { prisma } from "../../db/prisma";
import { bookingsRepository } from "./bookings.repository";
import { enforcementService } from "../enforcement/enforcement.service";
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
    useIncludedBooking?: boolean;
  }) {
    const service = await servicesService.findActiveById(input.serviceId);

    const scheduledDate = new Date(input.scheduledDate);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      throw new Error("Scheduled date must be in the future");
    }

    const activeSubscription = await enforcementService.getActiveSubscriptionForUser(userId);
    await enforcementService.assertPremiumServiceAccess(userId, service);

    if (input.useIncludedBooking) {
      if (!activeSubscription) {
        throw new Error("An active membership plan is required");
      }

      await enforcementService.assertIncludedBookingAvailable(userId);
      const usage = await enforcementService.getUsageForCurrentPeriod(userId);

      return prisma.$transaction(async (tx) => {
        const booking = await bookingsRepository.create({
          customerId: userId,
          serviceId: input.serviceId,
          subscriptionId: activeSubscription.id,
          customerPlanCode: activeSubscription.plan.code,
          bookingFundingType: "SUBSCRIPTION_INCLUDED",
          status: "CONFIRMED",
          paymentStatus: "SUCCESSFUL",
          vehicleType: input.vehicleType,
          vehicleMake: input.vehicleMake,
          vehicleModel: input.vehicleModel,
          vehicleColor: input.vehicleColor,
          vehiclePlate: input.vehiclePlate,
          serviceAddress: input.serviceAddress,
          locationArea: input.locationArea,
          scheduledDate,
          notes: input.notes,
          tx,
        });

        await enforcementService.consumeIncludedBooking(
          activeSubscription.id,
          booking.id,
          usage.periodKey,
          tx,
        );

        return booking;
      });
    }

    return bookingsRepository.create({
      customerId: userId,
      serviceId: input.serviceId,
      bookingFundingType: "ONE_TIME",
      customerPlanCode: activeSubscription?.plan.code ?? null,
      subscriptionId: activeSubscription?.id ?? null,
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

