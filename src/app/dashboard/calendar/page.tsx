import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { addDaysToDateString, todayDateString, zonedDateTimeToUtc } from "@/lib/time";
import { formatDate } from "@/lib/utils";
import { BookingItem } from "@/components/dashboard/booking-item";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const business = await requireLiveBusiness();
  const { date } = await searchParams;
  const dateStr = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayDateString(business.timezone);

  const supabase = await createClient();
  const dayStart = zonedDateTimeToUtc(dateStr, "00:00", business.timezone);
  const dayEnd = zonedDateTimeToUtc(dateStr, "23:59", business.timezone);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, service:services(*), customer:customers(*)")
    .eq("business_id", business.id)
    .neq("status", "cancelled")
    .gte("starts_at", dayStart.toISOString())
    .lte("starts_at", dayEnd.toISOString())
    .order("starts_at");

  const prevDate = addDaysToDateString(dateStr, -1, business.timezone);
  const nextDate = addDaysToDateString(dateStr, 1, business.timezone);
  const isToday = dateStr === todayDateString(business.timezone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        {!isToday && (
          <Link href="/dashboard/calendar" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Today
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Link href={`/dashboard/calendar?date=${prevDate}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <p className="text-center font-medium text-foreground">
          {isToday ? "Today, " : ""}
          {formatDate(dayStart.toISOString())}
        </p>
        <Link href={`/dashboard/calendar?date=${nextDate}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!bookings || bookings.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No bookings on this day" />
          ) : (
            <div className="divide-y divide-border">
              {bookings.map((b) => (
                <BookingItem key={b.id} booking={b} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
