"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import type { BillingCycle, PaymentProvider, Plan } from "@/types/plan";

type Props = {
  plan: Plan;
  busy?: boolean;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  isCurrentPlan: boolean;
  onSubscribe: (input: {
    planId: string;
    billingCycle: BillingCycle;
    provider: PaymentProvider;
  }) => Promise<void>;
};

function currencyLabel(amount: number | null) {
  if (amount == null) {
    return "Contact us";
  }

  return `GHS ${amount.toLocaleString()}`;
}

export default function SubscriptionCard({
  plan,
  busy = false,
  isAuthenticated,
  hasActiveSubscription,
  isCurrentPlan,
  onSubscribe,
}: Props) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("MONTHLY");
  const [provider, setProvider] = useState<PaymentProvider>("PAYSTACK");

  const features = [
    `${plan.includedBookings} included booking${plan.includedBookings === 1 ? "" : "s"} per month`,
    plan.allowsPriorityBooking ? "Priority booking access" : "Standard booking queue",
    plan.allowsPremiumServices ? "Premium services unlocked" : "Premium services excluded",
    plan.allowsFleetDashboard ? "Fleet dashboard included" : "No fleet dashboard",
  ];

  const displayPrice = billingCycle === "YEARLY" ? plan.yearlyPrice : plan.monthlyPrice;
  const billingUnavailable = billingCycle === "YEARLY" && plan.yearlyPrice == null;
  const subscribeDisabled = busy || isCurrentPlan || (hasActiveSubscription && !isCurrentPlan);

  return (
    <article className="card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[--gold]">{plan.code}</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{plan.name}</h3>
        </div>
        {isCurrentPlan ? <Badge text="ACTIVE" /> : null}
      </div>

      <p className="mt-4 text-sm leading-6 text-neutral-300">{plan.description}</p>

      <div className="mt-6 flex items-end justify-between gap-4 rounded-2xl border border-[--border] bg-black/20 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{billingCycle}</p>
          <p className="mt-2 text-3xl font-bold text-white">{currencyLabel(displayPrice)}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${billingCycle === "MONTHLY" ? "bg-[--gold] text-black" : "border border-[--border] text-neutral-300"}`}
            onClick={() => setBillingCycle("MONTHLY")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${billingCycle === "YEARLY" ? "bg-[--gold] text-black" : "border border-[--border] text-neutral-300"}`}
            onClick={() => setBillingCycle("YEARLY")}
            disabled={plan.yearlyPrice == null}
          >
            Yearly
          </button>
        </div>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-neutral-300">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>

      <label className="mt-6 block space-y-2">
        <span className="text-sm text-neutral-300">Payment provider</span>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value as PaymentProvider)}
          className="w-full rounded-xl border border-[--border] bg-[--card] px-4 py-3 text-white outline-none focus:border-[--gold]"
        >
          <option value="PAYSTACK">Paystack</option>
          <option value="MTN_MOMO">MTN MoMo</option>
        </select>
      </label>

      {billingUnavailable ? (
        <p className="mt-3 text-sm text-amber-300">Yearly billing is not available for this plan.</p>
      ) : null}

      <div className="mt-6 flex-1" />

      {!isAuthenticated ? (
        <Link href="/login" className="mt-4 block">
          <Button className="w-full">Login to subscribe</Button>
        </Link>
      ) : (
        <Button
          className="mt-4 w-full"
          disabled={subscribeDisabled || billingUnavailable}
          onClick={() => onSubscribe({ planId: plan.id, billingCycle, provider })}
        >
          {busy
            ? "Initializing checkout..."
            : isCurrentPlan
              ? "Current plan"
              : hasActiveSubscription
                ? "Active plan already exists"
                : "Start membership"}
        </Button>
      )}
    </article>
  );
}

