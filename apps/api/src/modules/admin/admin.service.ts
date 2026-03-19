import { prisma } from "../../db/prisma";

type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

const allowedTransitions: Record<string, BookingStatus[]> = {
  PENDING: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const adminService = {
  async getBookings() {
    return prisma.booking.findMany({
      include: {
        service: true,
        customer: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getBookingById(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    return booking;
  },

  async updateBookingStatus(id: string, nextStatus: BookingStatus) {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const allowed = allowedTransitions[booking.status] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid status transition from ${booking.status} to ${nextStatus}`);
    }

    return prisma.booking.update({
      where: { id },
      data: { status: nextStatus },
    });
  },

  async getCustomers() {
    return prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    });
  },
};


