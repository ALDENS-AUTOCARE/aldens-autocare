import type { UpdateProfileInput } from "./users.schema";
import type { UserProfile } from "./users.types";
import { usersRepository } from "./users.repository";

type RepositoryUser = Awaited<ReturnType<typeof usersRepository.findById>>;
type ExistingUser = NonNullable<RepositoryUser>;

function toUserProfile(user: ExistingUser): UserProfile {
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

export const usersService = {
	async getCurrentUserProfile(userId: string): Promise<UserProfile> {
		const user = await usersRepository.findById(userId);
		if (!user) {
			throw new Error("User not found");
		}
		return toUserProfile(user);
	},

	async updateCurrentUserProfile(
		userId: string,
		input: UpdateProfileInput
	): Promise<UserProfile> {
		const existing = await usersRepository.findById(userId);
		if (!existing) {
			throw new Error("User not found");
		}

		const updated = await usersRepository.updateById(userId, {
			fullName: input.fullName,
			phone: input.phone,
		});

		return toUserProfile(updated);
	},
};

