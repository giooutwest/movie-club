import { SoapLogo } from "@/components/soap-logo";
import { WelcomeForm } from "./welcome-form";

export default function WelcomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black px-4 text-center">
      <SoapLogo size="lg" />
      <div>
        <h1 className="font-[var(--font-display)] text-2xl uppercase tracking-wide text-neutral-100">
          Welcome to the club
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          What should we call you?
        </p>
      </div>
      <WelcomeForm />
    </main>
  );
}
