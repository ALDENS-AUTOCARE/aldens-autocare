import type { Service } from "./service";

export type BookingStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REFUNDED";

export type BookingFundingType = "ONE_TIME" | "SUBSCRIPTION_INCLUDED";

export type Booking = {
  id: string;
  customerId: string;
  serviceId: string;
  subscriptionId?: string | null;
  customerPlanCode?: string | null;
  bookingFundingType?: BookingFundingType;
  vehicleType: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehiclePlate: string | null;
  serviceAddress: string;
  locationArea: string | null;
  scheduledDate: string;
  notes: string | null;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  service?: Service;
};

