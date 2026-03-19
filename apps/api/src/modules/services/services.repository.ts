import { prisma } from "../../db/prisma";

export const servicesRepository = {
  findAllActive() {
    return prisma.service.findMany({
      where: { isActive: true },
      orderBy: { basePrice: "asc" },
    });
  },

  findBySlug(slug: string) {
    return prisma.service.findUnique({
      where: { slug },
    });
  },

  findById(id: string) {
    return prisma.service.findUnique({
      where: { id },
    });
  },
};

