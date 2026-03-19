"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { useAuthContext } from "@/components/shared/AuthProvider";
import { api } from "@/lib/api";
import type { AuthPayload } from "@/types/auth";

type RegisterResponse = {
  success: boolean;
  message: string;
  data: AuthPayload;
};

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuthContext();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post<RegisterResponse>("/auth/register", form);
      login(res.data.token, res.data.user);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card p-6 space-y-4 max-w-md">
      <Input
        label="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <Input
        label="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}

