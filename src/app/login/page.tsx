"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { sendMagicLink, type SendMagicLinkResult } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [state, formAction, pending] = useActionState<SendMagicLinkResult | null, FormData>(
    sendMagicLink,
    null
  );

  if (state?.ok) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold">Check your inbox</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            We sent you a magic link. Open it on this device to sign in — no password needed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@yourbusiness.co.za"
              required
              autoFocus
            />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Sending link…" : "Send me a magic link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-8 bg-background px-4 py-16">
      <Link href="/">
        <Logo className="scale-110" />
      </Link>
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your bookings, no password required.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to receive booking-related emails from Yebo.
        </p>
      </div>
    </div>
  );
}
