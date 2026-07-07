import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { CustomerList } from "@/components/customers/customer-list";

export default async function CustomersPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*, bookings:bookings(count)")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone who has messaged you on WhatsApp.</p>
      </div>
      <CustomerList
        customers={(customers ?? []).map((c) => ({
          ...c,
          bookingCount: (c.bookings as { count: number }[] | null)?.[0]?.count ?? 0,
        }))}
      />
    </div>
  );
}
