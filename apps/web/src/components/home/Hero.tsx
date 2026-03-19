import Link from "next/link";
import { Button } from "@/components/shared/Button";

export function Hero() {
  return (
    <section className="container-page py-20">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-[--gold]">Premium Mobile Detailing</p>
        <h1 className="mt-4 text-4xl sm:text-6xl font-bold leading-tight">
          Mobile auto care for Tema and Accra.
        </h1>
        <p className="mt-6 text-lg text-neutral-300">
          Alden&apos;s AutoCare delivers premium detailing directly to your home,
          office, or fleet location.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/book">
            <Button>Book Your Service</Button>
          </Link>
          <Link href="/services">
            <Button variant="ghost">View Services</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

