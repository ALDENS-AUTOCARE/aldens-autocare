import { prisma } from "../../db/prisma";
import { BillingCycle, PaymentProvider } from "@prisma/client";

const PLAN_INCLUDE = {
  plan: {
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      monthlyPrice: true,
      yearlyPrice: true,
      includedBookings: true,
      allowsPremiumServices: true,
      allowsPriorityBooking: true,
      allowsFleetDashboard: true,
    },
  },
} as const;

export const subscriptionsRepository = {
  create(input: {
    userId: string;
    planId: string;
    provider: PaymentProvider;
    providerReference: string;
    billingCycle: BillingCycle;
    startDate: Date;
    renewalDate: Date;
  }) {
    return prisma.subscription.create({
      data: {
        userId: input.userId,
        planId: input.planId,
        provider: input.provider,
        providerReference: input.providerReference,
        billingCycle: input.billingCycle,
        startDate: input.startDate,
        renewalDate: input.renewalDate,
        status: "PENDING",
      },
    });
  },

  findManyByUserId(userId: string) {
    return prisma.subscription.findMany({
      where: { userId },
      include: PLAN_INCLUDE,
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
      include: PLAN_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: PLAN_INCLUDE,
    });
  },

  setCancelAtPeriodEnd(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: true },
    });
  },

  activate(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
  },
};
