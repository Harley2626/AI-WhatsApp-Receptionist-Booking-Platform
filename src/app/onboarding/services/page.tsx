import { getCurrentBusiness } from "@/lib/services/business";
import { getServices } from "@/lib/services/booking";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "@/components/services/services-manager";
import { completeServicesStep } from "../actions";
import { Button } from "@/components/ui/button";

export default async function ServicesStepPage() {
  const { business } = await getCurrentBusiness();
  const supabase = await createClient();
  const services = business ? await getServices(supabase, business.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">What do you offer?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add the services customers can book. You can always add more later.
        </p>
      </div>
      <ServicesManager services={services} />
      <form action={completeServicesStep}>
        <Button type="submit" className="w-full" disabled={services.length === 0}>
          Continue
        </Button>
      </form>
    </div>
  );
}
