import { getCurrentBusiness } from "@/lib/services/business";
import { getBusinessHours } from "@/lib/services/booking";
import { createClient } from "@/lib/supabase/server";
import { HoursEditor } from "@/components/hours/hours-editor";

export default async function HoursStepPage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();
  const hours = business ? await getBusinessHours(supabase, business.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">When are you open?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yebo will only offer booking times inside these hours.
        </p>
      </div>
      <HoursEditor initialHours={hours} redirectNext="/onboarding/calendar" />
    </div>
  );
}
