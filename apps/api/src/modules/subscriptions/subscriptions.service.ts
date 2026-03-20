import crypto from "crypto";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { paymentsRepository } from "../payments/payments.repository";
import { getPaymentProvider } from "../payments/providers";
import { subscriptionsRepository } from "./subscriptions.repository";
import type { ActiveSubscriptionResult } from "./subscriptions.types";
import { enforcementService } from "../enforcement/enforcement.service";

type SubscriptionWithPlan = Awaited<ReturnType<typeof subscriptionsRepository.findById>>;

function serializeSubscription(sub: NonNullable<SubscriptionWithPlan>) {
  return {
    ...sub,
    plan: {
      ...sub.plan,
      monthlyPrice: Number(sub.plan.monthlyPrice),
      yearlyPrice: sub.plan.yearlyPrice != null ? Number(sub.plan.yearlyPrice) : null,
    },
  };
}

export const subscriptionsService = {
  async initiate(
    userId: string,
    input: {
      planId: string;
      billingCycle: "MONTHLY" | "YEARLY";
      provider: "PAYSTACK" | "MTN_MOMO";
    },
  ) {
    const [plan, user, activeSubscription] = await Promise.all([
      prisma.plan.findUnique({ where: { id: input.planId } }),
      prisma.user.findUnique({ where: { id: userId } }),
      subscriptionsRepository.findActiveByUserId(userId),
    ]);

    if (!plan || !plan.isActive) {
      throw new Error("Plan not found");
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (activeSubscription) {
      throw new Error("You already have an active subscription");
    }

    if (input.billingCycle === "YEARLY" && plan.yearlyPrice == null) {
      throw new Error("This plan does not support yearly billing");
    }

    const startDate = new Date();
    const renewalDate = new Date(startDate);
    if (input.billingCycle === "YEARLY") {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
    } else {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
    }

    const amount =
      input.billingCycle === "YEARLY" && plan.yearlyPrice != null
        ? Number(plan.yearlyPrice)
        : Number(plan.monthlyPrice);

    const reference = `AAC_SUB_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
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

  async findMine(userId: string) {
    const subs = await subscriptionsRepository.findManyByUserId(userId);
    return subs.map(serializeSubscription);
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

  async cancel(userId: string, subscriptionId: string) {
    const subscription = await subscriptionsRepository.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.userId !== userId) {
      throw new Error("Subscription not found");
    }

    if (subscription.status !== "ACTIVE") {
      throw new Error("Only active subscriptions can be cancelled");
    }

    if (subscription.cancelAtPeriodEnd) {
      throw new Error("Subscription is already set to cancel");
    }

    return subscriptionsRepository.setCancelAtPeriodEnd(subscriptionId);
  },
};
