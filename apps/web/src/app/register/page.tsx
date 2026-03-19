import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <section className="container-page py-16">
      <h1 className="text-4xl font-bold">Create Account</h1>
      <p className="mt-3 text-neutral-400">Book and manage your detailing services.</p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </section>
  );
}

