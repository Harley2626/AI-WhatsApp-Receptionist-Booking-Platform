import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, MessageRow } from "@/types/database";

export async function getOrCreateOpenConversation(
  db: SupabaseClient,
  businessId: string,
  customerId: string
): Promise<Conversation> {
  const { data: existing } = await db
    .from("conversations")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .neq("status", "closed")
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle<Conversation>();

  if (existing) return existing;

  const { data: created, error } = await db
    .from("conversations")
    .insert({ business_id: businessId, customer_id: customerId })
    .select("*")
    .single<Conversation>();
  if (error) throw error;
  return created;
}

export async function appendMessage(
  db: SupabaseClient,
  params: {
    conversationId: string;
    businessId: string;
    direction: "inbound" | "outbound";
    body: string;
    waMessageId?: string | null;
  }
): Promise<MessageRow | null> {
  const { data, error } = await db
    .from("messages")
    .insert({
      conversation_id: params.conversationId,
      business_id: params.businessId,
      direction: params.direction,
      body: params.body,
      wa_message_id: params.waMessageId ?? null,
    })
    .select("*")
    .maybeSingle<MessageRow>();

  // Unique violation on wa_message_id = Meta retried a webhook we already processed.
  if (error && error.code !== "23505") throw error;

  await db.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", params.conversationId);

  return data;
}

export async function getRecentMessages(
  db: SupabaseClient,
  conversationId: string,
  limit = 20
): Promise<MessageRow[]> {
  const { data, error } = await db
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<MessageRow[]>();
  if (error) throw error;
  return (data ?? []).reverse();
}

export async function messageAlreadyProcessed(db: SupabaseClient, waMessageId: string): Promise<boolean> {
  const { data } = await db.from("messages").select("id").eq("wa_message_id", waMessageId).maybeSingle();
  return !!data;
}
