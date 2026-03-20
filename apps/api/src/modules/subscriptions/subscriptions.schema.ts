import { z } from "zod";

export const checkoutSubscriptionSchema = z.object({
  body: z.object({
    planCode: z.enum(["SIGNATURE", "EXECUTIVE", "FLEETCARE"]),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]),
    provider: z.enum(["PAYSTACK", "MTN_MOMO"]),
  }),
});

export const cancelSubscriptionSchema = z.object({
  body: z.object({
    cancelAtPeriodEnd: z.boolean(),
  }),
});

export const upgradeSubscriptionSchema = z.object({
  body: z.object({
    planCode: z.enum(["SIGNATURE", "EXECUTIVE", "FLEETCARE"]),
    billingCycle: z.enum(["MONTHLY", "YEARLY"]),
    provider: z.enum(["PAYSTACK", "MTN_MOMO"]),
  }),
});

// Backward-compatible aliases for existing route imports.
export const subscriptionCheckoutSchema = checkoutSubscriptionSchema;
export const initiateSubscriptionSchema = checkoutSubscriptionSchema;

export const subscriptionReadSchema = z.object({
  params: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  body: z.object({}).strict().optional(),
});

export const cancelSubscriptionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    cancelAtPeriodEnd: z.boolean(),
  }),
});

