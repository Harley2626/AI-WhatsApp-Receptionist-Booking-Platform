import OpenAI from "openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { executeTool, getToolDefinitions } from "@/lib/ai/tools";
import { getBusinessHours, getServices } from "@/lib/services/booking";
import type { Business, Faq, MessageRow } from "@/types/database";

const MODEL = process.env.OPENAI_MODEL || "gpt-5.5";
const MAX_TOOL_ITERATIONS = 4;
const HISTORY_LIMIT = 20;

let client: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export interface RunAgentParams {
  db: SupabaseClient;
  business: Business;
  customerId: string;
  customerName: string | null;
  conversationId: string;
  history: MessageRow[];
}

/** Runs the tool-calling loop and returns the assistant's final reply text. */
export async function runReceptionistAgent(params: RunAgentParams): Promise<string> {
  const { db, business, customerId, customerName, conversationId, history } = params;

  const [services, hours, faqsRes] = await Promise.all([
    getServices(db, business.id, { activeOnly: true }),
    getBusinessHours(db, business.id),
    db.from("faqs").select("*").eq("business_id", business.id).order("sort_order").returns<Faq[]>(),
  ]);

  const systemPrompt = buildSystemPrompt({
    business,
    services,
    hours,
    faqs: faqsRes.data ?? [],
    customerName,
  });

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-HISTORY_LIMIT).map(
      (m): OpenAI.Chat.Completions.ChatCompletionMessageParam => ({
        role: m.direction === "inbound" ? "user" : "assistant",
        content: m.body,
      })
    ),
  ];

  const openai = getOpenAI();
  const tools = getToolDefinitions();
  const toolCtx = { db, business, customerId, customerName, conversationId };

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools,
    });

    const choice = completion.choices[0]?.message;
    if (!choice) return fallbackReply();

    if (!choice.tool_calls || choice.tool_calls.length === 0) {
      return choice.content?.trim() || fallbackReply();
    }

    messages.push({
      role: "assistant",
      content: choice.content ?? null,
      tool_calls: choice.tool_calls,
    });

    for (const toolCall of choice.tool_calls) {
      if (toolCall.type !== "function") continue;
      const result = await executeTool(toolCtx, toolCall.function.name, toolCall.function.arguments);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  // Ran out of iterations — ask the model for a final plain-text answer with no more tools.
  const finalCompletion = await openai.chat.completions.create({ model: MODEL, messages });
  return finalCompletion.choices[0]?.message.content?.trim() || fallbackReply();
}

function fallbackReply(): string {
  return "Sorry, I'm having a little trouble right now — a team member will follow up with you shortly.";
}
