export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export type PaymentStatus = "PENDING" | "SUCCESSFUL" | "FAILED" | "REFUNDED";

export interface BookingServiceResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingResponse {
  id: string;
  customerId: string;
  serviceId: string;
  vehicleType: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehiclePlate: string | null;
  serviceAddress: string;
  locationArea: string | null;
  scheduledDate: Date;
  notes: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  service: BookingServiceResponse;
}

export interface CancelBookingResponse {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  updatedAt: Date;
}

