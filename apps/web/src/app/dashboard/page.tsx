"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { Button } from "@/components/shared/Button";
import { Loader } from "@/components/shared/Loader";
import { Badge } from "@/components/shared/Badge";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { BookingList } from "@/components/dashboard/BookingList";
import { useActiveSubscription } from "@/hooks/useActiveSubscription";
import { useBookings } from "@/hooks/useBookings";
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
  const parsed = new Date(Number(year), Number(month) - 1, 1);
  return parsed.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const { bookings, loading } = useBookings();
  const { subscription, capabilities, usage, loading: subscriptionLoading, reload } = useActiveSubscription();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState("");

  async function cancelSubscription() {
    if (!subscription || subscription.cancelAtPeriodEnd || cancelLoading) {
      return;
    }

    try {
      setCancelLoading(true);
      setCancelError("");
      await api.post<CancelSubscriptionResponse>(`/subscriptions/${subscription.id}/cancel`, undefined, true);
      await reload();
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
          title="Dashboard"
          subtitle="Manage your upcoming and recent bookings."
        />

        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/book">
              <Button>New Booking</Button>
            </Link>
            <Link href="/dashboard/membership">
              <Button variant="ghost">Manage Membership</Button>
            </Link>
          </div>
        </div>

        {subscriptionLoading ? null : subscription ? (
          <div className="mb-8 rounded-3xl border border-[--border] bg-black/20 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[--gold]">Membership Active</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">{subscription.plan.name}</h2>
                <p className="mt-2 text-sm text-neutral-300">
                  Renews on {new Date(subscription.renewalDate).toLocaleDateString()} via {subscription.provider}
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  {formatPeriodKey(usage.periodKey)} usage: {usage.usedIncludedBookings} used, {usage.remainingIncludedBookings} remaining.
                </p>
                {subscription.cancelAtPeriodEnd ? (
                  <p className="mt-3 text-sm text-amber-300">
                    This membership is set to cancel at the end of the current billing period.
                  </p>
                ) : null}
                {cancelError ? <p className="mt-3 text-sm text-red-400">{cancelError}</p> : null}
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge text={`${capabilities.includedBookings} included / month`} />
                  <Badge text={`${usage.usedIncludedBookings} used this period`} />
                  {capabilities.allowsPremiumServices ? <Badge text="Premium access" /> : null}
                  {capabilities.allowsPriorityBooking ? <Badge text="Priority booking" /> : null}
                  {capabilities.allowsFleetDashboard ? <Badge text="Fleet dashboard" /> : null}
                </div>
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
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-3xl border border-dashed border-[--border] bg-black/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">No active membership plan</h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Upgrade for included bookings, priority slots, and premium-service access.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="ghost">View Membership Plans</Button>
              </Link>
            </div>
          </div>
        )}

        {loading ? <Loader /> : <BookingList bookings={bookings.slice(0, 3)} />}
      </section>
    </AuthGuard>
  );
}

