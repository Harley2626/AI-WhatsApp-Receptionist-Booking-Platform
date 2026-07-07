"use client";

import { useActionState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { savePayFastConnection, skipPaymentsStep, type ActionResult } from "../actions";

export function PayFastConnectForm({ connected }: { connected: boolean }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    savePayFastConnection,
    null
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          {connected && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> PayFast is connected.
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="merchant_id">Merchant ID</Label>
              <Input id="merchant_id" name="merchant_id" placeholder="10000100" required />
            </div>
            <div>
              <Label htmlFor="merchant_key">Merchant key</Label>
              <Input id="merchant_key" name="merchant_key" type="password" placeholder="46f0cd694581a" required />
            </div>
            <div>
              <Label htmlFor="passphrase">Passphrase (optional)</Label>
              <Input id="passphrase" name="passphrase" type="password" />
            </div>
            <p className="text-xs text-muted-foreground">
              Find these in your{" "}
              <a
                href="https://www.payfast.co.za"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                PayFast dashboard <ExternalLink className="h-3 w-3" />
              </a>{" "}
              under Settings → Integration.
            </p>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Connecting…" : "Connect & continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <form action={skipPaymentsStep}>
        <Button type="submit" variant="outline" className="w-full">
          Skip for now
        </Button>
      </form>
    </div>
  );
}
