import type { SupabaseClient } from "@supabase/supabase-js";
import { addMinutes } from "date-fns";
import { zonedDateTimeToUtc, dayOfWeekForDate, formatInTimeZone } from "@/lib/time";
import { BUSINESS_TIMEZONE } from "@/lib/utils";
import type { Booking, BookingStatus, BusinessHour, Customer, Service } from "@/types/database";

type DB = SupabaseClient;

const SLOT_INTERVAL_MINUTES = 30;

/** How long a booking's slot is held while awaiting payment before it's released. */
export const PAYMENT_HOLD_MINUTES = 30;

export class BookingConflictError extends Error {
  constructor() {
    super("That time was just taken. Please choose another slot.");
    this.name = "BookingConflictError";
  }
}

export async function getServices(db: DB, businessId: string, opts: { activeOnly?: boolean } = {}) {
  let query = db.from("services").select("*").eq("business_id", businessId).order("sort_order");
  if (opts.activeOnly) query = query.eq("active", true);
  const { data, error } = await query.returns<Service[]>();
  if (error) throw error;
  return data ?? [];
}

export async function getServiceById(db: DB, businessId: string, serviceId: string) {
  const { data, error } = await db
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", serviceId)
    .maybeSingle<Service>();
  if (error) throw error;
  return data;
}

export async function getBusinessHours(db: DB, businessId: string) {
  const { data, error } = await db
    .from("business_hours")
    .select("*")
    .eq("business_id", businessId)
    .order("day_of_week")
    .returns<BusinessHour[]>();
  if (error) throw error;
  return data ?? [];
}

export interface Slot {
  startsAt: Date;
  endsAt: Date;
}

/** Computes open slots for a single calendar date, respecting business hours and existing bookings. */
export async function getAvailableSlotsForDate(
  db: DB,
  params: { businessId: string; serviceId: string; dateStr: string; timezone?: string }
): Promise<Slot[]> {
  const timezone = params.timezone ?? BUSINESS_TIMEZONE;
  const service = await getServiceById(db, params.businessId, params.serviceId);
  if (!service) return [];

  const dow = dayOfWeekForDate(params.dateStr, timezone);
  const hours = await getBusinessHours(db, params.businessId);
  const today = hours.find((h) => h.day_of_week === dow);
  if (!today || !today.is_open) return [];

  const openAt = zonedDateTimeToUtc(params.dateStr, today.open_time.slice(0, 5), timezone);
  const closeAt = zonedDateTimeToUtc(params.dateStr, today.close_time.slice(0, 5), timezone);

  const dayStart = zonedDateTimeToUtc(params.dateStr, "00:00", timezone);
  const dayEnd = zonedDateTimeToUtc(params.dateStr, "23:59", timezone);

  const { data: existing, error } = await db
    .from("bookings")
    .select("starts_at, ends_at")
    .eq("business_id", params.businessId)
    .in("status", ["pending", "confirmed"])
    .lt("starts_at", dayEnd.toISOString())
    .gt("ends_at", dayStart.toISOString())
    .returns<Pick<Booking, "starts_at" | "ends_at">[]>();
  if (error) throw error;

  const busy = (existing ?? []).map((b) => ({
    start: new Date(b.starts_at).getTime(),
    end: new Date(b.ends_at).getTime(),
  }));

  const slots: Slot[] = [];
  const now = Date.now();
  let cursor = openAt;

  while (addMinutes(cursor, service.duration_minutes).getTime() <= closeAt.getTime()) {
    const start = cursor;
    const end = addMinutes(cursor, service.duration_minutes);
    const overlaps = busy.some((b) => start.getTime() < b.end && end.getTime() > b.start);
    if (!overlaps && start.getTime() > now) {
      slots.push({ startsAt: start, endsAt: end });
    }
    cursor = addMinutes(cursor, SLOT_INTERVAL_MINUTES);
  }

  return slots;
}

/** Scans forward day by day to find the next available slots (for AI "what's your next opening" queries). */
export async function findNextAvailableSlots(
  db: DB,
  params: {
    businessId: string;
    serviceId: string;
    fromDateStr: string;
    daysToSearch?: number;
    limit?: number;
    timezone?: string;
  }
): Promise<Slot[]> {
  const daysToSearch = params.daysToSearch ?? 14;
  const limit = params.limit ?? 5;
  const results: Slot[] = [];

  for (let i = 0; i < daysToSearch && results.length < limit; i++) {
    const dateStr = formatInTimeZone(
      addMinutes(zonedDateTimeToUtc(params.fromDateStr, "12:00", params.timezone), i * 24 * 60),
      params.timezone ?? BUSINESS_TIMEZONE,
      "yyyy-MM-dd"
    );
    const daySlots = await getAvailableSlotsForDate(db, { ...params, dateStr });
    results.push(...daySlots.slice(0, limit - results.length));
  }

  return results;
}

export async function getOrCreateCustomer(
  db: DB,
  businessId: string,
  whatsappPhone: string,
  name?: string | null
): Promise<Customer> {
  const { data: existing } = await db
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("whatsapp_phone", whatsappPhone)
    .maybeSingle<Customer>();

  if (existing) {
    if (name && !existing.name) {
      const { data: updated } = await db
        .from("customers")
        .update({ name })
        .eq("id", existing.id)
        .select("*")
        .single<Customer>();
      return updated ?? existing;
    }
    return existing;
  }

  const { data: created, error } = await db
    .from("customers")
    .insert({ business_id: businessId, whatsapp_phone: whatsappPhone, name: name ?? null })
    .select("*")
    .single<Customer>();
  if (error) throw error;
  return created;
}

const REMINDER_LEAD_MINUTES = 24 * 60;
const FOLLOW_UP_DELAY_MINUTES = 120;

export async function clearScheduledJobs(db: DB, bookingId: string): Promise<void> {
  await db.from("scheduled_jobs").delete().eq("booking_id", bookingId).is("sent_at", null);
}

export async function scheduleBookingJobs(
  db: DB,
  booking: Pick<Booking, "id" | "business_id" | "starts_at" | "ends_at">
): Promise<void> {
  const jobs: { business_id: string; booking_id: string; type: "reminder" | "follow_up"; run_at: string }[] = [];
  const reminderAt = addMinutes(new Date(booking.starts_at), -REMINDER_LEAD_MINUTES);
  if (reminderAt.getTime() > Date.now()) {
    jobs.push({ business_id: booking.business_id, booking_id: booking.id, type: "reminder", run_at: reminderAt.toISOString() });
  }
  const followUpAt = addMinutes(new Date(booking.ends_at), FOLLOW_UP_DELAY_MINUTES);
  jobs.push({ business_id: booking.business_id, booking_id: booking.id, type: "follow_up", run_at: followUpAt.toISOString() });

  if (jobs.length > 0) await db.from("scheduled_jobs").insert(jobs);
}

export async function createBooking(
  db: DB,
  params: {
    businessId: string;
    serviceId: string;
    customerId: string;
    startsAt: Date;
    endsAt: Date;
    notes?: string;
    /** 'pending' holds the slot awaiting payment; 'confirmed' is used when no payment is required. */
    status?: BookingStatus;
    paymentExpiresAt?: Date | null;
  }
): Promise<Booking> {
  const status = params.status ?? "confirmed";
  const { data, error } = await db
    .from("bookings")
    .insert({
      business_id: params.businessId,
      service_id: params.serviceId,
      customer_id: params.customerId,
      starts_at: params.startsAt.toISOString(),
      ends_at: params.endsAt.toISOString(),
      status,
      payment_expires_at: params.paymentExpiresAt?.toISOString() ?? null,
      notes: params.notes ?? null,
    })
    .select("*")
    .single<Booking>();

  if (error) {
    if (error.code === "23P01") throw new BookingConflictError();
    throw error;
  }

  // Reminders/follow-ups are only scheduled once a booking is actually confirmed.
  // Bookings held pending payment get a payment-expiry job instead (see schedulePaymentExpiry).
  if (status === "confirmed") {
    await scheduleBookingJobs(db, data);
  }
  return data;
}

export async function schedulePaymentExpiry(
  db: DB,
  booking: Pick<Booking, "id" | "business_id">,
  expiresAt: Date
): Promise<void> {
  await db.from("scheduled_jobs").insert({
    business_id: booking.business_id,
    booking_id: booking.id,
    type: "payment_expiry",
    run_at: expiresAt.toISOString(),
  });
}

/** Called once PayFast confirms payment: confirms the booking and schedules its reminders/follow-up. */
export async function confirmBookingAfterPayment(
  db: DB,
  params: { bookingId: string; businessId: string }
): Promise<Booking | null> {
  const { data, error } = await db
    .from("bookings")
    .update({ status: "confirmed", payment_expires_at: null })
    .eq("id", params.bookingId)
    .eq("business_id", params.businessId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle<Booking>();
  if (error) throw error;
  if (!data) return null;

  await clearScheduledJobs(db, params.bookingId); // drops the now-moot payment_expiry job
  await scheduleBookingJobs(db, data);
  return data;
}

/** Called by the payment-expiry job when a held booking was never paid for. */
export async function expireUnpaidBooking(
  db: DB,
  params: { bookingId: string; businessId: string }
): Promise<Booking | null> {
  const { data, error } = await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.bookingId)
    .eq("business_id", params.businessId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle<Booking>();
  if (error) throw error;
  if (!data) return null;

  await clearScheduledJobs(db, params.bookingId);
  await db.from("payments").update({ status: "cancelled" }).eq("booking_id", params.bookingId).eq("status", "pending");
  return data;
}

export async function rescheduleBooking(
  db: DB,
  params: { bookingId: string; businessId: string; startsAt: Date; endsAt: Date }
): Promise<Booking> {
  const { data, error } = await db
    .from("bookings")
    .update({ starts_at: params.startsAt.toISOString(), ends_at: params.endsAt.toISOString() })
    .eq("id", params.bookingId)
    .eq("business_id", params.businessId)
    .select("*")
    .single<Booking>();

  if (error) {
    if (error.code === "23P01") throw new BookingConflictError();
    throw error;
  }

  await clearScheduledJobs(db, params.bookingId);
  await scheduleBookingJobs(db, data);
  return data;
}

export async function cancelBooking(db: DB, params: { bookingId: string; businessId: string }): Promise<Booking> {
  const { data, error } = await db
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", params.bookingId)
    .eq("business_id", params.businessId)
    .select("*")
    .single<Booking>();
  if (error) throw error;

  await clearScheduledJobs(db, params.bookingId);
  await db.from("payments").update({ status: "cancelled" }).eq("booking_id", params.bookingId).eq("status", "pending");
  return data;
}

export async function getUpcomingBookingsForCustomer(db: DB, businessId: string, customerId: string) {
  const { data, error } = await db
    .from("bookings")
    .select("*, service:services(*)")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", new Date().toISOString())
    .order("starts_at");
  if (error) throw error;
  return data ?? [];
}

export async function getBookingById(db: DB, businessId: string, bookingId: string) {
  const { data, error } = await db
    .from("bookings")
    .select("*, service:services(*), customer:customers(*)")
    .eq("business_id", businessId)
    .eq("id", bookingId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
