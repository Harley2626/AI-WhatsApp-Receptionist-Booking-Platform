"use client";

import { useActionState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveWhatsAppConnection, type ActionResult } from "../actions";

export function WhatsAppConnectForm({ connected }: { connected: boolean }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    saveWhatsAppConnection,
    null
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Where to find these:</p>
          <ol className="list-inside list-decimal space-y-1.5">
            <li>
              Open{" "}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                Meta for Developers <ExternalLink className="h-3 w-3" />
              </a>{" "}
              and select your WhatsApp app.
            </li>
            <li>Go to WhatsApp → API Setup.</li>
            <li>Copy the Phone number ID and a permanent access token.</li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {connected && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> WhatsApp is connected. You can update it below.
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <div>
              <Label htmlFor="phone_number_id">Phone number ID</Label>
              <Input id="phone_number_id" name="phone_number_id" placeholder="1029384756" required />
            </div>
            <div>
              <Label htmlFor="access_token">Access token</Label>
              <Input id="access_token" name="access_token" type="password" placeholder="EAAG..." required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Connecting…" : "Connect & continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
