import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayFastItn } from "@/lib/services/payfast";
import { sendWhatsAppText } from "@/lib/services/whatsapp";
import { confirmBookingAfterPayment } from "@/lib/services/booking";
import { getOrCreateOpenConversation, appendMessage } from "@/lib/services/conversations";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("business");
  if (!businessId) return new NextResponse("Missing business", { status: 400 });

  const formData = await request.formData();
  const fields: Record<string, string> = {};
  formData.forEach((value, key) => {
    fields[key] = String(value);
  });

  const result = await verifyPayFastItn(businessId, fields);
  if (!result.valid || !result.bookingId) {
    console.error("Invalid PayFast ITN signature", { businessId, fields });
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("payments")
    .select("*, booking:bookings(*, customer:customers(*), service:services(*))")
    .eq("booking_id", result.bookingId)
    .eq("business_id", businessId)
    .maybeSingle();

  if (!existing) {
    console.error("PayFast ITN for unknown payment", { businessId, bookingId: result.bookingId });
    return new NextResponse("Payment not found", { status: 404 });
  }

  // PayFast retries ITNs until it gets 200 — never re-run side effects for an already-paid payment.
  if (existing.status === "paid") {
    return new NextResponse("OK", { status: 200 });
  }

  if (result.status !== "paid") {
    await admin
      .from("payments")
      .update({
        status: result.status,
        provider_payment_id: result.providerPaymentId,
      })
      .eq("id", existing.id);
    return new NextResponse("OK", { status: 200 });
  }

  // First successful payment only: transition pending → paid.
  const { data: payment } = await admin
    .from("payments")
    .update({
      status: "paid",
      provider_payment_id: result.providerPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("status", "pending")
    .select("*, booking:bookings(*, customer:customers(*), service:services(*))")
    .maybeSingle();

  if (!payment) {
    return new NextResponse("OK", { status: 200 });
  }

  const bookingWithRelations = payment.booking as {
    id?: string;
    starts_at?: string;
    customer?: { id?: string; whatsapp_phone?: string };
    service?: { name?: string };
  } | null;
  const phone = bookingWithRelations?.customer?.whatsapp_phone;
  const customerId = bookingWithRelations?.customer?.id;
  const serviceName = bookingWithRelations?.service?.name ?? "your appointment";

  if (bookingWithRelations?.id) {
    await confirmBookingAfterPayment(admin, { bookingId: bookingWithRelations.id, businessId }).catch(() => null);
  }

  if (phone) {
    const when = bookingWithRelations?.starts_at
      ? ` on ${formatDate(bookingWithRelations.starts_at)} at ${formatTime(bookingWithRelations.starts_at)}`
      : "";
    const text = `Thanks! We've received your ${formatCurrency(payment.amount_cents)} payment for ${serviceName}. Your booking${when} is confirmed. See you soon! ✅`;

    sendWhatsAppText(businessId, phone, text).catch(() => {});

    if (customerId) {
      getOrCreateOpenConversation(admin, businessId, customerId)
        .then((conversation) =>
          appendMessage(admin, { conversationId: conversation.id, businessId, direction: "outbound", body: text })
        )
        .catch(() => {});
    }
  }

  return new NextResponse("OK", { status: 200 });
}
