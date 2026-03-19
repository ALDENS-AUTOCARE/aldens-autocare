import crypto from "crypto";
import { prisma } from "../../db/prisma";
import { bookingsRepository } from "../bookings/bookings.repository";
import { paymentsRepository } from "./payments.repository";
import { paystackProvider } from "./providers/paystack.provider";

export const paymentsService = {
  async initiateBookingPayment(userId: string, input: {
    bookingId: string;
    paymentType: "BOOKING_DEPOSIT" | "FULL_BOOKING_PAYMENT";
    provider: "PAYSTACK";
  }) {
    const booking = await bookingsRepository.findById(input.bookingId);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.customerId !== userId) {
      throw new Error("Booking not found");
    }

    if (booking.status === "CANCELLED") {
      throw new Error("Cancelled bookings cannot be paid for");
    }

    const amountGhs =
      input.paymentType === "BOOKING_DEPOSIT"
        ? Number(booking.service.basePrice) * 0.3
        : Number(booking.service.basePrice);

    const reference = `AAC_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const payment = await paymentsRepository.create({
      userId,
      bookingId: booking.id,
      provider: "PAYSTACK",
      providerReference: reference,
      amount: amountGhs,
      currency: "GHS",
      paymentType: input.paymentType,
    });

    const initialized = await paystackProvider.initializePayment({
      email: booking.customer.email,
      amount: Math.round(amountGhs * 100),
      reference,
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        userId,
      },
    });

    return {
      payment,
      checkoutUrl: initialized.authorizationUrl,
      accessCode: initialized.accessCode,
      reference: initialized.reference,
    };
  },

  verifyWebhookSignature(rawBody: Buffer, signature?: string) {
    if (!process.env.PAYSTACK_WEBHOOK_SECRET || !signature) {
      return false;
    }

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    return hash === signature;
  },

  async handlePaystackWebhook(event: any) {
    if (event?.event !== "charge.success") {
      return;
    }

    const reference = event?.data?.reference;
    if (!reference) {
      return;
    }

    const payment = await paymentsRepository.findByReference(reference);
    if (!payment) {
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      return;
    }

    await paymentsRepository.markSuccessful(reference, new Date());

    if (payment.bookingId) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: "SUCCESSFUL",
          status:
            payment.booking?.status === "PENDING" || payment.booking?.status === "AWAITING_PAYMENT"
              ? "CONFIRMED"
              : payment.booking?.status,
        },
      });
    }
  },
};

