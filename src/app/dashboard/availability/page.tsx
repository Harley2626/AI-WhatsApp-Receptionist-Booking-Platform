import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { getBusinessHours } from "@/lib/services/booking";
import { HoursEditor } from "@/components/hours/hours-editor";

export default async function AvailabilityPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();
  const hours = await getBusinessHours(supabase, business.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
        <p className="mt-1 text-sm text-muted-foreground">Yebo only offers booking times inside these hours.</p>
      </div>
      <HoursEditor initialHours={hours} />
    </div>
  );
}
