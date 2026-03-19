import { PricingCard } from "@/components/pricing/PricingCard";

export default function PricingPage() {
  const plans = [
    {
      title: "Essential Care",
      price: "From GHS 250",
      features: ["Routine wash", "Tire shine", "Quick refresh"],
    },
    {
      title: "Signature Detail",
      price: "From GHS 700",
      features: ["Interior + exterior", "Wax protection", "Deep clean"],
    },
    {
      title: "Executive Finish",
      price: "From GHS 2000",
      features: ["Paint enhancement", "Premium finish", "Luxury detail"],
    },
  ];

  return (
    <section className="container-page py-16">
      <h1 className="text-4xl font-bold">Pricing</h1>
      <p className="mt-3 text-neutral-400">
        Pricing may vary by vehicle size, condition, and location.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
    </section>
  );
}

