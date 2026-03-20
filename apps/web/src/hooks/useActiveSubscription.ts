"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { ActiveSubscriptionPayload } from "@/types/subscription";
import type { PlanCapabilities } from "@/types/plan";
import type { IncludedBookingUsage } from "@/types/subscription";

type ActiveSubscriptionResponse = {
  success: boolean;
  message: string;
  data: ActiveSubscriptionPayload;
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
      const res = await api.get<ActiveSubscriptionResponse>("/subscriptions/my/active", true);
      setSubscription(res.data.subscription);
      setCapabilities(res.data.capabilities);
      setUsage(res.data.usage);
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