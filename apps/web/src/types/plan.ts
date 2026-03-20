export type BillingCycle = "MONTHLY" | "YEARLY";
export type PaymentProvider = "PAYSTACK" | "MTN_MOMO";

export type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PlanCapabilities = {
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
};