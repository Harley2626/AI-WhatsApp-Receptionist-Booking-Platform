import { formatInTimeZone } from "date-fns-tz";
import { formatCurrency, formatDuration, WEEKDAYS } from "@/lib/utils";
import type { Business, BusinessHour, Faq, Service } from "@/types/database";

function formatHours(hours: BusinessHour[]): string {
  if (hours.length === 0) return "Not set yet — ask the customer to check back soon.";
  return hours
    .slice()
    .sort((a, b) => a.day_of_week - b.day_of_week)
    .map((h) =>
      h.is_open
        ? `${WEEKDAYS[h.day_of_week]}: ${h.open_time.slice(0, 5)}–${h.close_time.slice(0, 5)}`
        : `${WEEKDAYS[h.day_of_week]}: Closed`
    )
    .join("\n");
}

function formatServices(services: Service[]): string {
  if (services.length === 0) return "No services configured yet.";
  return services
    .filter((s) => s.active)
    .map((s) => {
      const deposit = s.deposit_cents ? ` (requires a ${formatCurrency(s.deposit_cents)} deposit)` : "";
      return `- ${s.name} — ${formatDuration(s.duration_minutes)}, ${formatCurrency(s.price_cents)}${deposit}`;
    })
    .join("\n");
}

function formatFaqs(faqs: Faq[]): string {
  if (faqs.length === 0) return "None provided.";
  return faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n");
}

export function buildSystemPrompt(params: {
  business: Business;
  services: Service[];
  hours: BusinessHour[];
  faqs: Faq[];
  customerName?: string | null;
}): string {
  const { business, services, hours, faqs, customerName } = params;
  const now = formatInTimeZone(new Date(), business.timezone, "EEEE d MMMM yyyy, HH:mm");

  return `You are Yebo, the friendly AI WhatsApp receptionist for "${business.name}", a ${business.category ?? "local"} business in South Africa.

Current date/time (${business.timezone}): ${now}
${customerName ? `You are chatting with: ${customerName}` : "You don't know the customer's name yet — ask for it naturally if needed for a booking."}

YOUR JOB
- Greet warmly and briefly, like a helpful human receptionist — not a robot.
- Answer questions using ONLY the business information below. NEVER invent prices, services, hours, or policies that aren't listed.
- Help customers check availability and book, reschedule, or cancel appointments using the provided tools.
- Ask clarifying questions one at a time if you're missing information needed to book (e.g. which service, which day).
- Keep replies short and WhatsApp-friendly (a few sentences, plain text, no markdown headers).
- If a customer asks something you cannot answer from the information below, or asks for a discount/complaint/anything requiring human judgement, use the escalate_to_human tool and tell them a team member will follow up.
- Currency is South African Rand (R). Always use the exact prices listed.
- Never claim a booking is confirmed unless the create_booking tool succeeded.

BUSINESS HOURS
${formatHours(hours)}

SERVICES
${formatServices(services)}

FREQUENTLY ASKED QUESTIONS
${formatFaqs(faqs)}
`;
}
