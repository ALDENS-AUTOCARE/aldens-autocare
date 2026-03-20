"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ActiveSubscriptionPayload } from "@/types/subscription";
import type { PlanCapabilities } from "@/types/plan";
import type { IncludedBookingUsage, SubscriptionUsageDto } from "@/types/subscription";

type SubscriptionMeResponse = {
  success: boolean;
  message: string;
  data: {
    subscription: ActiveSubscriptionPayload["subscription"];
  };
};

type SubscriptionCapabilitiesResponse = {
  success: boolean;
  message: string;
  data: {
    capabilities: PlanCapabilities;
  };
};

type SubscriptionUsageResponse = {
  success: boolean;
  message: string;
  data: SubscriptionUsageDto;
};

const EMPTY_CAPABILITIES: PlanCapabilities = {
  includedBookings: 0,
  allowsPremiumServices: false,
  allowsPriorityBooking: false,
  allowsFleetDashboard: false,
};

const EMPTY_USAGE: IncludedBookingUsage = {
  periodKey: new Date().toISOString().slice(0, 7),
  usedIncludedBookings: 0,
  remainingIncludedBookings: 0,
};

export function useActiveSubscription() {
  const [subscription, setSubscription] = useState<ActiveSubscriptionPayload["subscription"]>(null);
  const [capabilities, setCapabilities] = useState<PlanCapabilities>(EMPTY_CAPABILITIES);
  const [usage, setUsage] = useState<IncludedBookingUsage>(EMPTY_USAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!getToken()) {
      setSubscription(null);
      setCapabilities(EMPTY_CAPABILITIES);
      setUsage(EMPTY_USAGE);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [subscriptionRes, capabilitiesRes, usageRes] = await Promise.all([
        api.get<SubscriptionMeResponse>("/subscriptions/me", true),
        api.get<SubscriptionCapabilitiesResponse>("/subscriptions/capabilities", true),
        api.get<SubscriptionUsageResponse>("/subscriptions/usage", true),
      ]);

      setSubscription(subscriptionRes.data.subscription);
      setCapabilities(capabilitiesRes.data.capabilities);
      setUsage({
        periodKey: usageRes.data.periodKey,
        usedIncludedBookings: usageRes.data.includedBookingsUsed,
        remainingIncludedBookings: usageRes.data.includedBookingsRemaining,
      });
    } catch (err) {
      setError((err as Error).message);
      setSubscription(null);
      setCapabilities(EMPTY_CAPABILITIES);
      setUsage(EMPTY_USAGE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { subscription, capabilities, usage, loading, error, reload };
}