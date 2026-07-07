import Link from "next/link";
import { CalendarCheck, MessageSquarePlus, Wallet, AlertCircle } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { getDashboardStats } from "@/lib/services/dashboard";
import { StatCard } from "@/components/dashboard/stat-card";
import { BookingItem } from "@/components/dashboard/booking-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardHomePage() {
  const business = await requireLiveBusiness();
  const supabase = await createClient();
  const stats = await getDashboardStats(supabase, business.id, business.timezone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Good day 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&rsquo;s what&rsquo;s happening at {business.name} today.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CalendarCheck} label="Today's bookings" value={stats.todayBookings.length} tone="primary" />
        <StatCard icon={MessageSquarePlus} label="New enquiries" value={stats.newEnquiriesCount} />
        <StatCard icon={Wallet} label="Deposits this month" value={formatCurrency(stats.revenueCents)} tone="primary" />
        <StatCard icon={AlertCircle} label="Unpaid deposits" value={stats.unpaidPayments.length} tone={stats.unpaidPayments.length > 0 ? "warning" : "default"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&rsquo;s bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.todayBookings.length === 0 ? (
              <EmptyState title="Nothing booked for today" description="New WhatsApp bookings will show up here." />
            ) : (
              <div className="divide-y divide-border">
                {stats.todayBookings.map((b) => (
                  <BookingItem key={b.id} booking={b} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingBookings.length === 0 ? (
              <EmptyState title="No upcoming bookings" />
            ) : (
              <div className="divide-y divide-border">
                {stats.upcomingBookings.map((b) => (
                  <BookingItem key={b.id} booking={b} showDate />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.unpaidPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unpaid deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {stats.unpaidPayments.map((p) => {
                const booking = p.booking as { customer?: { name?: string | null }; service?: { name?: string } } | null;
                return (
                  <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{booking?.customer?.name ?? "Customer"}</p>
                      <p className="text-muted-foreground">{booking?.service?.name}</p>
                    </div>
                    <span className="font-medium text-warning">{formatCurrency(p.amount_cents)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Link href="/dashboard/settings" className="block text-center text-sm text-muted-foreground hover:text-foreground">
        Manage services, hours, and integrations →
      </Link>
    </div>
  );
}
