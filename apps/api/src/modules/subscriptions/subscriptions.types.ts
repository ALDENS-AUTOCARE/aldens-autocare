import type { PlanCapabilities } from "../plans/plans.types";

export type { PlanCapabilities };
export type CapabilityDto = PlanCapabilities;

export type PlanCode = "SIGNATURE" | "EXECUTIVE" | "FLEETCARE";

export type SerializedPlan = {
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
  createdAt: Date;
  updatedAt: Date;
};

export type IncludedBookingUsage = {
  periodKey: string;
  usedIncludedBookings: number;
  remainingIncludedBookings: number;
};

export type ActiveSubscriptionResult = {
  subscription: {
    id: string;
    planId: string;
    status: string;
    billingCycle: string;
    startDate: Date;
    renewalDate: Date;
    cancelAtPeriodEnd: boolean;
    plan: SerializedPlan;
  } | null;
  capabilities: PlanCapabilities;
  usage: IncludedBookingUsage;
};
