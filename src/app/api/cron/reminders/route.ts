import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/services/whatsapp";
import { getOrCreateOpenConversation, appendMessage } from "@/lib/services/conversations";
import { expireUnpaidBooking } from "@/lib/services/booking";
import { deleteCalendarEvent } from "@/lib/services/calendar";
import { formatDate, formatTime } from "@/lib/utils";
import type { Business, Customer, Service } from "@/types/database";

export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured — allow (dev convenience)
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return new NextResponse("Unauthorized", { status: 401 });

  const admin = createAdminClient();
  const { data: jobs, error } = await admin
    .from("scheduled_jobs")
    .select("*, booking:bookings(*, customer:customers(*), service:services(*), business:businesses(*))")
    .is("sent_at", null)
    .lte("run_at", new Date().toISOString())
    .limit(50);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  let sent = 0;
  for (const job of jobs ?? []) {
    const booking = job.booking as {
      id: string;
      status: string;
      starts_at: string;
      google_event_id: string | null;
      customer?: Customer;
      service?: Service;
      business?: Business;
    } | null;

    if (!booking || !booking.business || !booking.customer) {
      await admin.from("scheduled_jobs").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
      continue;
    }

    if (job.type === "payment_expiry") {
      if (booking.status !== "pending") {
        // Already paid (confirmed) or already cancelled — nothing to release.
        await admin.from("scheduled_jobs").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
        continue;
      }
      try {
        const expired = await expireUnpaidBooking(admin, { bookingId: booking.id, businessId: booking.business.id });
        if (expired && booking.google_event_id) {
          deleteCalendarEvent(booking.business.id, booking.google_event_id).catch(() => {});
        }
        if (expired) {
          const text = `Hi ${booking.customer.name ?? "there"}, your hold for ${booking.service?.name ?? "your appointment"} has expired because payment wasn't completed in time. Message us anytime to book again!`;
          await sendWhatsAppText(booking.business.id, booking.customer.whatsapp_phone, text);
          const conversation = await getOrCreateOpenConversation(admin, booking.business.id, booking.customer.id);
          await appendMessage(admin, {
            conversationId: conversation.id,
            businessId: booking.business.id,
            direction: "outbound",
            body: text,
          });
          sent++;
        }
      } catch (expireError) {
        console.error(`Failed to expire unpaid booking ${booking.id}`, expireError);
        continue; // leave sent_at null so it retries next run
      }
      await admin.from("scheduled_jobs").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
      continue;
    }

    if (booking.status === "cancelled") {
      await admin.from("scheduled_jobs").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
      continue;
    }

    const business = booking.business;
    const customer = booking.customer;
    const serviceName = booking.service?.name ?? "your appointment";
    const when = `${formatDate(booking.starts_at)} at ${formatTime(booking.starts_at)}`;

    const text =
      job.type === "reminder"
        ? `Hi ${customer.name ?? "there"} 👋 Just a reminder: you have ${serviceName} booked with ${business.name} on ${when}. Reply here if you need to reschedule.`
        : `Hi ${customer.name ?? "there"}, thanks for visiting ${business.name}! We hope you loved your ${serviceName}. We'd love to see you again soon 🙂`;

    try {
      await sendWhatsAppText(business.id, customer.whatsapp_phone, text);
      const conversation = await getOrCreateOpenConversation(admin, business.id, customer.id);
      await appendMessage(admin, {
        conversationId: conversation.id,
        businessId: business.id,
        direction: "outbound",
        body: text,
      });
      sent++;
    } catch (sendError) {
      console.error(`Failed to send ${job.type} for booking ${booking.id}`, sendError);
      continue; // leave sent_at null so it retries next run
    }

    await admin.from("scheduled_jobs").update({ sent_at: new Date().toISOString() }).eq("id", job.id);
  }

  return NextResponse.json({ ok: true, processed: jobs?.length ?? 0, sent });
}
