import { getCurrentBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { PayFastConnectForm } from "./form";

export default async function PaymentsStepPage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();
  const { data: integration } = business
    ? await supabase
        .from("integrations")
        .select("*")
        .eq("business_id", business.id)
        .eq("type", "payfast")
        .maybeSingle()
    : { data: null };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Collect payments (optional)</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect PayFast so Wazzy can send a secure payment link — full payment or a deposit, your choice per
          service — for services that need one.
        </p>
      </div>
      <PayFastConnectForm connected={integration?.status === "connected"} />
    </div>
  );
}
