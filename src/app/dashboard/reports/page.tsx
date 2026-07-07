import { BarChart3, CalendarCheck, Repeat, TrendingUp, Wallet } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { daysAgoIso } from "@/lib/time";

export default async function ReportsPage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();

  const thirtyDaysAgo = daysAgoIso(30);

  const [bookingsRes, conversationsRes, revenueRes, customersRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, status", { count: "exact" })
      .eq("business_id", business.id)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("payments")
      .select("amount_cents")
      .eq("business_id", business.id)
      .eq("status", "paid")
      .gte("paid_at", thirtyDaysAgo),
    supabase.from("customers").select("id, bookings:bookings(count)").eq("business_id", business.id),
  ]);

  const totalBookings = bookingsRes.count ?? 0;
  const cancelledBookings = (bookingsRes.data ?? []).filter((b) => b.status === "cancelled").length;
  const totalConversations = conversationsRes.count ?? 0;
  const conversionRate = totalConversations > 0 ? Math.round((totalBookings / totalConversations) * 100) : 0;
  const revenueCents = (revenueRes.data ?? []).reduce((sum, p) => sum + p.amount_cents, 0);
  const repeatCustomers = (customersRes.data ?? []).filter(
    (c) => ((c.bookings as { count: number }[] | null)?.[0]?.count ?? 0) > 1
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last 30 days at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Bookings" value={totalBookings} tone="primary" />
        <StatCard icon={TrendingUp} label="Booking conversion" value={`${conversionRate}%`} />
        <StatCard icon={Wallet} label="Deposits collected" value={formatCurrency(revenueCents)} tone="primary" />
        <StatCard icon={Repeat} label="Repeat customers" value={repeatCustomers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Yebo handled <strong className="text-foreground">{totalConversations}</strong> conversation
            {totalConversations === 1 ? "" : "s"} and turned them into{" "}
            <strong className="text-foreground">{totalBookings}</strong> booking{totalBookings === 1 ? "" : "s"} in
            the last 30 days.
          </p>
          <p>
            <strong className="text-foreground">{cancelledBookings}</strong> booking{cancelledBookings === 1 ? "" : "s"} were
            cancelled in that time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
