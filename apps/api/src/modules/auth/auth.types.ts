import type { Role, UserStatus } from "@prisma/client";

export interface RegisterBody {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

