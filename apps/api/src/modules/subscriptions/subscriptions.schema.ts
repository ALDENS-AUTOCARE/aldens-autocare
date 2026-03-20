import { z } from "zod";

export const initiateSubscriptionSchema = z.object({
  body: z.object({
    planId: z.string().uuid(),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]),
    provider: z.enum(["PAYSTACK", "MTN_MOMO"]),
  }),
});

export const subscriptionIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
