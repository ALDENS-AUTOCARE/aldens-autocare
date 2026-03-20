import type {
	PaymentProvider as PaymentProviderCode,
	PaymentStatus,
	PaymentType,
} from "@prisma/client";

export interface PaymentResponse {
	id: string;
	userId: string;
	bookingId: string | null;
	subscriptionId: string | null;
	provider: PaymentProviderCode;
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
	checkoutUrl: string | null;
	reference: string;
	redirectRequired: boolean;
	providerMessage?: string;
}

export interface InitializeProviderPaymentInput {
	email: string;
	phone?: string | null;
	amount: number;
	currency?: string;
	reference: string;
	callbackUrl?: string;
	metadata?: Record<string, unknown>;
}

export interface PaymentInitializationResult {
	checkoutUrl: string | null;
	reference: string;
	redirectRequired: boolean;
	providerMessage?: string;
	raw?: unknown;
}

export interface VerifyResult {
	provider: PaymentProviderCode;
	reference: string;
	verified: boolean;
	status: string;
	paidAt: Date | null;
	raw?: unknown;
}

export interface PaymentProvider {
	initializeBookingPayment(
		input: InitializeProviderPaymentInput,
	): Promise<PaymentInitializationResult>;
	initializeSubscriptionPayment(
		input: InitializeProviderPaymentInput,
	): Promise<PaymentInitializationResult>;
	verifyPayment(reference: string): Promise<VerifyResult>;
	handleWebhook(payload: unknown): Promise<unknown>;
}

export interface PaystackChargeSuccessEvent {
	event: "charge.success";
	data: {
		reference: string;
	};
}

