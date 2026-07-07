import { z } from "zod";

export const businessDetailsSchema = z.object({
  name: z.string().trim().min(2, "Business name is required").max(120),
  category: z.string().trim().min(1, "Choose a category"),
  phone: z
    .string()
    .trim()
    .min(9, "Enter a valid phone number")
    .max(20),
});
export type BusinessDetailsInput = z.infer<typeof businessDetailsSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Service name is required").max(120),
  duration_minutes: z.coerce.number().int().min(5).max(600),
  price_cents: z.coerce.number().int().min(0),
  deposit_cents: z.coerce.number().int().min(0).nullable().optional(),
});
export type ServiceInput = z.infer<typeof serviceSchema>;

export const businessHourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/),
  close_time: z.string().regex(/^\d{2}:\d{2}$/),
});
export const businessHoursSchema = z.array(businessHourSchema).length(7);
export type BusinessHourInput = z.infer<typeof businessHourSchema>;

export const whatsappConnectSchema = z.object({
  phone_number_id: z.string().trim().min(3, "Required"),
  access_token: z.string().trim().min(10, "Required"),
});
export type WhatsAppConnectInput = z.infer<typeof whatsappConnectSchema>;

export const payfastConnectSchema = z.object({
  merchant_id: z.string().trim().min(1, "Required"),
  merchant_key: z.string().trim().min(1, "Required"),
  passphrase: z.string().trim().optional(),
});
export type PayFastConnectInput = z.infer<typeof payfastConnectSchema>;

export const faqSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});
export type FaqInput = z.infer<typeof faqSchema>;

export const BUSINESS_CATEGORIES = [
  "Hair Salon",
  "Barber",
  "Beauty Salon",
  "Doctor",
  "Dentist",
  "Physiotherapist",
  "Mechanic",
  "Electrician",
  "Plumber",
  "Tutor",
  "Pet Groomer",
  "Tour Operator",
  "Consultant",
  "Other",
] as const;
