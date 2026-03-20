import { env } from "../../../config/env";
import type {
  InitializeProviderPaymentInput,
  PaymentInitializationResult,
  PaymentProvider,
  VerifyResult,
} from "../payments.types";

type PaystackInitializeInput = {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
};

type PaystackInitializeResult = {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
};

function ensurePaystackConfigured() {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured");
  }
}

async function initializePaymentRequest(
  input: PaystackInitializeInput,
): Promise<PaystackInitializeResult> {
  ensurePaystackConfigured();

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amount * 100),
      email: input.email,
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize Paystack payment");
  }

  const json = await response.json();

  return {
    authorizationUrl: json.data.authorization_url as string,
    accessCode: json.data.access_code as string,
    reference: json.data.reference as string,
  };
}

function toProviderInput(input: InitializeProviderPaymentInput): PaystackInitializeInput {
  return {
    email: input.email,
    amount: input.amount,
    reference: input.reference,
    callback_url: input.callbackUrl,
    metadata: input.metadata,
  };
}

function toPaymentInitializationResult(
  initialized: PaystackInitializeResult,
): PaymentInitializationResult {
  return {
    checkoutUrl: initialized.authorizationUrl,
    reference: initialized.reference,
    redirectRequired: true,
    providerMessage: "Redirect user to Paystack checkout",
  };
}

type PaystackProvider = PaymentProvider & {
  initializePayment(input: PaystackInitializeInput): Promise<PaystackInitializeResult>;
};

export const paystackProvider: PaystackProvider = {
  async initializePayment(input) {
    return initializePaymentRequest(input);
  },

  async initializeBookingPayment(input) {
    const initialized = await initializePaymentRequest(toProviderInput(input));
    return toPaymentInitializationResult(initialized);
  },

  async initializeSubscriptionPayment(input) {
    const initialized = await initializePaymentRequest(toProviderInput(input));
    return toPaymentInitializationResult(initialized);
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    ensurePaystackConfigured();

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to verify Paystack payment");
    }

    const json = await response.json();
    const verified = Boolean(json.status) && json.data?.status === "success";

    return {
      provider: "PAYSTACK",
      reference,
      verified,
      status: (json.data?.status as string | undefined) ?? "unknown",
      paidAt: json.data?.paid_at ? new Date(json.data.paid_at as string) : null,
      raw: json,
    };
  },

  async handleWebhook(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid Paystack webhook payload");
    }
  },
};


