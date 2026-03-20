"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Plan } from "@/types/plan";

type PlansResponse = {
  success: boolean;
  message: string;
  data: {
    plans: Plan[];
  };
};

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get<PlansResponse>("/plans");
        setPlans(res.data.plans);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  return { plans, loading, error };
}