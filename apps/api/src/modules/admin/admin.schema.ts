import { z } from "zod";
export {
  adminSubscriptionIdParamSchema,
  updateSubscriptionStatusSchema,
} from "./admin.subscriptions.schema";

export const adminBookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum([
      "AWAITING_PAYMENT",
      "CONFIRMED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
    ]),
  }),
});
