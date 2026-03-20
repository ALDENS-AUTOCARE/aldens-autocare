import { prisma } from "../../db/prisma";
import {
  BillingCycle,
  PaymentProvider,
  SubscriptionStatus,
} from "@prisma/client";

const SUBSCRIPTION_INCLUDE = { plan: true } as const;

export const subscriptionsRepository = {
  findLatestForUser(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId },
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  findActiveForUser(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  findActiveByUserId(userId: string) {
    const now = new Date();

    return prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        startDate: { lte: now },
        renewalDate: { gte: now },
      },
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  create(input: {
    userId: string;
    planId: string;
    provider: PaymentProvider;
    providerReference?: string;
    billingCycle: BillingCycle;
    startDate: Date;
    renewalDate: Date;
    status?: SubscriptionStatus;
  }) {
    return prisma.subscription.create({
      data: {
        userId: input.userId,
        planId: input.planId,
        provider: input.provider,
        providerReference: input.providerReference ?? null,
        billingCycle: input.billingCycle,
        startDate: input.startDate,
        renewalDate: input.renewalDate,
        status: input.status ?? "PENDING",
      },
      include: SUBSCRIPTION_INCLUDE,
    });
  },

  findManyByUserId(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  findPendingByUserId(userId: string) {
    return prisma.subscription.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
      include: SUBSCRIPTION_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  async findCurrentByUserId(userId: string) {
    const active = await this.findActiveByUserId(userId);
    if (active) {
      return active;
    }

    return this.findPendingByUserId(userId);
  },

  findById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: SUBSCRIPTION_INCLUDE,
    });
  },

  updateCancelAtPeriodEnd(id: string, cancelAtPeriodEnd: boolean) {
    return prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd },
      include: SUBSCRIPTION_INCLUDE,
    });
  },

  updateStatusAndCancelFlag(id: string, status: SubscriptionStatus, cancelAtPeriodEnd: boolean) {
    return prisma.subscription.update({
      where: { id },
      data: {
        status,
        cancelAtPeriodEnd,
      },
      include: SUBSCRIPTION_INCLUDE,
    });
  },

  updateStatus(id: string, status: SubscriptionStatus) {
    return prisma.subscription.update({
      where: { id },
      data: { status },
      include: SUBSCRIPTION_INCLUDE,
    });
  },

  findByReference(reference: string) {
    return prisma.subscription.findFirst({
      where: { providerReference: reference },
      include: { plan: true, user: true },
    });
  },

  // Backward-compatible aliases used by existing service logic.
  setCancelAtPeriodEnd(id: string) {
    return this.updateCancelAtPeriodEnd(id, true);
  },

  activate(id: string) {
    return this.updateStatus(id, "ACTIVE");
  },

  updateStatusById(id: string, status: SubscriptionStatus) {
    return this.updateStatus(id, status);
  },
};
