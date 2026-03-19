import type { Prisma } from "@prisma/client";
import { prisma } from "../../db/prisma";
import type { BookingStatus } from "../bookings/bookings.types";

export interface AdminBookingFilters {
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  customerEmail?: string;
  serviceId?: string;
  page: number;
  limit: number;
}

export interface AdminCustomerFilters {
  page: number;
  limit: number;
  email?: string;
  name?: string;
}

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: { service: true; customer: true };
}>;

export type CustomerRow = Prisma.UserGetPayload<Record<string, never>>;

export interface PaginatedBookingsResult {
  items: BookingWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginatedCustomersResult {
  items: CustomerRow[];
  total: number;
  page: number;
  limit: number;
}

function buildBookingWhere(
  filters: Omit<AdminBookingFilters, "page" | "limit">
): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.serviceId) where.serviceId = filters.serviceId;
  if (filters.dateFrom || filters.dateTo) {
    where.scheduledDate = {
      ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
      ...(filters.dateTo ? { lte: filters.dateTo } : {}),
    };
  }
  if (filters.customerEmail) {
    where.customer = {
      email: { contains: filters.customerEmail, mode: "insensitive" },
    };
  }
  return where;
}

function buildCustomerWhere(
  filters: Pick<AdminCustomerFilters, "email" | "name">
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { role: "CUSTOMER" };
  if (filters.email) where.email = { contains: filters.email, mode: "insensitive" };
  if (filters.name) where.fullName = { contains: filters.name, mode: "insensitive" };
  return where;
}

export const adminRepository = {
  async findBookings(filters: AdminBookingFilters): Promise<PaginatedBookingsResult> {
    const { page, limit, ...rest } = filters;
    const where = buildBookingWhere(rest);
    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { service: true, customer: true },
      }),
      prisma.booking.count({ where }),
    ]);
    return { items, total, page, limit };
  },

  findBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
      include: { service: true, customer: true },
    });
  },

  async findCustomers(filters: AdminCustomerFilters): Promise<PaginatedCustomersResult> {
    const { page, limit, email, name } = filters;
    const where = buildCustomerWhere({ email, name });
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total, page, limit };
  },
};


