import { getIntegration } from "@/lib/services/integrations";
import type { WhatsAppConfig, WhatsAppSecrets } from "@/types/integrations";

const GRAPH_API_VERSION = "v21.0";

export class WhatsAppNotConnectedError extends Error {
  constructor() {
    super("WhatsApp is not connected for this business.");
    this.name = "WhatsAppNotConnectedError";
  }
}

async function getCredentials(businessId: string) {
  const integration = await getIntegration<WhatsAppConfig, WhatsAppSecrets>(businessId, "whatsapp");
  if (!integration?.secrets.access_token || !integration.config.phone_number_id) {
    throw new WhatsAppNotConnectedError();
  }
  return integration;
}

/** Sends a free-form text message. Only valid within Meta's 24h customer service window. */
export async function sendWhatsAppText(businessId: string, to: string, body: string): Promise<void> {
  const { config, secrets } = await getCredentials(businessId);

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${config.phone_number_id}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secrets.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: true, body },
      }),
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp send failed: ${payload?.error?.message ?? response.statusText}`);
  }
}

export async function markWhatsAppMessageRead(businessId: string, waMessageId: string): Promise<void> {
  try {
    const { config, secrets } = await getCredentials(businessId);
    await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${config.phone_number_id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secrets.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        status: "read",
        message_id: waMessageId,
      }),
    });
  } catch {
    // Best-effort — never block message processing on a read-receipt failure.
  }
}

export interface InboundWhatsAppMessage {
  waMessageId: string;
  from: string;
  text: string;
  contactName?: string;
  timestamp: string;
}

/** Parses a Meta Cloud API webhook payload into normalized inbound text messages. */
export function parseWhatsAppWebhookPayload(body: unknown): {
  phoneNumberId: string | null;
  messages: InboundWhatsAppMessage[];
} {
  const messages: InboundWhatsAppMessage[] = [];
  let phoneNumberId: string | null = null;

  try {
    const entries = (body as { entry?: unknown[] })?.entry ?? [];
    for (const entry of entries as Record<string, unknown>[]) {
      const changes = (entry.changes as Record<string, unknown>[]) ?? [];
      for (const change of changes) {
        const value = change.value as Record<string, unknown>;
        phoneNumberId = (value?.metadata as Record<string, unknown>)?.phone_number_id as string ?? phoneNumberId;
        const contacts = (value?.contacts as Record<string, unknown>[]) ?? [];
        const contactName = (contacts[0]?.profile as Record<string, unknown>)?.name as string | undefined;
        const waMessages = (value?.messages as Record<string, unknown>[]) ?? [];
        for (const msg of waMessages) {
          if (msg.type === "text") {
            messages.push({
              waMessageId: msg.id as string,
              from: msg.from as string,
              text: ((msg.text as Record<string, unknown>)?.body as string) ?? "",
              contactName,
              timestamp: msg.timestamp as string,
            });
          } else if (msg.type === "button") {
            messages.push({
              waMessageId: msg.id as string,
              from: msg.from as string,
              text: ((msg.button as Record<string, unknown>)?.text as string) ?? "",
              contactName,
              timestamp: msg.timestamp as string,
            });
          }
        }
      }
    }
  } catch {
    // Malformed payload — return whatever we parsed so far.
  }

  return { phoneNumberId, messages };
}
