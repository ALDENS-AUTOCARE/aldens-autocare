"use client";

import Link from "next/link";
import { useAuthContext } from "@/components/shared/AuthProvider";
import { Button } from "@/components/shared/Button";

export function Navbar() {
  const { user, logout } = useAuthContext();

  return (
    <header className="border-b border-[--border] bg-black/90 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="text-lg font-bold tracking-wide">
          Alden&apos;s AutoCare
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-300">
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/book">Book</Link>
          {user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
            <Link href="/admin">Admin</Link>
          ) : null}
          {user ? <Link href="/dashboard">Dashboard</Link> : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-neutral-400">{user.fullName}</span>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

