"use client";

import { useActionState, useState } from "react";
import { CalendarDays, MessageCircle, Wallet, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveWhatsAppConnection, savePayFastConnection, disconnectIntegration } from "@/app/dashboard/settings/actions";
import type { ActionResult } from "@/app/onboarding/actions";
import type { IntegrationType } from "@/types/database";

interface IntegrationsPanelProps {
  whatsappConnected: boolean;
  googleConnected: boolean;
  payfastConnected: boolean;
}

function StatusBadge({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge variant="success">
      <CheckCircle2 className="h-3 w-3" /> Connected
    </Badge>
  ) : (
    <Badge>Not connected</Badge>
  );
}

function WhatsAppCard({ connected }: { connected: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(saveWhatsAppConnection, null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" /> WhatsApp
        </CardTitle>
        <StatusBadge connected={connected} />
      </CardHeader>
      <CardContent>
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            {connected ? "Update credentials" : "Connect WhatsApp"}
          </Button>
        ) : (
          <form action={formAction} className="space-y-3">
            <div>
              <Label htmlFor="phone_number_id">Phone number ID</Label>
              <Input id="phone_number_id" name="phone_number_id" required />
            </div>
            <div>
              <Label htmlFor="access_token">Access token</Label>
              <Input id="access_token" name="access_token" type="password" required />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state?.ok && <p className="text-sm text-primary">Connected ✓</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function PayFastCard({ connected }: { connected: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(savePayFastConnection, null);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" /> PayFast
        </CardTitle>
        <StatusBadge connected={connected} />
      </CardHeader>
      <CardContent className="space-y-3">
        {!editing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              {connected ? "Update credentials" : "Connect PayFast"}
            </Button>
            {connected && (
              <Button variant="ghost" size="sm" onClick={() => disconnectIntegration("payfast" as IntegrationType)}>
                Disconnect
              </Button>
            )}
          </div>
        ) : (
          <form action={formAction} className="space-y-3">
            <div>
              <Label htmlFor="merchant_id">Merchant ID</Label>
              <Input id="merchant_id" name="merchant_id" required />
            </div>
            <div>
              <Label htmlFor="merchant_key">Merchant key</Label>
              <Input id="merchant_key" name="merchant_key" type="password" required />
            </div>
            <div>
              <Label htmlFor="passphrase">Passphrase (optional)</Label>
              <Input id="passphrase" name="passphrase" type="password" />
            </div>
            {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
            {state?.ok && <p className="text-sm text-primary">Connected ✓</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function GoogleCalendarCard({ connected }: { connected: boolean }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" /> Google Calendar
        </CardTitle>
        <StatusBadge connected={connected} />
      </CardHeader>
      <CardContent className="flex gap-2">
        <a href="/api/integrations/google" className="text-sm font-medium text-primary underline">
          {connected ? "Reconnect" : "Connect Google Calendar"}
        </a>
        {connected && (
          <Button variant="ghost" size="sm" onClick={() => disconnectIntegration("google_calendar" as IntegrationType)}>
            Disconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function IntegrationsPanel({ whatsappConnected, googleConnected, payfastConnected }: IntegrationsPanelProps) {
  return (
    <div className="space-y-4">
      <WhatsAppCard connected={whatsappConnected} />
      <GoogleCalendarCard connected={googleConnected} />
      <PayFastCard connected={payfastConnected} />
    </div>
  );
}
