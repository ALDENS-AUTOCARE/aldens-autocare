import type { BillingCycle, PaymentProvider, Plan, PlanCapabilities } from "./plan";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type Subscription = {
  id: string;
  userId?: string | null;
  companyId?: string | null;
  planId: string;
  provider: PaymentProvider;
  providerReference?: string | null;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
  plan: Plan;
};

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