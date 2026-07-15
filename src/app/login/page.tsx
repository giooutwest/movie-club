import { SoapLogo } from "@/components/soap-logo";
import { SimpleLoginForm } from "./simple-login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 text-center">
      <div className="animate-scale-in">
        <SoapLogo size="lg" />
      </div>
      <div className="w-full max-w-sm animate-fade-up stagger-1">
        <p className="mb-8 text-sm text-neutral-400">
          Enter your email and name to join the club.
        </p>
        <SimpleLoginForm />
      </div>
    </main>
  );
}
