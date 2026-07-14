import Link from "next/link";
import { SoapLogo } from "@/components/soap-logo";
import { EmailOtpForm } from "../email-otp-form";

export default function ReturningLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 text-center">
      <div className="animate-scale-in">
        <SoapLogo size="lg" />
      </div>
      <div className="w-full max-w-sm animate-fade-up stagger-1">
        <h1 className="mb-1 font-[var(--font-display)] text-xl uppercase tracking-wide text-neutral-100">
          Welcome back
        </h1>
        <p className="mb-8 text-sm text-neutral-400">
          Enter your email and we&apos;ll send you a link straight back into
          your account.
        </p>
        <EmailOtpForm ctaLabel="Log in" />
        <Link
          href="/login"
          className="mt-3 block text-sm text-neutral-500 transition-colors hover:text-neutral-300"
        >
          New to the club? Join here
        </Link>
      </div>
    </main>
  );
}
