import { z } from "zod";

export const serviceSlugParamsSchema = z.object({
	slug: z
		.string()
		.trim()
		.min(2, "Service slug must be at least 2 characters")
		.max(120, "Service slug must not exceed 120 characters"),
});

export const serviceSlugRequestSchema = z.object({
	params: serviceSlugParamsSchema,
	body: z.object({}).optional(),
	query: z.object({}).optional(),
});

