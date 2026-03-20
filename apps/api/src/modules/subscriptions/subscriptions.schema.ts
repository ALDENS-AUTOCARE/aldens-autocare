import { z } from "zod";

export const planCodeSchema = z.enum(["SIGNATURE", "EXECUTIVE", "FLEETCARE"]);
export const billingCycleSchema = z.enum(["MONTHLY", "YEARLY"]);
export const providerSchema = z.enum(["PAYSTACK", "MTN_MOMO"]);

export const subscriptionReadSchema = z.object({
  params: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  body: z.object({}).strict().optional(),
});

export const subscriptionCheckoutSchema = z.object({
  body: z.object({
    planCode: planCodeSchema,
    billingCycle: billingCycleSchema,
    provider: providerSchema,
  }),
});

export const initiateSubscriptionSchema = subscriptionCheckoutSchema;

export const cancelSubscriptionSchema = z.object({
  params: z.object({}).strict().optional(),
  query: z.object({}).strict().optional(),
  body: z.object({
    cancelAtPeriodEnd: z.boolean(),
  }),
});

export const cancelSubscriptionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    cancelAtPeriodEnd: z.boolean(),
  }),
});

export const upgradeSubscriptionSchema = z.object({
  body: z.object({
    planCode: planCodeSchema,
    billingCycle: billingCycleSchema,
    provider: providerSchema,
  }),
});

