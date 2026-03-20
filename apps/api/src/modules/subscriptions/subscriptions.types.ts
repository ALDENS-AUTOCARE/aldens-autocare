import type { PlanCapabilities } from "../plans/plans.types";

export type { PlanCapabilities };

export type SerializedPlan = {
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
