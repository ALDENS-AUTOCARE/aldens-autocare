"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loader } from "@/components/shared/Loader";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useActiveSubscription } from "@/hooks/useActiveSubscription";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { api } from "@/lib/api";

type CancelSubscriptionResponse = {
  success: boolean;
  message: string;
  data: {
    subscription: {
      id: string;
      cancelAtPeriodEnd: boolean;
    };
  };
};

function formatPeriodKey(periodKey: string) {
  const [year, month] = periodKey.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(amount: number | null) {
  if (amount == null) {
    return "Contact us";
  }

  return `GHS ${amount.toLocaleString()}`;
}

export default function DashboardMembershipPage() {
  const { subscription, capabilities, usage, loading: activeLoading, reload: reloadActive } =
    useActiveSubscription();
  const {
    subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
    reload: reloadSubscriptions,
  } = useSubscriptions();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  async function cancelSubscription() {
    if (!subscription || subscription.cancelAtPeriodEnd || cancelLoading) {
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError("");
      await api.post<CancelSubscriptionResponse>(
        "/subscriptions/cancel",
        { cancelAtPeriodEnd: true },
        true,
      );
      await Promise.all([reloadActive(), reloadSubscriptions()]);
    } catch (err) {
      setCancelError((err as Error).message);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <AuthGuard>
      <section className="container-page py-16">
        <DashboardHeader
          title="Membership"
          subtitle="Track your current plan, monthly usage, and subscription history."
        />

        {activeLoading ? (
          <Loader />
        ) : subscription ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[--gold]">Current Plan</p>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{subscription.plan.name}</h2>
                  <p className="mt-2 text-sm text-neutral-300">{subscription.plan.description}</p>
                  <p className="mt-4 text-sm text-neutral-400">
                    Billing cycle: <span className="text-white">{subscription.billingCycle}</span>
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Renewal date: <span className="text-white">{new Date(subscription.renewalDate).toLocaleDateString()}</span>
                  </p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Price: <span className="text-white">{formatCurrency(subscription.billingCycle === "YEARLY" ? subscription.plan.yearlyPrice : subscription.plan.monthlyPrice)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge text={subscription.status} />
                  {subscription.cancelAtPeriodEnd ? <Badge text="CANCELS AT PERIOD END" /> : null}
                  {capabilities.allowsPremiumServices ? <Badge text="PREMIUM ACCESS" /> : null}
                  {capabilities.allowsPriorityBooking ? <Badge text="PRIORITY BOOKING" /> : null}
                  {capabilities.allowsFleetDashboard ? <Badge text="FLEET DASHBOARD" /> : null}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[--border] bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Current period usage</p>
                <p className="mt-2 text-sm text-neutral-400">{formatPeriodKey(usage.periodKey)}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[--border] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Included</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{capabilities.includedBookings}</p>
                  </div>
                  <div className="rounded-2xl border border-[--border] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Used</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{usage.usedIncludedBookings}</p>
                  </div>
                  <div className="rounded-2xl border border-[--border] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Remaining</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{usage.remainingIncludedBookings}</p>
                  </div>
                </div>
              </div>

              {cancelError ? <p className="mt-4 text-sm text-red-400">{cancelError}</p> : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="ghost"
                  disabled={cancelLoading || subscription.cancelAtPeriodEnd}
                  onClick={cancelSubscription}
                >
                  {subscription.cancelAtPeriodEnd
                    ? "Cancellation scheduled"
                    : cancelLoading
                      ? "Scheduling cancellation..."
                      : "Cancel at period end"}
                </Button>
                <Link href="/pricing">
                  <Button variant="secondary">View other plans</Button>
                </Link>
              </div>
            </div>

            <div className="card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[--gold]">Plan Capabilities</p>
              <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                <li>• {capabilities.includedBookings} included booking(s) per month</li>
                <li>• {capabilities.allowsPremiumServices ? "Premium services unlocked" : "Premium services not included"}</li>
                <li>• {capabilities.allowsPriorityBooking ? "Priority booking enabled" : "Standard booking queue"}</li>
                <li>• {capabilities.allowsFleetDashboard ? "Fleet dashboard available" : "Fleet dashboard unavailable"}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="card p-6">
            <EmptyState
              title="No active membership"
              description="Choose a plan to unlock included bookings and premium access."
            />
            <div className="mt-6">
              <Link href="/pricing">
                <Button>Browse plans</Button>
              </Link>
            </div>
          </div>
        )}

        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Subscription History</h2>
              <p className="mt-2 text-sm text-neutral-400">Your past and current membership records.</p>
            </div>
            <Link href="/pricing">
              <Button variant="ghost">Change or start a plan</Button>
            </Link>
          </div>

          {subscriptionsLoading ? (
            <Loader />
          ) : subscriptionsError ? (
            <p className="text-sm text-red-400">{subscriptionsError}</p>
          ) : subscriptions.length ? (
            <div className="space-y-4">
              {subscriptions.map((item) => (
                <article key={item.id} className="card p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.plan.name}</h3>
                      <p className="mt-1 text-sm text-neutral-400">{item.plan.code} • {item.billingCycle}</p>
                      <p className="mt-3 text-sm text-neutral-300">{item.plan.description}</p>
                      <p className="mt-3 text-sm text-neutral-400">
                        Started {new Date(item.startDate).toLocaleDateString()} • Renewal {new Date(item.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <Badge text={item.status} />
                      {item.cancelAtPeriodEnd ? <Badge text="CANCELS AT PERIOD END" /> : null}
                      <Badge text={item.provider} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No subscription history"
              description="Once you start a membership, it will appear here."
            />
          )}
        </div>
      </section>
    </AuthGuard>
  );
}