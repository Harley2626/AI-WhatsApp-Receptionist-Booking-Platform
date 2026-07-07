import { Wallet } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency, formatDateTime, initials } from "@/lib/utils";

const STATUS_VARIANT = {
  paid: "success",
  pending: "warning",
  failed: "destructive",
  cancelled: "default",
} as const;

export default async function PaymentsPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("*, booking:bookings(*, customer:customers(*), service:services(*))")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Payments collected through Wazzy via PayFast.</p>
      </div>

      {!payments || payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments yet"
          description="Payment links Wazzy sends to customers will show up here once PayFast is connected."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {payments.map((p) => {
              const booking = p.booking as { customer?: { name?: string | null }; service?: { name?: string } } | null;
              return (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {initials(booking?.customer?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{booking?.customer?.name ?? "Customer"}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {booking?.service?.name} · {formatDateTime(p.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">{formatCurrency(p.amount_cents)}</p>
                    <Badge variant={STATUS_VARIANT[p.status as keyof typeof STATUS_VARIANT] ?? "default"}>
                      {p.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
