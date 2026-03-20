export type PaymentProvider = "PAYSTACK" | "MTN_MOMO";

export type PlanDto = {
  id: string;
  code: "SIGNATURE" | "EXECUTIVE" | "FLEETCARE";
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

export type PlanCode = PlanDto["code"];

export type CapabilityDto = {
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
};

export type PlanCapabilities = CapabilityDto;
