import { prisma } from "../../db/prisma";
import { Role, UserStatus } from "@prisma/client";

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  createCustomer(input: {
    fullName: string;
    email: string;
    phone?: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone ?? null,
        passwordHash: input.passwordHash,
        role: Role.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
    });
  },
};

