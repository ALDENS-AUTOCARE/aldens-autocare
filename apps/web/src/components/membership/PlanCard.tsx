"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { api } from "@/lib/api";
import type { Plan } from "@/types/plan";
import type { Subscription } from "@/types/subscription";

type Props = {
  plan: Plan;
  currentSubscription: Subscription | null;
  onChanged?: () => void;
};

type CheckoutResponse = {
  success: boolean;
  message: string;
  data: {
    checkoutUrl: string | null;
    reference: string;
    providerMessage?: string;
  };
};

export function PlanCard({ plan, currentSubscription, onChanged }: Props) {
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [loading, setLoading] = useState(false);

  const isCurrent = currentSubscription?.plan.code === plan.code;

  async function startCheckout() {
    try {
      setLoading(true);

      const endpoint = currentSubscription ? "/subscriptions/upgrade" : "/subscriptions/checkout";

      const res = await api.post<CheckoutResponse>(
        endpoint,
        {
          planCode: plan.code,
          billingCycle,
          provider: "PAYSTACK",
        },
        true
      );

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      alert(res.data.providerMessage || "Payment initialized");
      await onChanged?.();
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold">{plan.name}</h3>
      <p className="mt-2 text-neutral-400">{plan.description}</p>

      <div className="mt-4 space-y-1 text-sm text-neutral-300">
        <p>Included bookings: {plan.includedBookings}</p>
        <p>Premium services: {plan.allowsPremiumServices ? "Yes" : "No"}</p>
        <p>Priority booking: {plan.allowsPriorityBooking ? "Yes" : "No"}</p>
        <p>Fleet dashboard: {plan.allowsFleetDashboard ? "Yes" : "No"}</p>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className={`rounded-xl px-3 py-2 text-sm ${
            billingCycle === "MONTHLY" ? "bg-[--gold] text-black" : "border border-[--border]"
          }`}
          onClick={() => setBillingCycle("MONTHLY")}
        >
          Monthly
        </button>

        {plan.yearlyPrice ? (
          <button
            type="button"
            className={`rounded-xl px-3 py-2 text-sm ${
              billingCycle === "YEARLY" ? "bg-[--gold] text-black" : "border border-[--border]"
            }`}
            onClick={() => setBillingCycle("YEARLY")}
          >
            Yearly
          </button>
        ) : null}
      </div>

      <p className="mt-6 text-3xl font-bold">
        GHS {billingCycle === "MONTHLY" ? plan.monthlyPrice : plan.yearlyPrice ?? plan.monthlyPrice}
      </p>

      <div className="mt-6">
        <Button onClick={startCheckout} disabled={loading || isCurrent} className="w-full">
          {isCurrent
            ? "Current Plan"
            : loading
            ? "Processing..."
            : currentSubscription
            ? "Upgrade Plan"
            : "Choose Plan"}
        </Button>
      </div>
    </div>
  );
}
