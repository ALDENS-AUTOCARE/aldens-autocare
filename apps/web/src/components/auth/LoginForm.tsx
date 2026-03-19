"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { useAuthContext } from "@/components/shared/AuthProvider";
import { api } from "@/lib/api";
import type { AuthPayload } from "@/types/auth";

type LoginResponse = {
  success: boolean;
  message: string;
  data: AuthPayload;
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });

      login(res.data.token, res.data.user);

      if (res.data.user.role === "ADMIN" || res.data.user.role === "SUPER_ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-md">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Login"}
      </Button>
    </form>
  );
}

