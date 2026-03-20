import crypto from "crypto";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { paymentsRepository } from "../payments/payments.repository";
import { getPaymentProvider } from "../payments/providers";
import { subscriptionsRepository } from "./subscriptions.repository";
import type { ActiveSubscriptionResult, PlanCode } from "./subscriptions.types";
import { enforcementService } from "../enforcement/enforcement.service";
import { SubscriptionStatus } from "@prisma/client";

type SubscriptionWithPlan = Awaited<ReturnType<typeof subscriptionsRepository.findById>>;

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

function getRenewalDate(startDate: Date, billingCycle: CheckoutInput["billingCycle"]) {
  const renewalDate = new Date(startDate);
  if (billingCycle === "YEARLY") {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1);
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1);
  }

  return renewalDate;
}

function getSubscriptionAmount(
  monthlyPrice: { toString(): string },
  yearlyPrice: { toString(): string } | null,
  billingCycle: CheckoutInput["billingCycle"],
) {
  return billingCycle === "YEARLY" && yearlyPrice != null
    ? Number(yearlyPrice)
    : Number(monthlyPrice);
}

async function resolveActivePlanByCode(planCode: PlanCode) {
  const plan = await prisma.plan.findUnique({ where: { code: planCode } });
  if (!plan || !plan.isActive) {
    throw new Error("Invalid plan code");
  }
  return plan;
}

function ensureBillingCycleSupported(
  billingCycle: CheckoutInput["billingCycle"],
  yearlyPrice: { toString(): string } | null,
) {
  if (billingCycle === "YEARLY" && yearlyPrice == null) {
    throw new Error("This plan does not support yearly billing");
  }
}

function createProviderReference(prefix: string) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function serializeSubscription(sub: NonNullable<SubscriptionWithPlan>) {
  return {
    ...sub,
    plan: {
      ...sub.plan,
      code: sub.plan.code as PlanCode,
      monthlyPrice: Number(sub.plan.monthlyPrice),
      yearlyPrice: sub.plan.yearlyPrice != null ? Number(sub.plan.yearlyPrice) : null,
    },
  };
}

export const subscriptionsService = {
  async initiate(userId: string, input: CheckoutInput) {
    const [plan, user, activeSubscription, pendingSubscription] = await Promise.all([
      resolveActivePlanByCode(input.planCode),
      prisma.user.findUnique({ where: { id: userId } }),
      subscriptionsRepository.findActiveByUserId(userId),
      subscriptionsRepository.findPendingByUserId(userId),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    if (activeSubscription) {
      throw new Error("You already have an active subscription");
    }

    if (pendingSubscription) {
      throw new Error("You already have a pending subscription");
    }

    ensureBillingCycleSupported(input.billingCycle, plan.yearlyPrice);

    const startDate = new Date();
    const renewalDate = getRenewalDate(startDate, input.billingCycle);

    const amount = getSubscriptionAmount(plan.monthlyPrice, plan.yearlyPrice, input.billingCycle);

    const reference = createProviderReference("AAC_SUB");
    const provider = getPaymentProvider(input.provider);

    const subscription = await subscriptionsRepository.create({
      userId,
      planId: plan.id,
      provider: input.provider,
      providerReference: reference,
      billingCycle: input.billingCycle,
      startDate,
      renewalDate,
    });

    const payment = await paymentsRepository.createSubscriptionPayment({
      userId,
      subscriptionId: subscription.id,
      provider: input.provider,
      providerReference: reference,
      amount,
      currency: "GHS",
      paymentType: "SUBSCRIPTION_INITIAL",
    });

    const initialized = await provider.initializeSubscriptionPayment({
      email: user.email,
      phone: user.phone ?? null,
      amount,
      currency: "GHS",
      reference,
      callbackUrl: `${env.WEB_APP_URL}/dashboard/bookings`,
      metadata: {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        userId,
        planCode: plan.code,
        billingCycle: input.billingCycle,
      },
    });

    return {
      subscription,
      checkoutUrl: initialized.checkoutUrl,
      accessCode: initialized.accessCode,
      reference: initialized.reference,
    };
  },

  async upgrade(userId: string, input: CheckoutInput) {
    const [activeSubscription, pendingSubscription, targetPlan, user] = await Promise.all([
      subscriptionsRepository.findActiveByUserId(userId),
      subscriptionsRepository.findPendingByUserId(userId),
      resolveActivePlanByCode(input.planCode),
      prisma.user.findUnique({ where: { id: userId } }),
    ]);
    const currentSubscription = activeSubscription ?? pendingSubscription;

    if (!currentSubscription) {
      throw new Error("You must have an existing subscription to upgrade");
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (currentSubscription.plan.code === input.planCode) {
      throw new Error("New plan must differ from current plan");
    }

    ensureBillingCycleSupported(input.billingCycle, targetPlan.yearlyPrice);

    if (currentSubscription.status === "ACTIVE") {
      await subscriptionsRepository.setCancelAtPeriodEnd(currentSubscription.id);
    }

    if (currentSubscription.status === "PENDING") {
      await subscriptionsRepository.updateStatusAndCancelFlag(
        currentSubscription.id,
        "CANCELLED",
        true,
      );
    }

    const now = new Date();
    const startDate =
      currentSubscription.status === "ACTIVE" && currentSubscription.renewalDate > now
        ? currentSubscription.renewalDate
        : now;
    const renewalDate = getRenewalDate(startDate, input.billingCycle);
    const amount = getSubscriptionAmount(
      targetPlan.monthlyPrice,
      targetPlan.yearlyPrice,
      input.billingCycle,
    );

    const reference = createProviderReference("AAC_UPG");
    const provider = getPaymentProvider(input.provider);

    const subscription = await subscriptionsRepository.create({
      userId,
      planId: targetPlan.id,
      provider: input.provider,
      providerReference: reference,
      billingCycle: input.billingCycle,
      startDate,
      renewalDate,
    });

    const payment = await paymentsRepository.createSubscriptionPayment({
      userId,
      subscriptionId: subscription.id,
      provider: input.provider,
      providerReference: reference,
      amount,
      currency: "GHS",
      paymentType: "SUBSCRIPTION_RENEWAL",
    });

    const initialized = await provider.initializeSubscriptionPayment({
      email: user.email,
      phone: user.phone ?? null,
      amount,
      currency: "GHS",
      reference,
      callbackUrl: `${env.WEB_APP_URL}/dashboard/membership`,
      metadata: {
        subscriptionId: subscription.id,
        paymentId: payment.id,
        userId,
        planCode: targetPlan.code,
        billingCycle: input.billingCycle,
        upgradeFromSubscriptionId: currentSubscription.id,
      },
    });

    return {
      subscription,
      checkoutUrl: initialized.checkoutUrl,
      accessCode: initialized.accessCode,
      reference: initialized.reference,
    };
  },

  async findMine(userId: string) {
    const subs = await subscriptionsRepository.findManyByUserId(userId);
    return subs.map(serializeSubscription);
  },

  async findCurrent(userId: string) {
    const subscription = await subscriptionsRepository.findCurrentByUserId(userId);
    return subscription ? serializeSubscription(subscription) : null;
  },

  async findCapabilities(userId: string) {
    return enforcementService.getCapabilitiesForUser(userId);
  },

  async findUsage(userId: string): Promise<UsageResult> {
    const subscription = await enforcementService.getActiveSubscriptionForUser(userId);
    const capabilities = enforcementService.getCapabilitiesFromSubscription(subscription);
    const usage = enforcementService.getIncludedBookingUsageSummary(subscription);

    return {
      periodKey: usage.periodKey,
      includedBookingsUsed: usage.usedIncludedBookings,
      includedBookingsAllowed: capabilities.includedBookings,
      includedBookingsRemaining: usage.remainingIncludedBookings,
    };
  },

  async findActive(userId: string): Promise<ActiveSubscriptionResult> {
    const subscription = await enforcementService.getActiveSubscriptionForUser(userId);
    const capabilities = enforcementService.getCapabilitiesFromSubscription(subscription);
    const usage = enforcementService.getIncludedBookingUsageSummary(subscription);
    return {
      subscription: subscription ? serializeSubscription(subscription) : null,
      capabilities,
      usage,
    };
  },

  async cancel(userId: string, subscriptionId: string, _cancelAtPeriodEnd: boolean) {
    const subscription = await subscriptionsRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.userId !== userId) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "ACTIVE" && subscription.status !== "PENDING") {
      throw new Error("Only active or pending subscriptions can be updated");
    }

    if (subscription.cancelAtPeriodEnd) {
      return subscription;
    }

    return subscriptionsRepository.setCancelAtPeriodEnd(subscriptionId);
  },

  async cancelCurrent(userId: string, cancelAtPeriodEnd: boolean) {
    const subscription = await subscriptionsRepository.findCurrentByUserId(userId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return this.cancel(userId, subscription.id, cancelAtPeriodEnd);
  },

  async adminUpdateStatus(subscriptionId: string, status: Exclude<
    SubscriptionStatus,
    "PENDING"
  >) {
    const subscription = await subscriptionsRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    return subscriptionsRepository.updateStatusById(subscriptionId, status);
  },
};
