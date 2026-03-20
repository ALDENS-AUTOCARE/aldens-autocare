import type { PlanDto } from "./plan";

export type SubscriptionStatus =
  | "PENDING"
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export type BillingCycle = "MONTHLY" | "YEARLY";

export type SubscriptionDto = {
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
  plan: PlanDto;
};

export type SubscriptionUsageDto = {
  periodKey: string;
  includedBookingsUsed: number;
  includedBookingsAllowed: number;
  includedBookingsRemaining: number;
};
