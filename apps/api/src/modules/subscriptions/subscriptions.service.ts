import crypto from "crypto";
import { SubscriptionStatus } from "@prisma/client";
import { plansService } from "../plans/plans.service";
import { subscriptionsRepository } from "./subscriptions.repository";
import { paymentsRepository } from "../payments/payments.repository";
import { paystackProvider } from "../payments/providers/paystack.provider";
import { mtnMomoProvider } from "../payments/providers/mtn-momo.provider";
import type { ActiveSubscriptionResult, PlanCode, SerializedPlan } from "./subscriptions.types";

type CheckoutInput = {
  planCode: PlanCode;
  billingCycle: "MONTHLY" | "YEARLY";
  provider: "PAYSTACK" | "MTN_MOMO";
};

type UsageResult = {
  periodKey: string;
  includedBookingsUsed: number;
  includedBookingsAllowed: number;
  includedBookingsRemaining: number;
};

type SubscriptionWithPlan = NonNullable<Awaited<ReturnType<typeof subscriptionsRepository.findLatestForUser>>>;

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function addYears(date: Date, years: number) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function serializePlan(plan: SubscriptionWithPlan["plan"]): SerializedPlan {
  return {
    id: plan.id,
    code: plan.code as PlanCode,
    name: plan.name,
    description: plan.description,
    monthlyPrice: Number(plan.monthlyPrice),
    yearlyPrice: plan.yearlyPrice != null ? Number(plan.yearlyPrice) : null,
    includedBookings: plan.includedBookings,
    allowsPremiumServices: plan.allowsPremiumServices,
    allowsPriorityBooking: plan.allowsPriorityBooking,
    allowsFleetDashboard: plan.allowsFleetDashboard,
    isActive: plan.isActive,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

function serializeSubscription(subscription: SubscriptionWithPlan) {
  return {
    ...subscription,
    plan: serializePlan(subscription.plan),
  };
}

function getAmountForCycle(
  monthlyPrice: { toString(): string },
  yearlyPrice: { toString(): string } | null,
  billingCycle: CheckoutInput["billingCycle"],
) {
  if (billingCycle === "YEARLY") {
    if (!yearlyPrice) {
      throw new Error("Yearly billing is not available for this plan");
    }

    return Number(yearlyPrice);
  }

  return Number(monthlyPrice);
}

async function createSubscriptionCheckout(
  userId: string,
  input: CheckoutInput,
  options?: {
    allowExistingActive?: boolean;
    startDate?: Date;
    referencePrefix?: string;
  },
) {
  if (!options?.allowExistingActive) {
    const existingActive = await subscriptionsRepository.findActiveForUser(userId);
    if (existingActive) {
      throw new Error("You already have an active subscription. Use upgrade instead.");
    }
  }

  const existingPending = await subscriptionsRepository.findPendingByUserId(userId);
  if (existingPending) {
    throw new Error("You already have a pending subscription.");
  }

  const plan = await plansService.findByCode(input.planCode);

  const startDate = options?.startDate ?? new Date();
  const renewalDate =
    input.billingCycle === "MONTHLY" ? addMonths(startDate, 1) : addYears(startDate, 1);
  const reference = `${options?.referencePrefix ?? "SUB"}_${Date.now()}_${crypto
    .randomBytes(4)
    .toString("hex")}`;

  const subscription = await subscriptionsRepository.create({
    userId,
    planId: plan.id,
    provider: input.provider,
    providerReference: reference,
    billingCycle: input.billingCycle,
    startDate,
    renewalDate,
    status: "PENDING",
  });

  const amount = getAmountForCycle(plan.monthlyPrice, plan.yearlyPrice, input.billingCycle);

  await paymentsRepository.createSubscriptionPayment({
    userId,
    subscriptionId: subscription.id,
    provider: input.provider,
    providerReference: reference,
    amount,
    currency: "GHS",
    paymentType: "SUBSCRIPTION_INITIAL",
  });

  const { prisma } = await import("../../db/prisma");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, phone: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (input.provider === "PAYSTACK") {
    const initialized = await paystackProvider.initializeSubscriptionPayment({
      email: user.email,
      phone: user.phone ?? null,
      amount,
      currency: "GHS",
      reference,
      metadata: {
        subscriptionId: subscription.id,
        userId,
        planCode: plan.code,
      },
    });

    return {
      subscription,
      checkoutUrl: initialized.checkoutUrl,
      reference: initialized.reference,
      redirectRequired: initialized.redirectRequired,
      providerMessage: initialized.providerMessage,
    };
  }

  if (!user.phone) {
    throw new Error("A phone number is required for MTN MoMo subscription payments");
  }

  const momo = await mtnMomoProvider.initializeSubscriptionPayment({
    email: user.email,
    phone: user.phone,
    amount,
    currency: "GHS",
    reference,
    metadata: {
      subscriptionId: subscription.id,
      userId,
      planCode: plan.code,
    },
  });

  return {
    subscription,
    checkoutUrl: momo.checkoutUrl,
    reference: momo.reference,
    redirectRequired: momo.redirectRequired,
    providerMessage: momo.providerMessage,
  };
}

export const subscriptionsService = {
  async getMe(userId: string) {
    return subscriptionsRepository.findLatestForUser(userId);
  },

  async getActive(userId: string) {
    return subscriptionsRepository.findActiveForUser(userId);
  },

  async getUsage(userId: string): Promise<UsageResult> {
    const active = await subscriptionsRepository.findActiveForUser(userId);
    const periodKey = new Date().toISOString().slice(0, 7);

    if (!active) {
      return {
        periodKey,
        includedBookingsUsed: 0,
        includedBookingsAllowed: 0,
        includedBookingsRemaining: 0,
      };
    }

    const { prisma } = await import("../../db/prisma");
    const usageRows = await prisma.subscriptionUsage.findMany({
      where: {
        subscriptionId: active.id,
        usageType: "INCLUDED_BOOKING",
        periodKey,
      },
    });

    const includedBookingsUsed = usageRows.reduce((sum, row) => sum + row.usedCount, 0);
    const includedBookingsAllowed = active.plan.includedBookings;
    const includedBookingsRemaining = Math.max(
      includedBookingsAllowed - includedBookingsUsed,
      0,
    );

    return {
      periodKey,
      includedBookingsUsed,
      includedBookingsAllowed,
      includedBookingsRemaining,
    };
  },

  async getCapabilities(userId: string) {
    const active = await subscriptionsRepository.findActiveForUser(userId);

    if (!active) {
      return {
        includedBookings: 0,
        allowsPremiumServices: false,
        allowsPriorityBooking: false,
        allowsFleetDashboard: false,
      };
    }

    return {
      includedBookings: active.plan.includedBookings,
      allowsPremiumServices: active.plan.allowsPremiumServices,
      allowsPriorityBooking: active.plan.allowsPriorityBooking,
      allowsFleetDashboard: active.plan.allowsFleetDashboard,
    };
  },

  async checkout(userId: string, input: CheckoutInput) {
    return createSubscriptionCheckout(userId, input);
  },

  async cancel(
    userId: string,
    subscriptionIdOrCancelAtPeriodEnd: string | boolean,
    maybeCancelAtPeriodEnd?: boolean,
  ) {
    if (typeof subscriptionIdOrCancelAtPeriodEnd === "boolean") {
      const sub = await subscriptionsRepository.findActiveForUser(userId);

      if (!sub) {
        throw new Error("No active subscription found");
      }

      return subscriptionsRepository.updateCancelAtPeriodEnd(
        sub.id,
        subscriptionIdOrCancelAtPeriodEnd,
      );
    }

    const subscription = await subscriptionsRepository.findById(subscriptionIdOrCancelAtPeriodEnd);

    if (!subscription || subscription.userId !== userId) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "ACTIVE" && subscription.status !== "PENDING") {
      throw new Error("Only active or pending subscriptions can be updated");
    }

    return subscriptionsRepository.updateCancelAtPeriodEnd(
      subscription.id,
      maybeCancelAtPeriodEnd ?? true,
    );
  },

  async upgrade(userId: string, input: CheckoutInput) {
    const current = await subscriptionsRepository.findActiveForUser(userId);

    if (!current) {
      throw new Error("No active subscription found");
    }

    if (current.plan.code === input.planCode) {
      throw new Error("You are already on this plan");
    }

    await subscriptionsRepository.updateCancelAtPeriodEnd(current.id, true);

    const now = new Date();
    const upgradeStartDate = current.renewalDate > now ? current.renewalDate : now;

    return createSubscriptionCheckout(userId, input, {
      allowExistingActive: true,
      startDate: upgradeStartDate,
      referencePrefix: "SUB_UPG",
    });
  },

  // Backward-compatible aliases used by existing controllers/admin flows.
  async initiate(userId: string, input: CheckoutInput) {
    return this.checkout(userId, input);
  },

  async findMine(userId: string) {
    const subscriptions = await subscriptionsRepository.findManyByUserId(userId);
    return subscriptions.map(serializeSubscription);
  },

  async findCurrent(userId: string) {
    const subscription = await subscriptionsRepository.findCurrentByUserId(userId);
    return subscription ? serializeSubscription(subscription) : null;
  },

  async findCapabilities(userId: string) {
    return this.getCapabilities(userId);
  },

  async findUsage(userId: string) {
    return this.getUsage(userId);
  },

  async findActive(userId: string): Promise<ActiveSubscriptionResult> {
    const [subscription, capabilities, usage] = await Promise.all([
      this.getActive(userId),
      this.getCapabilities(userId),
      this.getUsage(userId),
    ]);

    return {
      subscription: subscription ? serializeSubscription(subscription) : null,
      capabilities,
      usage: {
        periodKey: usage.periodKey,
        usedIncludedBookings: usage.includedBookingsUsed,
        remainingIncludedBookings: usage.includedBookingsRemaining,
      },
    };
  },

  async cancelCurrent(userId: string, cancelAtPeriodEnd: boolean) {
    const subscription = await subscriptionsRepository.findCurrentByUserId(userId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return this.cancel(userId, subscription.id, cancelAtPeriodEnd);
  },

  async adminUpdateStatus(subscriptionId: string, status: Exclude<SubscriptionStatus, "PENDING">) {
    const subscription = await subscriptionsRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return subscriptionsRepository.updateStatusById(subscriptionId, status);
  },
};
