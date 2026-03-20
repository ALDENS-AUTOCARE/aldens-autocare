import { prisma } from "../../db/prisma";

type AdminManagedSubscriptionStatus =
  | "ACTIVE"
  | "PAST_DUE"
  | "SUSPENDED"
  | "CANCELLED"
  | "EXPIRED";

export const adminSubscriptionsService = {
  async getSubscriptions() {
    return prisma.subscription.findMany({
      include: {
        plan: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async updateSubscriptionStatus(id: string, status: AdminManagedSubscriptionStatus) {
    const existing = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Subscription not found");
    }

    return prisma.subscription.update({
      where: { id },
      data: { status },
      include: {
        plan: true,
        user: true,
      },
    });
  },
};