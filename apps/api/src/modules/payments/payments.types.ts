import type {
	PaymentProvider,
	PaymentStatus,
	PaymentType,
} from "@prisma/client";

export interface PaymentResponse {
	id: string;
	userId: string;
	bookingId: string | null;
	provider: PaymentProvider;
	providerReference: string | null;
	amount: number;
	currency: string;
	status: PaymentStatus;
	paymentType: PaymentType;
	paidAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface InitiateBookingPaymentResponse {
	payment: PaymentResponse;
	checkoutUrl: string;
	accessCode: string;
	reference: string;
}

export interface PaystackChargeSuccessEvent {
	event: "charge.success";
	data: {
		reference: string;
	};
}

