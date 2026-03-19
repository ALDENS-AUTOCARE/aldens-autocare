import Link from "next/link";
import { Button } from "@/components/shared/Button";

export default function UnauthorizedPage() {
  return (
    <section className="container-page py-16">
      <div className="card p-8 max-w-xl">
        <h1 className="text-3xl font-bold">Unauthorized</h1>
        <p className="mt-3 text-neutral-400">
          You do not have permission to access this page.
        </p>
        <div className="mt-6">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

