import type { SupabaseClient } from "@supabase/supabase-js";
import type OpenAI from "openai";
import {
  cancelBooking,
  createBooking,
  findNextAvailableSlots,
  getAvailableSlotsForDate,
  getServices,
  getUpcomingBookingsForCustomer,
  rescheduleBooking,
  schedulePaymentExpiry,
  BookingConflictError,
  PAYMENT_HOLD_MINUTES,
} from "@/lib/services/booking";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "@/lib/services/calendar";
import { createPayFastPaymentUrl, PayFastNotConnectedError } from "@/lib/services/payfast";
import { getIntegration } from "@/lib/services/integrations";
import { zonedDateTimeToUtc, todayDateString } from "@/lib/time";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Business, Service } from "@/types/database";

export interface ToolContext {
  db: SupabaseClient;
  business: Business;
  customerId: string;
  customerName: string | null;
  conversationId: string;
}

function findServiceByName(services: Service[], name: string): Service | undefined {
  const normalized = name.trim().toLowerCase();
  return (
    services.find((s) => s.name.toLowerCase() === normalized) ??
    services.find((s) => s.name.toLowerCase().includes(normalized) || normalized.includes(s.name.toLowerCase()))
  );
}

export function getToolDefinitions(): OpenAI.Chat.Completions.ChatCompletionTool[] {
  return [
    {
      type: "function",
      function: {
        name: "check_availability",
        description:
          "Get open appointment slots for a service. If no date is given, returns the soonest available slots.",
        parameters: {
          type: "object",
          properties: {
            service_name: { type: "string", description: "Name of the service, e.g. 'Haircut'" },
            date: {
              type: "string",
              description: "Date in YYYY-MM-DD format. Omit to search the next available days.",
            },
          },
          required: ["service_name"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_booking",
        description: "Book an appointment for the current customer. Only call this after they confirm a specific date and time.",
        parameters: {
          type: "object",
          properties: {
            service_name: { type: "string" },
            date: { type: "string", description: "YYYY-MM-DD" },
            time: { type: "string", description: "24h time, HH:MM" },
            customer_name: { type: "string", description: "Customer's name, if known" },
          },
          required: ["service_name", "date", "time"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_my_bookings",
        description: "List the current customer's upcoming confirmed bookings.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "reschedule_booking",
        description: "Move the customer's most recent upcoming booking to a new date/time.",
        parameters: {
          type: "object",
          properties: {
            new_date: { type: "string", description: "YYYY-MM-DD" },
            new_time: { type: "string", description: "24h time, HH:MM" },
          },
          required: ["new_date", "new_time"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cancel_booking",
        description: "Cancel the customer's most recent upcoming booking.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "escalate_to_human",
        description:
          "Flag this conversation for a human team member. Use when you cannot help, the customer is unhappy, or they explicitly ask for a person.",
        parameters: {
          type: "object",
          properties: { reason: { type: "string" } },
          required: ["reason"],
        },
      },
    },
  ];
}

async function maybeCreatePaymentLink(
  ctx: ToolContext,
  service: Service,
  bookingId: string
): Promise<string | null> {
  if (!service.payment_amount_cents) return null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    return await createPayFastPaymentUrl({
      businessId: ctx.business.id,
      bookingId,
      amountCents: service.payment_amount_cents,
      itemName: `${service.name} — ${ctx.business.name}`,
      customerName: ctx.customerName ?? undefined,
      returnUrl: `${appUrl}/pay/thank-you`,
      cancelUrl: `${appUrl}/pay/cancelled`,
      notifyUrl: `${appUrl}/api/webhooks/payfast?business=${ctx.business.id}`,
    });
  } catch (error) {
    if (error instanceof PayFastNotConnectedError) return null;
    return null;
  }
}

export async function executeTool(
  ctx: ToolContext,
  name: string,
  rawArgs: string
): Promise<Record<string, unknown>> {
  const args = safeParseArgs(rawArgs);
  const services = await getServices(ctx.db, ctx.business.id, { activeOnly: true });

  switch (name) {
    case "check_availability": {
      const service = findServiceByName(services, String(args.service_name ?? ""));
      if (!service) return { error: `Unknown service "${args.service_name}". Available: ${services.map((s) => s.name).join(", ")}` };

      const dateStr = typeof args.date === "string" && args.date ? args.date : todayDateString(ctx.business.timezone);
      const slots = args.date
        ? await getAvailableSlotsForDate(ctx.db, { businessId: ctx.business.id, serviceId: service.id, dateStr, timezone: ctx.business.timezone })
        : await findNextAvailableSlots(ctx.db, {
            businessId: ctx.business.id,
            serviceId: service.id,
            fromDateStr: dateStr,
            timezone: ctx.business.timezone,
          });

      if (slots.length === 0) {
        return { available: false, message: "No open slots found in the searched range." };
      }

      return {
        available: true,
        service: service.name,
        slots: slots.slice(0, 8).map((s) => ({
          date: formatDate(s.startsAt.toISOString()),
          time: formatTime(s.startsAt.toISOString()),
          iso: s.startsAt.toISOString(),
        })),
      };
    }

    case "create_booking": {
      const service = findServiceByName(services, String(args.service_name ?? ""));
      if (!service) return { error: `Unknown service "${args.service_name}".` };

      const dateStr = String(args.date ?? "");
      const timeStr = String(args.time ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) {
        return { error: "Date must be YYYY-MM-DD and time must be HH:MM." };
      }

      const startsAt = zonedDateTimeToUtc(dateStr, timeStr, ctx.business.timezone);
      const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);

      if (startsAt.getTime() < Date.now()) {
        return { error: "That time is in the past. Please choose a future slot." };
      }

      try {
        // Only hold the booking pending payment if the service wants payment
        // AND PayFast is actually connected — otherwise fail open and confirm
        // the booking outright rather than stranding the customer.
        const payfastConnected = service.payment_amount_cents ? !!(await getIntegration(ctx.business.id, "payfast")) : false;
        const requiresPayment = !!service.payment_amount_cents && payfastConnected;
        const paymentExpiresAt = requiresPayment ? new Date(Date.now() + PAYMENT_HOLD_MINUTES * 60_000) : null;

        const booking = await createBooking(ctx.db, {
          businessId: ctx.business.id,
          serviceId: service.id,
          customerId: ctx.customerId,
          startsAt,
          endsAt,
          status: requiresPayment ? "pending" : "confirmed",
          paymentExpiresAt,
        });

        if (args.customer_name && typeof args.customer_name === "string") {
          await ctx.db.from("customers").update({ name: args.customer_name }).eq("id", ctx.customerId).is("name", null);
        }

        const eventId = await createCalendarEvent(ctx.business.id, {
          summary: `${service.name} — ${ctx.customerName ?? "Customer"}${requiresPayment ? " (awaiting payment)" : ""}`,
          description: `Booked via WhatsApp with Wazzy.`,
          startsAt,
          endsAt,
          timezone: ctx.business.timezone,
        });
        if (eventId) {
          await ctx.db.from("bookings").update({ google_event_id: eventId }).eq("id", booking.id);
        }

        let paymentUrl: string | null = null;
        if (requiresPayment) {
          paymentUrl = await maybeCreatePaymentLink(ctx, service, booking.id);
          await ctx.db.from("payments").insert({
            business_id: ctx.business.id,
            booking_id: booking.id,
            amount_cents: service.payment_amount_cents,
            status: "pending",
            payment_url: paymentUrl,
          });
          await schedulePaymentExpiry(ctx.db, booking, paymentExpiresAt!);
        }

        return {
          success: true,
          confirmed: !requiresPayment,
          service: service.name,
          date: formatDate(startsAt.toISOString()),
          time: formatTime(startsAt.toISOString()),
          price: formatCurrency(service.price_cents),
          payment_required: requiresPayment,
          payment_amount: requiresPayment ? formatCurrency(service.payment_amount_cents!) : null,
          payment_link: paymentUrl,
          payment_hold_minutes: requiresPayment ? PAYMENT_HOLD_MINUTES : null,
        };
      } catch (error) {
        if (error instanceof BookingConflictError) {
          return { success: false, error: error.message };
        }
        return { success: false, error: "Something went wrong creating the booking. Please try again." };
      }
    }

    case "list_my_bookings": {
      const bookings = await getUpcomingBookingsForCustomer(ctx.db, ctx.business.id, ctx.customerId);
      return {
        bookings: bookings.map((b) => ({
          id: b.id,
          service: (b as unknown as { service: Service }).service?.name,
          date: formatDate(b.starts_at),
          time: formatTime(b.starts_at),
          status: b.status,
        })),
      };
    }

    case "reschedule_booking": {
      const bookings = await getUpcomingBookingsForCustomer(ctx.db, ctx.business.id, ctx.customerId);
      const latest = bookings[0];
      if (!latest) return { error: "No upcoming booking found to reschedule." };

      const dateStr = String(args.new_date ?? "");
      const timeStr = String(args.new_time ?? "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) {
        return { error: "Date must be YYYY-MM-DD and time must be HH:MM." };
      }

      const service = (latest as unknown as { service: Service }).service;
      const startsAt = zonedDateTimeToUtc(dateStr, timeStr, ctx.business.timezone);
      const endsAt = new Date(startsAt.getTime() + (service?.duration_minutes ?? 30) * 60_000);

      try {
        const updated = await rescheduleBooking(ctx.db, {
          bookingId: latest.id,
          businessId: ctx.business.id,
          startsAt,
          endsAt,
        });
        if (updated.google_event_id) {
          await updateCalendarEvent(ctx.business.id, updated.google_event_id, {
            summary: `${service?.name ?? "Appointment"} — ${ctx.customerName ?? "Customer"}`,
            startsAt,
            endsAt,
            timezone: ctx.business.timezone,
          });
        }
        return { success: true, date: formatDate(startsAt.toISOString()), time: formatTime(startsAt.toISOString()) };
      } catch (error) {
        if (error instanceof BookingConflictError) return { success: false, error: error.message };
        return { success: false, error: "Could not reschedule. Please try another time." };
      }
    }

    case "cancel_booking": {
      const bookings = await getUpcomingBookingsForCustomer(ctx.db, ctx.business.id, ctx.customerId);
      const latest = bookings[0];
      if (!latest) return { error: "No upcoming booking found to cancel." };

      const cancelled = await cancelBooking(ctx.db, { bookingId: latest.id, businessId: ctx.business.id });
      if (cancelled.google_event_id) {
        await deleteCalendarEvent(ctx.business.id, cancelled.google_event_id);
      }
      return { success: true };
    }

    case "escalate_to_human": {
      await ctx.db.from("conversations").update({ status: "escalated" }).eq("id", ctx.conversationId);
      return { success: true, reason: args.reason };
    }

    default:
      return { error: `Unknown tool ${name}` };
  }
}

function safeParseArgs(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
