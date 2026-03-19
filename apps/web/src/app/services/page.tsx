"use client";

import { ServiceCard } from "@/components/services/ServiceCard";
import { Loader } from "@/components/shared/Loader";
import { EmptyState } from "@/components/shared/EmptyState";
import { useServices } from "@/hooks/useServices";

export default function ServicesPage() {
  const { services, loading, error } = useServices();

  return (
    <section className="container-page py-16">
      <h1 className="text-4xl font-bold">Services</h1>
      <p className="mt-3 text-neutral-400">
        Premium detailing packages for private and corporate clients.
      </p>

      <div className="mt-10">
        {loading ? <Loader /> : null}
        {error ? <EmptyState title="Unable to load services" description={error} /> : null}

        {!loading && !error ? (
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

