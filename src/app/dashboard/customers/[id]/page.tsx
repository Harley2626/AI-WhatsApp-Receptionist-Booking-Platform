import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireLiveBusiness } from "@/lib/services/business";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingItem } from "@/components/dashboard/booking-item";
import { formatDateTime, initials } from "@/lib/utils";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const business = await requireLiveBusiness();
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!customer) notFound();

  const [{ data: bookings }, { data: conversations }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, service:services(*), customer:customers(*)")
      .eq("customer_id", id)
      .eq("business_id", business.id)
      .order("starts_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("*, messages:messages(*)")
      .eq("customer_id", id)
      .eq("business_id", business.id)
      .order("last_message_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/customers" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
          {initials(customer.name)}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{customer.name || "Unnamed customer"}</h1>
          <p className="text-sm text-muted-foreground">+{customer.whatsapp_phone}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings || bookings.length === 0 ? (
            <EmptyState title="No bookings yet" />
          ) : (
            <div className="divide-y divide-border">
              {bookings.map((b) => (
                <BookingItem key={b.id} booking={b} showDate />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation history</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!conversations || conversations.length === 0 ? (
            <EmptyState icon={MessageCircle} title="No messages yet" />
          ) : (
            conversations.map((conv) => (
              <div key={conv.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={conv.status === "escalated" ? "warning" : conv.status === "closed" ? "default" : "success"}>
                    {conv.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{formatDateTime(conv.last_message_at)}</span>
                </div>
                <div className="space-y-2 rounded-xl bg-muted/50 p-3">
                  {((conv.messages as { id: string; direction: string; body: string; created_at: string }[]) ?? [])
                    .sort((a, b) => a.created_at.localeCompare(b.created_at))
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                          m.direction === "inbound"
                            ? "bg-card text-foreground"
                            : "ml-auto bg-primary/90 text-white"
                        }`}
                      >
                        {m.body}
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
