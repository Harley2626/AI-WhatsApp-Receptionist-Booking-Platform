import { fromZonedTime, toZonedTime, formatInTimeZone } from "date-fns-tz";
import { addMinutes, isBefore } from "date-fns";
import { BUSINESS_TIMEZONE } from "@/lib/utils";

/** Combines a Y-M-D date with an H:M time in the given timezone and returns the UTC instant. */
export function zonedDateTimeToUtc(dateStr: string, timeStr: string, timezone: string = BUSINESS_TIMEZONE): Date {
  return fromZonedTime(`${dateStr}T${timeStr}`, timezone);
}

/** Returns the wall-clock "day of week" (0=Sun..6=Sat) for a Y-M-D date in the given timezone. */
export function dayOfWeekForDate(dateStr: string, timezone: string = BUSINESS_TIMEZONE): number {
  const noon = fromZonedTime(`${dateStr}T12:00`, timezone);
  return toZonedTime(noon, timezone).getDay();
}

export function nowInTimezone(timezone: string = BUSINESS_TIMEZONE): Date {
  return toZonedTime(new Date(), timezone);
}

export function todayDateString(timezone: string = BUSINESS_TIMEZONE): string {
  return formatInTimeZone(new Date(), timezone, "yyyy-MM-dd");
}

export function addDaysToDateString(dateStr: string, days: number, timezone: string = BUSINESS_TIMEZONE): string {
  const base = fromZonedTime(`${dateStr}T12:00`, timezone);
  const shifted = addMinutes(base, days * 24 * 60);
  return formatInTimeZone(shifted, timezone, "yyyy-MM-dd");
}

export function isPast(date: Date): boolean {
  return isBefore(date, new Date());
}

export { addMinutes, formatInTimeZone };
