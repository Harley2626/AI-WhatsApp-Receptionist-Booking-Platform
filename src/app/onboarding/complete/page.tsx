import { PartyPopper, Check } from "lucide-react";
import { getCurrentBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { getServices, getBusinessHours } from "@/lib/services/booking";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { goLive } from "../actions";

export default async function OnboardingCompletePage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();

  const [services, hours, integrationsRes] = await Promise.all([
    business ? getServices(supabase, business.id) : Promise.resolve([]),
    business ? getBusinessHours(supabase, business.id) : Promise.resolve([]),
    business
      ? supabase.from("integrations").select("type, status").eq("business_id", business.id)
      : Promise.resolve({ data: [] }),
  ]);

  const integrations = integrationsRes.data ?? [];
  const isConnected = (type: string) => integrations.some((i) => i.type === type && i.status === "connected");

  const checklist = [
    { label: `Business details — ${business?.name || "not set"}`, done: !!business?.name },
    { label: `${services.length} service${services.length === 1 ? "" : "s"} added`, done: services.length > 0 },
    { label: `Business hours set for ${hours.filter((h) => h.is_open).length} day(s)`, done: hours.length > 0 },
    { label: "WhatsApp connected", done: isConnected("whatsapp") },
    { label: "Google Calendar connected (optional)", done: isConnected("google_calendar"), optional: true },
    { label: "PayFast connected (optional)", done: isConnected("payfast"), optional: true },
  ];

  const readyToLaunch = checklist.filter((c) => !c.optional).every((c) => c.done);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">You're almost live</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Double-check everything below, then flip the switch.
        </p>
      </div>

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  item.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-foreground">{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {!readyToLaunch && (
        <p className="text-center text-sm text-warning">
          Finish the required steps above before going live.
        </p>
      )}

      <form action={goLive}>
        <Button type="submit" className="w-full" size="lg" disabled={!readyToLaunch}>
          Go live 🎉
        </Button>
      </form>
    </div>
  );
}
