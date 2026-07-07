import { CalendarDays, ArrowRight } from "lucide-react";
import { getCurrentBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { skipCalendarStep } from "../actions";

export default async function CalendarStepPage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: integration } = business
    ? await supabase
        .from("integrations")
        .select("*")
        .eq("business_id", business.id)
        .eq("type", "google_calendar")
        .maybeSingle()
    : { data: null };

  const connected = integration?.status === "connected";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sync your calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional — bookings will automatically appear on your Google Calendar.
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-teal/10 text-accent-teal">
            <CalendarDays className="h-7 w-7" />
          </div>
          {connected ? (
            <div className="space-y-2">
              <Badge variant="success">Connected</Badge>
              <p className="text-sm text-muted-foreground">
                Your Google Calendar is linked. New bookings will sync automatically.
              </p>
            </div>
          ) : (
            <>
              <p className="max-w-sm text-sm text-muted-foreground">
                Connect Google Calendar so every WhatsApp booking shows up where you already plan your day.
              </p>
              <a href="/api/integrations/google" className={buttonVariants({ className: "w-full max-w-xs" })}>
                Connect Google Calendar
              </a>
            </>
          )}
        </CardContent>
      </Card>
      <form action={skipCalendarStep}>
        <Button type="submit" variant={connected ? "primary" : "outline"} className="w-full">
          {connected ? "Continue" : "Skip for now"} <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
