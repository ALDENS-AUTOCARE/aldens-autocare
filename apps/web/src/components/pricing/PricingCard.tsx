import { Button } from "@/components/shared/Button";
import Link from "next/link";

type Props = {
  title: string;
  price: string;
  features: string[];
};

export function PricingCard({ title, price, features }: Props) {
  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-4 text-3xl font-bold">{price}</p>
      <ul className="mt-6 space-y-3 text-neutral-300">
        {features.map((feature) => (
          <li key={feature}>• {feature}</li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href="/book">
          <Button>Choose Package</Button>
        </Link>
      </div>
    </div>
  );
}

