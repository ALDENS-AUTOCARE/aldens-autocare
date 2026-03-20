import type { Plan } from "./plan";
import type { PlanCapabilities } from "./plan";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type BillingCycle = "MONTHLY" | "YEARLY";

export type Subscription = {
  id: string;
  userId: string | null;
  companyId: string | null;
  planId: string;
  provider: "PAYSTACK" | "MTN_MOMO";
  providerReference: string | null;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
  plan: Plan;
};

export type SubscriptionDto = Subscription;

export type SubscriptionCapabilities = {
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
};

export type SubscriptionUsage = {
  periodKey: string;
  includedBookingsUsed: number;
  includedBookingsAllowed: number;
  includedBookingsRemaining: number;
};

export type SubscriptionUsageDto = SubscriptionUsage;

export type IncludedBookingUsage = {
  periodKey: string;
  usedIncludedBookings: number;
  remainingIncludedBookings: number;
};

export type ActiveSubscriptionPayload = {
  subscription: Subscription | null;
  capabilities: PlanCapabilities;
  usage: IncludedBookingUsage;
};
