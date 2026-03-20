import { prisma } from "../../db/prisma";

export const plansRepository = {
  findAllActive() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });
  },

  findAll() {
    return prisma.plan.findMany({ orderBy: { monthlyPrice: "asc" } });
  },

  findByCode(code: string) {
    return prisma.plan.findUnique({ where: { code } });
  },

  findById(id: string) {
    return prisma.plan.findUnique({ where: { id } });
  },
};
