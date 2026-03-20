import { prisma } from "../../db/prisma";
import { PaymentProvider, PaymentStatus, PaymentType } from "@prisma/client";

export const paymentsRepository = {
	create(input: {
		userId: string;
		bookingId: string;
		provider: PaymentProvider;
		providerReference: string;
		amount: number;
		currency: string;
		paymentType: PaymentType;
	}) {
		return prisma.payment.create({
			data: {
				userId: input.userId,
				bookingId: input.bookingId,
				provider: input.provider,
				providerReference: input.providerReference,
				amount: input.amount,
				currency: input.currency,
				paymentType: input.paymentType,
				status: PaymentStatus.PENDING,
			},
		});
	},

	createSubscriptionPayment(input: {
		userId: string;
		subscriptionId: string;
		provider: PaymentProvider;
		providerReference: string;
		amount: number;
		currency: string;
		paymentType: PaymentType;
	}) {
		return prisma.payment.create({
			data: {
				userId: input.userId,
				subscriptionId: input.subscriptionId,
				provider: input.provider,
				providerReference: input.providerReference,
				amount: input.amount,
				currency: input.currency,
				paymentType: input.paymentType,
				status: PaymentStatus.PENDING,
			},
		});
	},

	findByReference(reference: string) {
		return prisma.payment.findUnique({
			where: { providerReference: reference },
			include: { booking: true, user: true, subscription: true },
		});
	},

	markSuccessful(reference: string, paidAt: Date) {
		return prisma.payment.update({
			where: { providerReference: reference },
			data: {
				status: "SUCCESSFUL",
				paidAt,
			},
		});
	},
};

