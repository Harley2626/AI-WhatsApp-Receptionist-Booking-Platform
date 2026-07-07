// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Regenerate manually if the schema changes (no Supabase CLI codegen in this workspace).

export type OnboardingStep =
  | "business"
  | "services"
  | "hours"
  | "calendar"
  | "whatsapp"
  | "payments"
  | "done";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
export type ConversationStatus = "open" | "escalated" | "closed";
export type MessageDirection = "inbound" | "outbound";
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";
export type IntegrationType = "whatsapp" | "google_calendar" | "payfast";
export type IntegrationStatus = "disconnected" | "connected" | "error";
export type ScheduledJobType = "reminder" | "follow_up" | "payment_expiry";

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: string | null;
  phone: string | null;
  timezone: string;
  currency: string;
  onboarding_step: OnboardingStep;
  is_live: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  business_id: string | null;
  role: "owner";
  full_name: string | null;
  created_at: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  /** Optional amount collected before a booking is confirmed — either the full
   *  price or a partial deposit, depending on what the business chooses. */
  payment_amount_cents: number | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export interface BusinessHour {
  id: string;
  business_id: string;
  day_of_week: number; // 0=Sunday..6=Saturday
  is_open: boolean;
  open_time: string; // "HH:MM:SS"
  close_time: string;
}

export interface Customer {
  id: string;
  business_id: string;
  whatsapp_phone: string;
  name: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  status: ConversationStatus;
  last_message_at: string;
  created_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  business_id: string;
  direction: MessageDirection;
  body: string;
  wa_message_id: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  customer_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  notes: string | null;
  google_event_id: string | null;
  /** Set when the booking is 'pending' payment; the hold is released if unpaid by this time. */
  payment_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Faq {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface Payment {
  id: string;
  business_id: string;
  booking_id: string;
  provider: string;
  provider_payment_id: string | null;
  amount_cents: number;
  status: PaymentStatus;
  payment_url: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface Integration {
  id: string;
  business_id: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  updated_at: string;
}

export interface IntegrationSecrets {
  business_id: string;
  type: IntegrationType;
  secrets: Record<string, unknown>;
  updated_at: string;
}

export interface ScheduledJob {
  id: string;
  business_id: string;
  booking_id: string;
  type: ScheduledJobType;
  run_at: string;
  sent_at: string | null;
  created_at: string;
}
