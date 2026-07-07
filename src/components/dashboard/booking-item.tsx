import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, initials } from "@/lib/utils";
import type { Booking, Customer, Service } from "@/types/database";

type BookingWithRelations = Booking & { service?: Service | null; customer?: Customer | null };

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "default" | "info"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "destructive",
  completed: "info",
  no_show: "default",
};

export function BookingItem({ booking, showDate = false }: { booking: BookingWithRelations; showDate?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 py-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-green/15 to-brand-blue/15 text-sm font-semibold text-primary">
        {initials(booking.customer?.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{booking.customer?.name || booking.customer?.whatsapp_phone || "Customer"}</p>
        <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
          <User className="h-3 w-3 shrink-0" />
          {booking.service?.name ?? "Service"}
          <span aria-hidden>·</span>
          <Clock className="h-3 w-3 shrink-0" />
          {showDate ? `${formatDate(booking.starts_at)}, ` : ""}
          {formatTime(booking.starts_at)}
        </p>
      </div>
      <Badge variant={STATUS_VARIANT[booking.status] ?? "default"}>{booking.status.replace("_", " ")}</Badge>
    </div>
  );
}
