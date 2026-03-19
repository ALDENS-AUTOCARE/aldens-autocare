import Link from "next/link";

export function AdminSidebar() {
  return (
    <aside className="card p-4 space-y-3">
      <Link href="/admin" className="block text-sm text-neutral-300">Overview</Link>
      <Link href="/admin/bookings" className="block text-sm text-neutral-300">Bookings</Link>
    </aside>
  );
}

