import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseWhatsAppWebhookPayload, sendWhatsAppText, markWhatsAppMessageRead } from "@/lib/services/whatsapp";
import { getOrCreateCustomer } from "@/lib/services/booking";
import { getOrCreateOpenConversation, appendMessage, getRecentMessages, messageAlreadyProcessed } from "@/lib/services/conversations";
import { runReceptionistAgent } from "@/lib/ai/agent";
import { normalizePhone } from "@/lib/utils";
import type { Business } from "@/types/database";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  const { phoneNumberId, messages } = parseWhatsAppWebhookPayload(body);
  if (!phoneNumberId || messages.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  const { data: integration } = await admin
    .from("integrations")
    .select("business_id")
    .eq("type", "whatsapp")
    .eq("status", "connected")
    .eq("config->>phone_number_id", phoneNumberId)
    .maybeSingle();

  if (!integration) {
    console.error(`No connected business found for WhatsApp phone_number_id=${phoneNumberId}`);
    return NextResponse.json({ ok: true });
  }

  const { data: business } = await admin
    .from("businesses")
    .select("*")
    .eq("id", integration.business_id)
    .maybeSingle<Business>();

  if (!business || !business.is_live) return NextResponse.json({ ok: true });

  for (const msg of messages) {
    try {
      if (await messageAlreadyProcessed(admin, msg.waMessageId)) continue;

      const phone = normalizePhone(msg.from);
      const customer = await getOrCreateCustomer(admin, business.id, phone, msg.contactName);
      const conversation = await getOrCreateOpenConversation(admin, business.id, customer.id);

      await appendMessage(admin, {
        conversationId: conversation.id,
        businessId: business.id,
        direction: "inbound",
        body: msg.text,
        waMessageId: msg.waMessageId,
      });

      markWhatsAppMessageRead(business.id, msg.waMessageId).catch(() => {});

      // A human has taken over — don't let the bot talk over them.
      if (conversation.status === "escalated") continue;

      const history = await getRecentMessages(admin, conversation.id);
      const reply = await runReceptionistAgent({
        db: admin,
        business,
        customerId: customer.id,
        customerName: customer.name,
        conversationId: conversation.id,
        history,
      });

      await appendMessage(admin, {
        conversationId: conversation.id,
        businessId: business.id,
        direction: "outbound",
        body: reply,
      });

      await sendWhatsAppText(business.id, phone, reply);
    } catch (error) {
      console.error("Failed to process WhatsApp message", error);
    }
  }

  return NextResponse.json({ ok: true });
}
