import type { Role, UserStatus } from "@prisma/client";

export interface UserProfile {
	id: string;
	fullName: string;
	email: string;
	phone: string | null;
	role: Role;
	status: UserStatus;
	createdAt: Date;
	updatedAt: Date;
}

