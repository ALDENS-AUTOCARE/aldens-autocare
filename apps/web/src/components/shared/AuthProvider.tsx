"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PublicUser } from "@/types/user";
import { clearAuthSession, getStoredUser, getToken, setAuthSession } from "@/lib/auth";
import { api } from "@/lib/api";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: PublicUser) => void;
  logout: () => void;
  refreshMe: () => Promise<PublicUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: PublicUser;
  };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = getStoredUser();
    setUser(localUser);
    setLoading(false);
  }, []);

  async function refreshMe() {
    if (!getToken()) return null;
    const res = await api.get<MeResponse>("/auth/me", true);
    setUser(res.data.user);
    return res.data.user;
  }

  function login(token: string, user: PublicUser) {
    setAuthSession(token, user);
    setUser(user);
  }

  function logout() {
    clearAuthSession();
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshMe,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}