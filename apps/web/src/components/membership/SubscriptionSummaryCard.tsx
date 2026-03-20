import type { Subscription, SubscriptionCapabilities, SubscriptionUsage } from "@/types/subscription";

type Props = {
  subscription: Subscription | null;
  capabilities: SubscriptionCapabilities | null;
  usage: SubscriptionUsage | null;
};

export function SubscriptionSummaryCard({ subscription, capabilities, usage }: Props) {
  if (!subscription) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold">No active membership</h3>
        <p className="mt-2 text-neutral-400">
          Upgrade to a membership plan for included bookings and premium access.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{subscription.plan.name}</h3>
        <p className="text-neutral-400">{subscription.status}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-neutral-400">Billing Cycle</p>
          <p>{subscription.billingCycle}</p>
        </div>
        <div>
          <p className="text-sm text-neutral-400">Renewal Date</p>
          <p>{new Date(subscription.renewalDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-neutral-400">Included Bookings</p>
          <p>
            {usage?.includedBookingsUsed ?? 0} / {usage?.includedBookingsAllowed ?? 0}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-400">Remaining This Period</p>
          <p>{usage?.includedBookingsRemaining ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-neutral-300">
        <p>Premium services: {capabilities?.allowsPremiumServices ? "Unlocked" : "Locked"}</p>
        <p>Priority booking: {capabilities?.allowsPriorityBooking ? "Enabled" : "Disabled"}</p>
        <p>Fleet dashboard: {capabilities?.allowsFleetDashboard ? "Enabled" : "Disabled"}</p>
      </div>
    </div>
  );
}
