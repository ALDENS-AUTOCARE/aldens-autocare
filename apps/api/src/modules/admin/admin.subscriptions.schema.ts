import { z } from "zod";

export const adminSubscriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateSubscriptionStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum([
      "ACTIVE",
      "PAST_DUE",
      "SUSPENDED",
      "CANCELLED",
      "EXPIRED",
    ]),
  }),
});