import { env } from "../../../config/env";
import type {
  InitResult,
  InitializePaymentInput,
  InitializeSubscriptionInput,
  PaymentProvider,
  VerifyResult,
} from "../payments.types";

function ensurePaystackConfigured() {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured");
  }
}

async function initializePayment(input: InitializePaymentInput | InitializeSubscriptionInput): Promise<InitResult> {
  ensurePaystackConfigured();

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize Paystack payment");
  }

  const json = await response.json();

  return {
    provider: "PAYSTACK",
    checkoutUrl: json.data.authorization_url as string,
    accessCode: json.data.access_code as string,
    reference: json.data.reference as string,
    raw: json,
  };
}

export const paystackProvider: PaymentProvider = {
  async initializeOneTimePayment(input) {
    return initializePayment(input);
  },

  async initializeSubscriptionPayment(input) {
    return initializePayment(input);
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


