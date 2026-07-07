import { getCurrentBusiness } from "@/lib/services/business";
import { BusinessDetailsForm } from "./form";

export default async function BusinessDetailsPage() {
  const { business } = await getCurrentBusiness();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Tell us about your business</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is what your customers will see when Wazzy replies on WhatsApp.
        </p>
      </div>
      <BusinessDetailsForm defaultValues={business} />
    </div>
  );
}
