import { z } from "zod";
import { hashPassword, comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { authRepository } from "./auth.repository";
import { registerSchema, loginSchema } from "./auth.schema";
import type { AuthUser } from "./auth.types";

type RegisterInput = z.infer<typeof registerSchema>["body"];
type LoginInput = z.infer<typeof loginSchema>["body"];
type RepositoryUser = Awaited<ReturnType<typeof authRepository.findById>>;
type ExistingUser = NonNullable<RepositoryUser>;

function toAuthUser(user: ExistingUser): AuthUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email);

    if (existing) {
      throw new Error("Email already exists");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await authRepository.createCustomer({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
    });

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: toAuthUser(user), token };
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("Account is suspended");
    }

    const isValid = await comparePassword(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: toAuthUser(user), token };
  },

  async me(userId: string): Promise<AuthUser> {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return toAuthUser(user);
  },
};

