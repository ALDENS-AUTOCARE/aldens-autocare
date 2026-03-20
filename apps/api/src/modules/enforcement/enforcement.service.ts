import { Prisma, UsageType } from "@prisma/client";
import { prisma } from "../../db/prisma";
import type { PlanCapabilities } from "../plans/plans.types";

export const DEFAULT_CAPABILITIES: PlanCapabilities = {
  includedBookings: 0,
  allowsPremiumServices: false,
  allowsPriorityBooking: false,
  allowsFleetDashboard: false,
};

function getCurrentPeriodKey(date = new Date()) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

const ACTIVE_SUBSCRIPTION_INCLUDE = {
  plan: {
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      monthlyPrice: true,
      yearlyPrice: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      includedBookings: true,
      allowsPremiumServices: true,
      allowsPriorityBooking: true,
      allowsFleetDashboard: true,
    },
  },
  usageRecords: true,
} as const;

type ActiveSubscription = Prisma.SubscriptionGetPayload<{
  include: typeof ACTIVE_SUBSCRIPTION_INCLUDE;
}>;

export const enforcementService = {
  async getActiveSubscriptionForUser(userId: string) {
    const now = new Date();

    return prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        startDate: { lte: now },
        renewalDate: { gte: now },
      },
      include: ACTIVE_SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  getCapabilitiesFromSubscription(subscription: ActiveSubscription | null): PlanCapabilities {
    if (!subscription) {
      return { ...DEFAULT_CAPABILITIES };
    }

    return {
      includedBookings: subscription.plan.includedBookings,
      allowsPremiumServices: subscription.plan.allowsPremiumServices,
      allowsPriorityBooking: subscription.plan.allowsPriorityBooking,
      allowsFleetDashboard: subscription.plan.allowsFleetDashboard,
    };
  },

  async getCapabilitiesForUser(userId: string): Promise<PlanCapabilities> {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return this.getCapabilitiesFromSubscription(subscription);
  },

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return Boolean(subscription);
  },

  async canAccessPremiumService(userId: string) {
    const capabilities = await this.getCapabilitiesForUser(userId);
    return capabilities.allowsPremiumServices;
  },

  getCurrentPeriodUsage(subscription: ActiveSubscription, usageType: UsageType) {
    const periodKey = getCurrentPeriodKey();
    const usageRecord = subscription.usageRecords.find(
      (record) => record.periodKey === periodKey && record.usageType === usageType,
    );

    return {
      periodKey,
      usedCount: usageRecord?.usedCount ?? 0,
      usageRecord,
    };
  },

  getIncludedBookingUsageSummary(subscription: ActiveSubscription | null) {
    const periodKey = getCurrentPeriodKey();

    if (!subscription) {
      return {
        periodKey,
        usedIncludedBookings: 0,
        remainingIncludedBookings: 0,
      };
    }

    const capabilities = this.getCapabilitiesFromSubscription(subscription);
    const usage = this.getCurrentPeriodUsage(subscription, UsageType.INCLUDED_BOOKING);

    return {
      periodKey: usage.periodKey,
      usedIncludedBookings: usage.usedCount,
      remainingIncludedBookings: Math.max(
        capabilities.includedBookings - usage.usedCount,
        0,
      ),
    };
  },

  async canUseIncludedBooking(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      return {
        allowed: false,
        reason: "An active membership plan is required",
        subscription: null,
        periodKey: getCurrentPeriodKey(),
        remainingIncludedBookings: 0,
      };
    }

    const capabilities = this.getCapabilitiesFromSubscription(subscription);
    const usage = this.getCurrentPeriodUsage(subscription, UsageType.INCLUDED_BOOKING);
    const remainingIncludedBookings = Math.max(capabilities.includedBookings - usage.usedCount, 0);

    if (remainingIncludedBookings <= 0) {
      return {
        allowed: false,
        reason: `Included booking limit reached for ${usage.periodKey}`,
        subscription,
        periodKey: usage.periodKey,
        remainingIncludedBookings,
      };
    }

    return {
      allowed: true,
      reason: null,
      subscription,
      periodKey: usage.periodKey,
      remainingIncludedBookings,
    };
  },

  async consumeIncludedBooking(
    subscriptionId: string,
    bookingId: string,
    tx?: Prisma.TransactionClient,
  ) {
    const periodKey = getCurrentPeriodKey();
    const db = tx ?? prisma;

    return db.subscriptionUsage.upsert({
      where: {
        subscriptionId_periodKey_usageType: {
          subscriptionId,
          periodKey,
          usageType: UsageType.INCLUDED_BOOKING,
        },
      },
      update: {
        usedCount: {
          increment: 1,
        },
        bookingId,
      },
      create: {
        subscriptionId,
        bookingId,
        usageType: UsageType.INCLUDED_BOOKING,
        periodKey,
        usedCount: 1,
      },
    });
  },
};
