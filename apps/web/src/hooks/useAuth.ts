"use client";

import { useAuthContext } from "@/components/shared/AuthProvider";

export function useAuth() {
  return useAuthContext();
}

