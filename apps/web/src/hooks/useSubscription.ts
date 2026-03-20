"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type {
  Subscription,
  SubscriptionCapabilities,
  SubscriptionUsage,
} from "@/types/subscription";

type SubscriptionResponse = {
  success: boolean;
  message: string;
  data: {
    subscription: Subscription | null;
  };
};

type UsageResponse = {
  success: boolean;
  message: string;
  data: SubscriptionUsage;
};

type CapabilitiesResponse = {
  success: boolean;
  message: string;
  data: {
    capabilities: SubscriptionCapabilities;
  };
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
  const [capabilities, setCapabilities] = useState<SubscriptionCapabilities | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    try {
      setLoading(true);

      const [subRes, usageRes, capRes] = await Promise.all([
        api.get<SubscriptionResponse>("/subscriptions/me", true),
        api.get<UsageResponse>("/subscriptions/usage", true),
        api.get<CapabilitiesResponse>("/subscriptions/capabilities", true),
      ]);

      setSubscription(subRes.data.subscription);
      setUsage(usageRes.data);
      setCapabilities(capRes.data.capabilities);
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return {
    subscription,
    usage,
    capabilities,
    loading,
    error,
    reload: loadAll,
  };
}
