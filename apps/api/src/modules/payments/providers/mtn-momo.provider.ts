import type {
  InitializeProviderPaymentInput,
  PaymentInitializationResult,
  PaymentProvider,
  VerifyResult,
} from "../payments.types";

type MtnMomoInitializeInput = {
  reference: string;
  amount: number;
  phoneNumber: string;
  description?: string;
};

function toInitializeInput(input: InitializeProviderPaymentInput): MtnMomoInitializeInput {
  if (!input.phone) {
    throw new Error("A phone number is required for MTN MoMo payments");
  }

  return {
    reference: input.reference,
    amount: input.amount,
    phoneNumber: input.phone,
  };
}

type MtnMomoProvider = PaymentProvider & {
  initializePayment(input: MtnMomoInitializeInput): Promise<PaymentInitializationResult>;
};

export const mtnMomoProvider: MtnMomoProvider = {
  async initializePayment(input) {
    void input.amount;
    void input.phoneNumber;
    void input.description;

    // Phase 2 skeleton only.
    // Replace with real MTN MoMo API call later.
    return {
      reference: input.reference,
      checkoutUrl: null,
      redirectRequired: false,
      providerMessage: "Approval request sent to customer mobile device",
    };
  },

  async initializeBookingPayment(input) {
    return this.initializePayment(toInitializeInput(input));
  },

  async initializeSubscriptionPayment(input) {
    return this.initializePayment(toInitializeInput(input));
  },

  async verifyPayment(reference: string): Promise<VerifyResult> {
    return {
      provider: "MTN_MOMO",
      reference,
      verified: false,
      status: "PENDING",
      paidAt: null,
    };
  },

  async handleWebhook(payload: unknown) {
    return payload;
  },
};
