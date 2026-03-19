import { prisma } from "../../db/prisma";

export const usersRepository = {
	findById(id: string) {
		return prisma.user.findUnique({ where: { id } });
	},

	updateById(id: string, data: { fullName?: string; phone?: string | null }) {
		return prisma.user.update({
			where: { id },
			data,
		});
	},
};

