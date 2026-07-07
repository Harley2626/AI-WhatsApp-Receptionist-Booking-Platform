import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { OnboardingStepNav } from "@/components/onboarding/step-nav";
import { ensureProfileAndBusiness } from "@/lib/services/business";
import { signOut } from "@/lib/actions/auth";

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  await ensureProfileAndBusiness();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/">
            <Logo />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </form>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <OnboardingStepNav />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
