import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarCheck,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { PhoneMockup } from "@/components/marketing/phone-mockup";
import { DashboardShowcase } from "@/components/marketing/dashboard-showcase";
import { BrushUnderline } from "@/components/marketing/brush-underline";
import { cn } from "@/lib/utils";

const heroBadges = [
  { icon: MessageCircle, label: "Chat", classes: "border border-brand-green/30 bg-brand-green/25 text-brand-green shadow-sm" },
  { icon: CalendarCheck, label: "Book", classes: "border border-brand-blue/30 bg-brand-blue/25 text-brand-blue shadow-sm" },
  { icon: Wallet, label: "Pay", classes: "border border-brand-yellow/40 bg-brand-yellow/30 text-warning-text shadow-sm" },
  { icon: Bell, label: "Remind", classes: "border border-brand-pink/30 bg-brand-pink/25 text-brand-pink shadow-sm" },
];

const featureCards = [
  {
    icon: MessageCircle,
    title: "Chat",
    description: "Wazzy answers every WhatsApp message instantly — day or night, no waiting around.",
    classes: "border border-brand-green/30 bg-brand-green/25 text-brand-green shadow-sm",
  },
  {
    icon: CalendarCheck,
    title: "Book",
    description: "Customers pick a time and Wazzy books it straight into your calendar automatically.",
    classes: "border border-brand-blue/30 bg-brand-blue/25 text-brand-blue shadow-sm",
  },
  {
    icon: Wallet,
    title: "Pay",
    description: "Payments — in full or as a deposit — are collected on WhatsApp, so you never chase money again.",
    classes: "border border-brand-yellow/40 bg-brand-yellow/30 text-warning-text shadow-sm",
  },
  {
    icon: Bell,
    title: "Remind",
    description: "Automatic reminders mean fewer no-shows and a calendar that actually runs on time.",
    classes: "border border-brand-pink/30 bg-brand-pink/25 text-brand-pink shadow-sm",
  },
];

const howItWorks = [
  { icon: MessageCircle, title: "Customer messages WhatsApp", classes: "border border-brand-green/30 bg-brand-green/25 text-brand-green shadow-sm" },
  { icon: Sparkles, title: "AI replies instantly", classes: "border border-brand-purple/30 bg-brand-purple/25 text-brand-purple shadow-sm" },
  { icon: CalendarCheck, title: "Customer books", classes: "border border-brand-blue/30 bg-brand-blue/25 text-brand-blue shadow-sm" },
  { icon: Wallet, title: "Payment received", classes: "border border-brand-yellow/40 bg-brand-yellow/30 text-warning-text shadow-sm" },
  { icon: Bell, title: "Reminder sent", classes: "border border-brand-pink/30 bg-brand-pink/25 text-brand-pink shadow-sm" },
  { icon: TrendingUp, title: "Business gets paid", classes: "border border-brand-orange/30 bg-brand-orange/25 text-brand-orange shadow-sm" },
];

const benefits = [
  { icon: Clock, title: "Save Time", description: "Stop typing the same answers all day — Wazzy handles it for you.", classes: "bg-brand-blue/10 text-brand-blue" },
  { icon: CalendarCheck, title: "Get More Bookings", description: "Every enquiry gets an instant reply, so fewer leads slip away.", classes: "bg-brand-green/10 text-brand-green" },
  { icon: Bell, title: "Reduce No-Shows", description: "Automatic reminders keep your calendar honest and full.", classes: "bg-brand-pink/10 text-brand-pink" },
  { icon: Wallet, title: "Take Payments", description: "Collect full payments or deposits without lifting a finger.", classes: "bg-brand-yellow/15 text-warning-text" },
  { icon: Zap, title: "Works 24/7", description: "Wazzy never sleeps, never takes a day off, never misses a message.", classes: "bg-brand-purple/10 text-brand-purple" },
  { icon: Store, title: "Built for Small Business", description: "No tech skills needed — if you can use WhatsApp, you can use Wazzy.", classes: "bg-brand-orange/10 text-brand-orange" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Logo size={96} />
          <nav className="hidden items-center gap-8 text-sm font-semibold text-foreground md:flex">
            <Link href="#how-it-works" className="hover:text-brand-green">How it works</Link>
            <Link href="#dashboard" className="hover:text-brand-green">Dashboard</Link>
            <Link href="#pricing" className="hover:text-brand-green">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
          {/* Floating decorations — desktop only, solid flat shapes */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
            <span className="absolute left-[6%] top-[18%] h-4 w-4 rounded-full bg-brand-yellow" />
            <span className="absolute left-[12%] top-[68%] h-3 w-3 rounded-full bg-brand-pink" />
            <span className="absolute left-[46%] top-[8%] h-3 w-3 rounded-full bg-brand-blue" />
            <span className="absolute right-[8%] top-[12%] h-6 w-6 rounded-2xl bg-brand-purple/15" />
            <span className="absolute right-[4%] top-[55%] h-5 w-5 rounded-full bg-brand-green/20" />
            <span className="absolute right-[20%] bottom-[8%] h-4 w-4 rounded-full bg-brand-coral" />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left */}
            <div className="text-center lg:text-left">
              <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-brand-purple/15 px-5 py-2.5 text-base font-bold text-brand-purple sm:text-lg lg:mx-0">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                Your 24/7 AI Receptionist
              </span>

              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Every lead.
                <br />
                Every booking.
                <br />
                <span className="relative inline-block text-brand-pink">
                  Never missed.
                  <BrushUnderline className="absolute -bottom-2 left-0 h-3 w-full" />
                </span>
              </h1>

              <p className="mx-auto mt-7 max-w-lg text-lg text-muted-foreground sm:text-xl lg:mx-0">
                Wazzy talks, books, takes payments and follows up automatically — all through WhatsApp.
                Your customers never need to install a thing.
              </p>

              <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}>
                  Get Started in under 10 minutes
                </Link>
                <Link
                  href="#how-it-works"
                  className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "w-full sm:w-auto")}
                >
                  See how it works
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                {heroBadges.map((b) => (
                  <span
                    key={b.label}
                    className={cn("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold tracking-wide", b.classes)}
                  >
                    <b.icon className="h-4 w-4" strokeWidth={2.5} />
                    {b.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — phone */}
            <div className="relative flex justify-center lg:justify-end">
              <PhoneMockup className="animate-float" />
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="border-t border-border bg-background px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Four jobs. One AI receptionist.
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Wazzy does the busywork so you can focus on running your business.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featureCards.map((f) => (
                <div
                  key={f.title}
                  className="hover-lift rounded-2xl border border-border bg-white p-6 shadow-[0_2px_12px_-4px_rgb(30_41_59_/_0.08)]"
                >
                  <div className={cn("mb-5 flex h-16 w-16 items-center justify-center rounded-2xl", f.classes)}>
                    <f.icon className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard showcase */}
        <section id="dashboard" className="border-t border-border bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-4 py-1.5 text-sm font-bold text-brand-blue">
                For business owners
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                One beautiful dashboard for everything
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Bookings, revenue, conversations and payments — everything you need to know today, at a glance.
              </p>
            </div>
            <div className="mt-12">
              <DashboardShowcase />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border bg-background px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">How it works</h2>
              <p className="mt-3 text-lg text-muted-foreground">From first message to getting paid, fully automatic.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-4">
              {howItWorks.map((step, i) => (
                <div key={step.title} className="relative flex flex-col items-center text-center">
                  {i < howItWorks.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-7 hidden h-5 w-5 text-border lg:block" />
                  )}
                  <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl", step.classes)}>
                    <step.icon className="h-8 w-8" strokeWidth={2.5} />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-subtle-foreground">
                    Step {i + 1}
                  </p>
                  <p className="mt-1 text-sm font-bold text-foreground">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border bg-white px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Why small businesses love Wazzy
              </h2>
            </div>
            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-4">
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", b.classes)}>
                    <b.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{b.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-border bg-background px-5 py-20 sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Simple, honest pricing
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">Once-off setup from R2,500. Cancel anytime.</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { name: "Starter", price: "R399", blurb: "Solo operators getting started", accent: "pink" as const },
                { name: "Growth", price: "R699", blurb: "Most popular for growing teams", accent: "green" as const, featured: true },
                { name: "Pro", price: "R1,499", blurb: "Multiple services, higher volume", accent: "blue" as const },
              ].map((plan) => {
                const accentClasses = {
                  pink: "border-brand-pink ring-2 ring-brand-pink",
                  green: "border-brand-green ring-2 ring-brand-green",
                  blue: "border-brand-blue ring-2 ring-brand-blue",
                }[plan.accent];

                return (
                <div
                  key={plan.name}
                  className={cn(
                    "hover-lift rounded-2xl border bg-white p-7 shadow-[0_2px_12px_-4px_rgb(30_41_59_/_0.08)]",
                    accentClasses
                  )}
                >
                  {plan.featured && (
                    <span className="mb-3 inline-block rounded-full bg-brand-green/10 px-3 py-1 text-xs font-bold text-brand-green">
                      Most popular
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-4xl font-extrabold text-foreground">
                    {plan.price}
                    <span className="text-base font-medium text-muted-foreground">/month</span>
                  </p>
                  <p className="mt-2.5 text-sm text-muted-foreground">{plan.blurb}</p>
                </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border bg-white px-5 py-24 sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green">
              <ShieldCheck className="h-7 w-7" />
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready to hire your first AI Receptionist?
            </h2>
            <p className="max-w-lg text-lg text-muted-foreground">
              Go live on WhatsApp in under 10 minutes. No credit card required to get started.
            </p>
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Start Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">
            <div className="text-center sm:text-left">
              <Logo size={96} />
              <p className="mt-3 max-w-xs text-sm text-muted-foreground">
                Your 24/7 AI Receptionist. Every lead, every booking, never missed.
              </p>
            </div>
            <div className="flex gap-16 text-sm">
              <div className="space-y-2.5">
                <p className="font-bold text-foreground">Product</p>
                <Link href="#how-it-works" className="block text-muted-foreground hover:text-foreground">How it works</Link>
                <Link href="#pricing" className="block text-muted-foreground hover:text-foreground">Pricing</Link>
                <Link href="/login" className="block text-muted-foreground hover:text-foreground">Log in</Link>
              </div>
              <div className="space-y-2.5">
                <p className="font-bold text-foreground">Company</p>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">About</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">Contact</Link>
                <Link href="#" className="block text-muted-foreground hover:text-foreground">Privacy</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Wazzy. Made for SME in South Africa by South Africans.</p>
            <p>Built to feel like you hired a receptionist, not bought software.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
