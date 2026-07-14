import Link from "next/link";
import { SoapLogo } from "@/components/soap-logo";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 text-center">
      <div className="animate-scale-in">
        <SoapLogo size="lg" />
      </div>
      <div className="w-full max-w-sm animate-fade-up stagger-1">
        <p className="mb-8 text-sm text-neutral-400">
          Sign in with your email to join the club.
        </p>
        <LoginForm />
        <Link
          href="/login/returning"
          className="mt-3 block rounded-md border border-neutral-800 px-3 py-2 text-sm font-bold uppercase tracking-wide text-neutral-300 transition-all hover:border-neutral-600 hover:text-neutral-100 active:scale-[0.98]"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
