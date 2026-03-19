import { z } from "zod";

export const updateProfileSchema = z
	.object({
		fullName: z.string().trim().min(2, "Full name must be at least 2 characters").optional(),
		phone: z.string().trim().nullable().optional(),
	})
	.refine((data) => data.fullName !== undefined || data.phone !== undefined, {
		message: "At least one field must be provided",
		path: ["fullName"],
	});

export const updateProfileRequestSchema = z.object({
	body: updateProfileSchema,
	query: z.object({}).optional(),
	params: z.object({}).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

