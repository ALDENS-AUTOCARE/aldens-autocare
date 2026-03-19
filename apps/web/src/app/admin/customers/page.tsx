"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/shared/Badge";
import { api } from "@/lib/api";
import type { PublicUser } from "@/types/user";

type AdminCustomersResponse = {
  success: boolean;
  message: string;
  data: {
    customers: PublicUser[];
  };
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const res = await api.get<AdminCustomersResponse>("/admin/customers", true);
        setCustomers(res.data.customers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, []);

  return (
    <AuthGuard adminOnly>
      <section className="container-page py-16">
        <div className="grid gap-6 md:grid-cols-[240px_1fr]">
          <AdminSidebar />
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="mt-2 text-neutral-400">All registered customers.</p>
            <div className="mt-8">
              {loading ? (
                <Loader />
              ) : error ? (
                <EmptyState title="Failed to load customers" description={error} />
              ) : customers.length === 0 ? (
                <EmptyState title="No customers yet" />
              ) : (
                <div className="card overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-[--border] text-left text-neutral-400">
                      <tr>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-[--border]">
                          <td className="px-4 py-3">{customer.fullName}</td>
                          <td className="px-4 py-3">{customer.email}</td>
                          <td className="px-4 py-3">{customer.phone || "-"}</td>
                          <td className="px-4 py-3">{customer.role}</td>
                          <td className="px-4 py-3">
                            <Badge text={customer.status} />
                          </td>
                          <td className="px-4 py-3">
                            {new Date(customer.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </AuthGuard>
  );
}

