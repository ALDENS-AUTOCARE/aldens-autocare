import Link from "next/link";
import { Button } from "@/components/shared/Button";

export function CTASection() {
  return (
    <section className="container-page py-16">
      <div className="card p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold">Ready to schedule your detail?</h2>
          <p className="mt-2 text-neutral-400">
            Book in minutes and let us come to you.
          </p>
        </div>
        <Link href="/book">
          <Button>Book Now</Button>
        </Link>
      </div>
    </section>
  );
}

