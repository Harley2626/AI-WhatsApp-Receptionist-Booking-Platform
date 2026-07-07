import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyPayFastItn } from "@/lib/services/payfast";
import { sendWhatsAppText } from "@/lib/services/whatsapp";
import { formatCurrency } from "@/lib/utils";

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

  const { data: payment } = await admin
    .from("payments")
    .update({
      status: result.status,
      provider_payment_id: result.providerPaymentId,
      paid_at: result.status === "paid" ? new Date().toISOString() : null,
    })
    .eq("booking_id", result.bookingId)
    .eq("business_id", businessId)
    .select("*, booking:bookings(*, customer:customers(*), service:services(*))")
    .maybeSingle();

  if (result.status === "paid" && payment) {
    const bookingWithRelations = payment.booking as {
      customer?: { whatsapp_phone?: string };
      service?: { name?: string };
    } | null;
    const phone = bookingWithRelations?.customer?.whatsapp_phone;
    const serviceName = bookingWithRelations?.service?.name ?? "your appointment";

    if (phone) {
      sendWhatsAppText(
        businessId,
        phone,
        `Thanks! We've received your ${formatCurrency(payment.amount_cents)} deposit for ${serviceName}. See you soon! ✅`
      ).catch(() => {});
    }
  }

  return new NextResponse("OK", { status: 200 });
}
