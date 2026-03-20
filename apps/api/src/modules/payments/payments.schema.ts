import { z } from "zod";

export const initiateBookingPaymentSchema = z.object({
  body: z.object({
    bookingId: z.string().uuid(),
    paymentType: z.enum(["BOOKING_DEPOSIT", "FULL_BOOKING_PAYMENT"]),
    provider: z.enum(["PAYSTACK", "MTN_MOMO"]),
  }),
});

