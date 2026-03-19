"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/shared/AuthProvider";

type Props = {
  children: React.ReactNode;
  adminOnly?: boolean;
};

export function AuthGuard({ children, adminOnly = false }: Props) {
  const router = useRouter();
  const { user, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (adminOnly && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      router.replace("/unauthorized");
    }
  }, [user, loading, adminOnly, router]);

  if (loading || !user) {
    return <div className="container-page py-16">Loading...</div>;
  }

  if (adminOnly && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return <div className="container-page py-16">Checking access...</div>;
  }

  return <>{children}</>;
}
