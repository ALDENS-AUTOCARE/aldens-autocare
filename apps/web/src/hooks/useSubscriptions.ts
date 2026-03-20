"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Subscription } from "@/types/subscription";

type SubscriptionsResponse = {
  success: boolean;
  message: string;
  data: {
    subscriptions: Subscription[];
  };
};

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!getToken()) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get<SubscriptionsResponse>("/subscriptions/my", true);
      setSubscriptions(res.data.subscriptions);
    } catch (err) {
      setError((err as Error).message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { subscriptions, loading, error, reload };
}