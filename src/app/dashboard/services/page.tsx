import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { getServices } from "@/lib/services/booking";
import { ServicesManager } from "@/components/services/services-manager";

export default async function DashboardServicesPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();
  const services = await getServices(supabase, business.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Services</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          What Wazzy can book for customers. Turn a service off to hide it temporarily.
        </p>
      </div>
      <ServicesManager services={services} />
    </div>
  );
}
