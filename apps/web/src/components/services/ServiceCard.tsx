import { Button } from "@/components/shared/Button";
import type { Service } from "@/types/service";
import Link from "next/link";

type Props = {
  service: Service;
};

export function ServiceCard({ service }: Props) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold">{service.name}</h3>
      <p className="mt-2 text-neutral-400">{service.description}</p>
      <p className="mt-4 text-sm text-neutral-300">From GHS {service.basePrice}</p>
      <p className="mt-1 text-sm text-neutral-500">{service.durationMinutes} minutes</p>
      <div className="mt-6">
        <Link href="/book">
          <Button>Book Service</Button>
        </Link>
      </div>
    </div>
  );
}

