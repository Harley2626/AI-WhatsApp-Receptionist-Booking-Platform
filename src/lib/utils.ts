import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BUSINESS_TIMEZONE = "Africa/Johannesburg";
export const CURRENCY = "ZAR";

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDateTime(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: BUSINESS_TIMEZONE,
    dateStyle: "medium",
    timeStyle: "short",
    ...opts,
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: BUSINESS_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    timeZone: BUSINESS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

/** Normalizes a South African / international number to E.164 (WhatsApp format, no leading +). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  if (digits.startsWith("27")) return digits;
  return digits;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
