export type PaymentProvider = "PAYSTACK" | "MTN_MOMO";

export type PlanCode = "SIGNATURE" | "EXECUTIVE" | "FLEETCARE";

export type Plan = {
  id: string;
  code: PlanCode;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number | null;
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlanDto = Plan;

export type CapabilityDto = {
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
};

export type PlanCapabilities = CapabilityDto;
