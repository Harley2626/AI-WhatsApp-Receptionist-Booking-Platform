import Link from "next/link";
import {
  CalendarCheck,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: MessageCircle,
    title: "Customer messages you",
    description: "No app to download. They just WhatsApp your business like they already do.",
  },
  {
    icon: Sparkles,
    title: "Yebo replies instantly",
    description: "Answers FAQs, checks real availability, and never makes up information.",
  },
  {
    icon: CalendarCheck,
    title: "Booking confirmed",
    description: "Deposit collected if needed, confirmation sent, reminder sent before the visit.",
  },
];

const businesses = [
  "Hair salons",
  "Barbers",
  "Beauty salons",
  "Dentists",
  "Physiotherapists",
  "Mechanics",
  "Electricians",
  "Plumbers",
  "Tutors",
  "Pet groomers",
  "Tour operators",
  "Consultants",
];

const plans = [
  { name: "Starter", price: "R399", blurb: "Solo operators getting started" },
  { name: "Growth", price: "R699", blurb: "Most popular for growing teams", featured: true },
  { name: "Pro", price: "R1,499", blurb: "Multiple services, higher volume" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/login" className={buttonVariants({ size: "sm" })}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
          <span className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Built for South African service businesses
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Never miss another customer enquiry on WhatsApp
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
            Yebo is your AI receptionist. It answers, books, and collects deposits on WhatsApp —
            so your customers get instant replies and you get your time back.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className={buttonVariants({ size: "lg" })}>
              Set up in under 10 minutes
            </Link>
            <Link href="#how-it-works" className={buttonVariants({ size: "lg", variant: "outline" })}>
              See how it works
            </Link>
          </div>
        </section>

        {/* Chat mockup */}
        <section className="mx-auto max-w-md px-4 pb-16 sm:px-6">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 bg-dark-teal px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <MessageCircle className="h-4.5 w-4.5" />
              </span>
              <div>
                <p className="text-sm font-medium">Yebo · Radiant Hair Studio</p>
                <p className="text-xs text-white/70">online</p>
              </div>
            </div>
            <CardContent className="space-y-2 bg-[#e5ded5] py-4">
              <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-sm text-foreground shadow-sm">
                Hi! Do you have anything open for a haircut tomorrow afternoon?
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/90 px-3.5 py-2 text-sm text-white shadow-sm">
                Hi Thabo 👋 Yes! I have 14:00 or 15:30 tomorrow with Lindiwe. Which works for you?
              </div>
              <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2 text-sm text-foreground shadow-sm">
                15:30 please
              </div>
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/90 px-3.5 py-2 text-sm text-white shadow-sm">
                Booked ✅ Haircut with Lindiwe, tomorrow at 15:30. A R50 deposit secures your spot:
                pay.link/xyz
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border bg-card/50 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
              How it works
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, i) => (
                <Card key={step.title}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">Step {i + 1}</p>
                    <h3 className="mt-1 font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-2 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">For your customers</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {["No app to download", "Instant, friendly replies", "Book in seconds, right from WhatsApp"].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {item}
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">For your business</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Fewer missed leads, more bookings",
                  "Deposits collected automatically",
                  "Less admin, lower staffing costs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Target businesses */}
        <section className="border-t border-border bg-card/50 py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Made for appointment-based businesses
            </h2>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {businesses.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold text-foreground sm:text-3xl">
              Simple, honest pricing
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Once-off setup from R2,500. Cancel anytime.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.featured ? "border-primary ring-1 ring-primary" : ""}>
                  <CardContent className="pt-6">
                    {plan.featured && (
                      <span className="mb-3 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Most popular
                      </span>
                    )}
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-3xl font-semibold text-foreground">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.blurb}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-dark-teal py-16 text-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <Clock className="h-8 w-8" />
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Go live on WhatsApp in under 10 minutes
            </h2>
            <Link
              href="/login"
              className={cn(buttonVariants({ size: "lg" }), "bg-white text-dark-teal hover:bg-white/90")}
            >
              Get started free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-sm text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
          <Logo iconOnly={false} />
          <p>© {new Date().getFullYear()} Yebo. Made for South African businesses.</p>
        </div>
      </footer>
    </div>
  );
}
