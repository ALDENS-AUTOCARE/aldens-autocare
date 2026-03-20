import { PaymentProvider as PaymentProviderCode } from "@prisma/client";
import { mtnMomoProvider } from "./mtn-momo.provider";
import { paystackProvider } from "./paystack.provider";
import type { PaymentProvider } from "../payments.types";

const providers: Record<PaymentProviderCode, PaymentProvider> = {
  PAYSTACK: paystackProvider,
  MTN_MOMO: mtnMomoProvider,
};

export function getPaymentProvider(provider: PaymentProviderCode) {
  return providers[provider];
}