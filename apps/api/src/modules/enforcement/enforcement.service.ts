import { Prisma, UsageType, type Service } from "@prisma/client";
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

function getCapabilitiesFromSubscription(subscription: ActiveSubscription | null): PlanCapabilities {
  if (!subscription) {
    return { ...DEFAULT_CAPABILITIES };
  }

  return {
    includedBookings: subscription.plan.includedBookings,
    allowsPremiumServices: subscription.plan.allowsPremiumServices,
    allowsPriorityBooking: subscription.plan.allowsPriorityBooking,
    allowsFleetDashboard: subscription.plan.allowsFleetDashboard,
  };
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
} as const;

type ActiveSubscription = Prisma.SubscriptionGetPayload<{
  include: typeof ACTIVE_SUBSCRIPTION_INCLUDE;
}>;

export const enforcementService = {
  getCurrentPeriodKey,

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

  async getCapabilitiesForUser(userId: string): Promise<PlanCapabilities> {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return getCapabilitiesFromSubscription(subscription);
  },

  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return Boolean(subscription);
  },

  async getUsageForCurrentPeriod(userId: string) {
    const periodKey = getCurrentPeriodKey();

    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      return {
        periodKey,
        includedBookingsUsed: 0,
        includedBookingsAllowed: 0,
        includedBookingsRemaining: 0,
      };
    }

    const usageRecord = await prisma.subscriptionUsage.findUnique({
      where: {
        subscriptionId_periodKey_usageType: {
          subscriptionId: subscription.id,
          periodKey,
          usageType: UsageType.INCLUDED_BOOKING,
        },
      },
      select: {
        usedCount: true,
      },
    });

    const includedBookingsUsed = usageRecord?.usedCount ?? 0;
    const includedBookingsAllowed = subscription.plan.includedBookings;
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

  async assertPremiumServiceAccess(userId: string, service: Service) {
    if (!service.isPremium) {
      return;
    }

    const capabilities = await this.getCapabilitiesForUser(userId);
    if (!capabilities.allowsPremiumServices) {
      throw new Error("Your current membership plan does not include premium services");
    }
  },

  async assertIncludedBookingAvailable(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    if (!subscription) {
      throw new Error("An active membership plan is required");
    }

    const usage = await this.getUsageForCurrentPeriod(userId);
    if (usage.includedBookingsRemaining <= 0) {
      throw new Error(`Included booking limit reached for ${usage.periodKey}`);
    }
  },

  async consumeIncludedBooking(
    subscriptionId: string,
    bookingId: string,
    periodKey: string,
    tx?: Prisma.TransactionClient,
  ) {
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
