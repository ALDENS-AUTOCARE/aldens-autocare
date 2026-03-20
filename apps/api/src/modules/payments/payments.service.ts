import crypto from "crypto";
import { PaymentProvider as PaymentProviderCode } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { bookingsRepository } from "../bookings/bookings.repository";
import { paymentsRepository } from "./payments.repository";
import { getPaymentProvider } from "./providers";

function createReference(prefix: string) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function getRequiredPhone(provider: PaymentProviderCode, phone?: string | null) {
  if (provider === "MTN_MOMO" && !phone) {
    throw new Error("A phone number is required for MTN MoMo payments");
  }

  return phone ?? null;
}

function extractWebhookReference(provider: PaymentProviderCode, payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (provider === "PAYSTACK") {
    const data = record.data;
    if (!data || typeof data !== "object") {
      return null;
    }

    return typeof (data as Record<string, unknown>).reference === "string"
      ? ((data as Record<string, unknown>).reference as string)
      : null;
  }

  if (typeof record.reference === "string") {
    return record.reference;
  }

  if (typeof record.referenceId === "string") {
    return record.referenceId;
  }

  if (typeof record.externalId === "string") {
    return record.externalId;
  }

  return null;
}

export const paymentsService = {
  async initiateBookingPayment(userId: string, input: {
    bookingId: string;
    paymentType: "BOOKING_DEPOSIT" | "FULL_BOOKING_PAYMENT";
    provider: PaymentProviderCode;
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

    if (booking.bookingFundingType === "SUBSCRIPTION_INCLUDED") {
      throw new Error("Included member bookings do not require payment");
    }

    if (booking.paymentStatus === "SUCCESSFUL") {
      throw new Error("Booking has already been paid for");
    }

    const amountGhs =
      input.paymentType === "BOOKING_DEPOSIT"
        ? Number(booking.service.basePrice) * 0.3
        : Number(booking.service.basePrice);

    const provider = getPaymentProvider(input.provider);
    const reference = createReference("AAC");

    const payment = await paymentsRepository.create({
      userId,
      bookingId: booking.id,
      provider: input.provider,
      providerReference: reference,
      amount: amountGhs,
      currency: "GHS",
      paymentType: input.paymentType,
    });

    const initialized = await provider.initializeBookingPayment({
      email: booking.customer.email,
      phone: getRequiredPhone(input.provider, booking.customer.phone),
      amount: amountGhs,
      currency: "GHS",
      reference,
      callbackUrl: `${env.WEB_APP_URL}/dashboard/bookings`,
      metadata: {
        bookingId: booking.id,
        paymentId: payment.id,
        userId,
        provider: input.provider,
      },
    });

    return {
      payment,
      checkoutUrl: initialized.checkoutUrl,
      reference: initialized.reference,
      redirectRequired: initialized.redirectRequired,
      providerMessage: initialized.providerMessage,
    };
  },

  async handleProviderWebhook(providerCode: PaymentProviderCode, payload: unknown) {
    const provider = getPaymentProvider(providerCode);
    await provider.handleWebhook(payload);

    const reference = extractWebhookReference(providerCode, payload);
    if (!reference) {
      return;
    }

    const payment = await paymentsRepository.findByReference(reference);
    if (!payment || payment.provider !== providerCode) {
      return;
    }

    if (payment.status === "SUCCESSFUL") {
      return;
    }

    const verification = await provider.verifyPayment(reference);
    if (!verification.verified) {
      return;
    }

    await paymentsRepository.markSuccessful(reference, verification.paidAt ?? new Date());

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

    if (payment.subscriptionId) {
      await prisma.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "ACTIVE" },
      });
    }
  },
};

