import { env } from "../../../config/env";
import type {
  InitResult,
  InitializePaymentInput,
  InitializeSubscriptionInput,
  PaymentProvider,
  VerifyResult,
} from "../payments.types";

type MtnConfig = {
  baseUrl: string;
  subscriptionKey: string;
  apiUser: string;
  apiSecret: string;
  targetEnv: string;
  callbackUrl?: string;
};

function getMtnConfig(): MtnConfig {
  if (
    !env.MTN_MOMO_BASE_URL ||
    !env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY ||
    !env.MTN_MOMO_COLLECTION_USER_ID ||
    !env.MTN_MOMO_COLLECTION_API_SECRET ||
    !env.MTN_MOMO_TARGET_ENV
  ) {
    throw new Error("MTN MoMo is not configured");
  }

  return {
    baseUrl: env.MTN_MOMO_BASE_URL,
    subscriptionKey: env.MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY,
    apiUser: env.MTN_MOMO_COLLECTION_USER_ID,
    apiSecret: env.MTN_MOMO_COLLECTION_API_SECRET,
    targetEnv: env.MTN_MOMO_TARGET_ENV,
    callbackUrl: env.MTN_MOMO_CALLBACK_URL,
  };
}

function normalizePhoneNumber(phone?: string | null) {
  if (!phone) {
    throw new Error("A phone number is required for MTN MoMo payments");
  }

  return phone.replace(/[^\d]/g, "");
}

async function getAccessToken(config: MtnConfig) {
  const auth = Buffer.from(`${config.apiUser}:${config.apiSecret}`).toString("base64");
  const response = await fetch(`${config.baseUrl}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "X-Target-Environment": config.targetEnv,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with MTN MoMo");
  }

  const json = await response.json();
  return json.access_token as string;
}

async function initializePayment(
  input: InitializePaymentInput | InitializeSubscriptionInput,
): Promise<InitResult> {
  const config = getMtnConfig();
  const accessToken = await getAccessToken(config);

  const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Reference-Id": input.reference,
      "X-Target-Environment": config.targetEnv,
      "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount.toFixed(2),
      currency: input.currency ?? "GHS",
      externalId: input.reference,
      payer: {
        partyIdType: "MSISDN",
        partyId: normalizePhoneNumber(input.phone),
      },
      payerMessage: "Alden's AutoCare payment",
      payeeNote: "Alden's AutoCare subscription or booking payment",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize MTN MoMo payment");
  }

  return {
    provider: "MTN_MOMO",
    checkoutUrl: config.callbackUrl ?? null,
    accessCode: null,
    reference: input.reference,
  };
}

export const mtnMomoProvider: PaymentProvider = {
  async initializeOneTimePayment(input) {
    return initializePayment(input);
  },

  async initializeSubscriptionPayment(input) {
    return initializePayment(input);
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    const config = getMtnConfig();
    const accessToken = await getAccessToken(config);

    const response = await fetch(`${config.baseUrl}/collection/v1_0/requesttopay/${reference}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Target-Environment": config.targetEnv,
        "Ocp-Apim-Subscription-Key": config.subscriptionKey,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to verify MTN MoMo payment");
    }

    const json = await response.json();
    const status = (json.status as string | undefined) ?? "unknown";

    return {
      provider: "MTN_MOMO",
      reference,
      verified: status === "SUCCESSFUL" || status === "SUCCESS",
      status,
      paidAt: new Date(),
      raw: json,
    };
  },

  async handleWebhook(payload: unknown) {
    if (!payload || typeof payload !== "object") {
      throw new Error("Invalid MTN MoMo webhook payload");
    }
  },
};
