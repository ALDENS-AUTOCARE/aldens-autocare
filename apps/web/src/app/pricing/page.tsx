"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { usePlans } from "@/hooks/usePlans";
import { useActiveSubscription } from "@/hooks/useActiveSubscription";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { PaymentProvider } from "@/types/plan";
import type { BillingCycle } from "@/types/subscription";

type SubscriptionInitResponse = {
  success: boolean;
  message: string;
  data: {
    checkoutUrl: string | null;
    reference: string;
  };
};

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { plans, loading, error } = usePlans();
  const { subscription, loading: subscriptionLoading, reload } = useActiveSubscription();
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");

  async function startSubscription(input: {
    planCode: "SIGNATURE" | "EXECUTIVE" | "FLEETCARE";
    billingCycle: BillingCycle;
    provider: PaymentProvider;
  }) {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const activePlan = plans.find((plan) => plan.code === input.planCode);
      setBusyPlanId(activePlan?.id ?? null);
      setSubmitError("");

      const res = await api.post<SubscriptionInitResponse>(
        "/subscriptions/checkout",
        input,
        true,
      );

      await reload();

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      alert(`Payment initiated. Reference: ${res.data.reference}`);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setBusyPlanId(null);
    }
  }

  return (
    <section className="container-page py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-[--gold]">Membership Plans</p>
        <h1 className="mt-4 text-4xl font-bold text-white">Choose the plan that matches your vehicle care routine.</h1>
        <p className="mt-4 text-neutral-400">
          All memberships activate only after verified payment. Included bookings are enforced monthly based on your active plan.
        </p>
      </div>

      {subscription ? (
        <div className="mt-8 rounded-3xl border border-[--border] bg-black/20 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Current membership</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">{subscription.plan.name}</h2>
              <p className="mt-2 text-sm text-neutral-300">
                Renewal date: {new Date(subscription.renewalDate).toLocaleDateString()}
              </p>
            </div>
            <p className="text-sm text-neutral-400">
              Status: <span className="text-white">{subscription.status}</span>
            </p>
          </div>
        </div>
      ) : null}

      {submitError ? <p className="mt-6 text-sm text-red-400">{submitError}</p> : null}
      {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}

      {loading || subscriptionLoading ? (
        <div className="mt-10">
          <Loader />
        </div>
      ) : plans.length ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              busy={busyPlanId === plan.id}
              isAuthenticated={Boolean(user)}
              hasActiveSubscription={Boolean(subscription)}
              isCurrentPlan={subscription?.planId === plan.id}
              onSubscribe={startSubscription}
            />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No active plans available"
            description="Membership plans will appear here once they are published."
          />
        </div>
      )}
    </section>
  );
}

