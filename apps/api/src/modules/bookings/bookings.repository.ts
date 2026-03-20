import { prisma } from "../../db/prisma";
import {
  BookingFundingType,
  BookingStatus,
  PaymentStatus,
  Prisma,
} from "@prisma/client";

export const bookingsRepository = {
  create(input: {
    customerId: string;
    serviceId: string;
    subscriptionId?: string | null;
    customerPlanCode?: string | null;
    bookingFundingType?: BookingFundingType;
    vehicleType: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehiclePlate?: string;
    serviceAddress: string;
    locationArea?: string;
    scheduledDate: Date;
    notes?: string;
    status?: BookingStatus;
    paymentStatus?: PaymentStatus;
    tx?: Prisma.TransactionClient;
  }) {
    const db = input.tx ?? prisma;

    return db.booking.create({
      data: {
        customerId: input.customerId,
        serviceId: input.serviceId,
        subscriptionId: input.subscriptionId ?? null,
        customerPlanCode: input.customerPlanCode ?? null,
        bookingFundingType: input.bookingFundingType ?? "ONE_TIME",
        vehicleType: input.vehicleType,
        vehicleMake: input.vehicleMake ?? null,
        vehicleModel: input.vehicleModel ?? null,
        vehicleColor: input.vehicleColor ?? null,
        vehiclePlate: input.vehiclePlate ?? null,
        serviceAddress: input.serviceAddress,
        locationArea: input.locationArea ?? null,
        scheduledDate: input.scheduledDate,
        notes: input.notes ?? null,
        status: input.status ?? "PENDING",
        paymentStatus: input.paymentStatus ?? "PENDING",
      },
      include: {
        service: true,
      },
    });
  },

  findById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        customer: true,
      },
    });
  },

  findManyByCustomerId(customerId: string) {
    return prisma.booking.findMany({
      where: { customerId },
      include: { service: true },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: BookingStatus) {
    return prisma.booking.update({
      where: { id },
      data: { status },
    });
  },

  updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return prisma.booking.update({
      where: { id },
      data: { paymentStatus },
    });
  },
};

