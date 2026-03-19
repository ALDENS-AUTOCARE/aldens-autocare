import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <section className="container-page py-16">
      <h1 className="text-4xl font-bold">Login</h1>
      <p className="mt-3 text-neutral-400">Access your account and bookings.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </section>
  );
}

