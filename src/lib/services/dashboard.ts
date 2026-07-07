import type { SupabaseClient } from "@supabase/supabase-js";
import { zonedDateTimeToUtc, todayDateString } from "@/lib/time";

export async function getDashboardStats(db: SupabaseClient, businessId: string, timezone: string) {
  const todayStr = todayDateString(timezone);
  const dayStart = zonedDateTimeToUtc(todayStr, "00:00", timezone);
  const dayEnd = zonedDateTimeToUtc(todayStr, "23:59", timezone);

  const monthStartStr = `${todayStr.slice(0, 7)}-01`;
  const monthStart = zonedDateTimeToUtc(monthStartStr, "00:00", timezone);

  const [todayBookings, newEnquiries, revenueRes, unpaidRes, upcomingRes] = await Promise.all([
    db
      .from("bookings")
      .select("*, service:services(*), customer:customers(*)")
      .eq("business_id", businessId)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", dayStart.toISOString())
      .lte("starts_at", dayEnd.toISOString())
      .order("starts_at"),
    db
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("created_at", dayStart.toISOString()),
    db
      .from("payments")
      .select("amount_cents")
      .eq("business_id", businessId)
      .eq("status", "paid")
      .gte("paid_at", monthStart.toISOString()),
    db
      .from("payments")
      .select("*, booking:bookings(*, customer:customers(*), service:services(*))")
      .eq("business_id", businessId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    db
      .from("bookings")
      .select("*, service:services(*), customer:customers(*)")
      .eq("business_id", businessId)
      .in("status", ["pending", "confirmed"])
      .gt("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(6),
  ]);

  const revenueCents = (revenueRes.data ?? []).reduce((sum, p) => sum + p.amount_cents, 0);

  return {
    todayBookings: todayBookings.data ?? [],
    newEnquiriesCount: newEnquiries.count ?? 0,
    revenueCents,
    unpaidPayments: unpaidRes.data ?? [],
    upcomingBookings: upcomingRes.data ?? [],
  };
}
