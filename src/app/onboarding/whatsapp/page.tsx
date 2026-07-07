import { getCurrentBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { WhatsAppConnectForm } from "./form";

export default async function WhatsAppStepPage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: integration } = business
    ? await supabase
        .from("integrations")
        .select("*")
        .eq("business_id", business.id)
        .eq("type", "whatsapp")
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Connect WhatsApp</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link your Meta WhatsApp Business number so Yebo can start replying.
        </p>
      </div>
      <WhatsAppConnectForm connected={integration?.status === "connected"} />
    </div>
  );
}
