"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Service } from "@/types/service";

type ServicesResponse = {
  success: boolean;
  message: string;
  data: {
    services: Service[];
  };
};

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const res = await api.get<ServicesResponse>("/services");
        setServices(res.data.services);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return { services, loading, error };
}

