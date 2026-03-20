import { Prisma, UsageType, type Service } from "@prisma/client";
import { prisma } from "../../db/prisma";
import { subscriptionsRepository } from "../subscriptions/subscriptions.repository";

function getPeriodKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

export const enforcementService = {
  async getActiveSubscriptionForUser(userId: string) {
    return subscriptionsRepository.findActiveForUser(userId);
  },

  async getCapabilitiesForUser(userId: string) {
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

  async assertPremiumServiceAccess(userId: string, service?: Pick<Service, "isPremium">) {
    if (service && !service.isPremium) {
      return;
    }

    const capabilities = await this.getCapabilitiesForUser(userId);

    if (!capabilities.allowsPremiumServices) {
      throw new Error("Premium services are not available on your current plan");
    }
  },

  async getIncludedBookingUsage(userId: string) {
    const subscription = await subscriptionsRepository.findActiveForUser(userId);
    const periodKey = getPeriodKey();

    if (!subscription) {
      return {
        subscription: null,
        periodKey,
        used: 0,
        allowed: 0,
        remaining: 0,
      };
    }

    const usageRows = await prisma.subscriptionUsage.findMany({
      where: {
        subscriptionId: subscription.id,
        usageType: "INCLUDED_BOOKING",
        periodKey,
      },
    });

    const used = usageRows.reduce((sum, row) => sum + row.usedCount, 0);
    const allowed = subscription.plan.includedBookings;
    const remaining = Math.max(allowed - used, 0);

    return {
      subscription,
      periodKey,
      used,
      allowed,
      remaining,
    };
  },

  async assertIncludedBookingAvailable(userId: string) {
    const usage = await this.getIncludedBookingUsage(userId);

    if (!usage.subscription) {
      throw new Error("Active subscription required");
    }

    if (usage.remaining <= 0) {
      throw new Error("Included monthly booking limit has been reached");
    }

    return usage;
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

  // Backward-compatible helpers used by existing booking flow.
  getCurrentPeriodKey(date?: Date) {
    return getPeriodKey(date);
  },

  async hasActiveSubscription(userId: string) {
    const subscription = await this.getActiveSubscriptionForUser(userId);
    return Boolean(subscription);
  },

  async getUsageForCurrentPeriod(userId: string) {
    const usage = await this.getIncludedBookingUsage(userId);

    return {
      periodKey: usage.periodKey,
      includedBookingsUsed: usage.used,
      includedBookingsAllowed: usage.allowed,
      includedBookingsRemaining: usage.remaining,
    };
  },
};
