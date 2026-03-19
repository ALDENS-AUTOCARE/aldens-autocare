import type { Role, UserStatus } from "@prisma/client";
import type { BookingResponse, BookingStatus, PaymentStatus } from "../bookings/bookings.types";

export interface AdminCustomerResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminBookingResponse extends BookingResponse {
  customer: AdminCustomerResponse;
}

export interface UpdateBookingStatusResponse {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  updatedAt: Date;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}


