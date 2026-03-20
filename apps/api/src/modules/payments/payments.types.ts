import type {
	PaymentProvider as PaymentProviderCode,
	PaymentStatus,
	PaymentType,
} from "@prisma/client";

export interface PaymentResponse {
	id: string;
	userId: string;
	bookingId: string | null;
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
	accessCode: string | null;
	reference: string;
}

export interface InitializePaymentInput {
	email: string;
	phone?: string | null;
	amount: number;
	currency?: string;
	reference: string;
	callbackUrl?: string;
	metadata?: Record<string, unknown>;
}

export interface InitializeSubscriptionInput extends InitializePaymentInput {}

export interface InitResult {
	provider: PaymentProviderCode;
	checkoutUrl: string | null;
	accessCode: string | null;
	reference: string;
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
	initializeOneTimePayment(input: InitializePaymentInput): Promise<InitResult>;
	initializeSubscriptionPayment(input: InitializeSubscriptionInput): Promise<InitResult>;
	verifyPayment(reference: string): Promise<VerifyResult>;
	handleWebhook(payload: unknown): Promise<void>;
}

export interface PaystackChargeSuccessEvent {
	event: "charge.success";
	data: {
		reference: string;
	};
}

