import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime, initials } from "@/lib/utils";
import type { Booking, Customer, Service } from "@/types/database";

type BookingWithRelations = Booking & { service?: Service | null; customer?: Customer | null };

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "default" | "teal"> = {
  confirmed: "success",
  pending: "warning",
  cancelled: "destructive",
  completed: "teal",
  no_show: "default",
};

export function BookingItem({ booking, showDate = false }: { booking: BookingWithRelations; showDate?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
        {initials(booking.customer?.name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{booking.customer?.name || booking.customer?.whatsapp_phone || "Customer"}</p>
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
