"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  businessDetailsSchema,
  serviceSchema,
  businessHoursSchema,
  whatsappConnectSchema,
  payfastConnectSchema,
  faqSchema,
} from "@/lib/validation/schemas";
import { nextOnboardingStep, ONBOARDING_STEPS } from "@/lib/services/business";
import type { OnboardingStep } from "@/types/database";

async function requireOwnedBusinessId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("business_id")
    .eq("id", user.id)
    .single();

  if (!profile?.business_id) redirect("/onboarding/business");
  return profile.business_id as string;
}

async function advanceStepIfCurrent(businessId: string, fromStep: OnboardingStep) {
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("onboarding_step")
    .eq("id", businessId)
    .single();

  if (business?.onboarding_step === fromStep) {
    await supabase
      .from("businesses")
      .update({ onboarding_step: nextOnboardingStep(fromStep as (typeof ONBOARDING_STEPS)[number]) })
      .eq("id", businessId);
  }
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function saveBusinessDetails(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = businessDetailsSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update(parsed.data).eq("id", businessId);
  if (error) return { ok: false, error: error.message };

  await advanceStepIfCurrent(businessId, "business");
  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/services");
}

export async function addService(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price_cents: Math.round(Number(formData.get("price_rand") ?? 0) * 100),
    payment_amount_cents: formData.get("payment_rand")
      ? Math.round(Number(formData.get("payment_rand")) * 100)
      : null,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({ business_id: businessId, ...parsed.data });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/onboarding/services");
  revalidatePath("/dashboard/services");
  return { ok: true };
}

export async function deleteService(serviceId: string) {
  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", serviceId).eq("business_id", businessId);
  revalidatePath("/onboarding/services");
  revalidatePath("/dashboard/services");
}

export async function toggleServiceActive(serviceId: string, active: boolean) {
  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  await supabase.from("services").update({ active }).eq("id", serviceId).eq("business_id", businessId);
  revalidatePath("/dashboard/services");
}

export async function completeServicesStep() {
  const businessId = await requireOwnedBusinessId();
  await advanceStepIfCurrent(businessId, "services");
  redirect("/onboarding/hours");
}

export async function saveBusinessHours(hours: unknown): Promise<ActionResult> {
  const parsed = businessHoursSchema.safeParse(hours);
  if (!parsed.success) return { ok: false, error: "Invalid hours" };

  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  const { error } = await supabase
    .from("business_hours")
    .upsert(
      parsed.data.map((h) => ({ ...h, business_id: businessId })),
      { onConflict: "business_id,day_of_week" }
    );
  if (error) return { ok: false, error: error.message };

  await advanceStepIfCurrent(businessId, "hours");
  revalidatePath("/onboarding", "layout");
  revalidatePath("/dashboard/availability");
  return { ok: true };
}

export async function skipCalendarStep() {
  const businessId = await requireOwnedBusinessId();
  await advanceStepIfCurrent(businessId, "calendar");
  redirect("/onboarding/whatsapp");
}

export async function saveWhatsAppConnection(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = whatsappConnectSchema.safeParse({
    phone_number_id: formData.get("phone_number_id"),
    access_token: formData.get("access_token"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const admin = createAdminClient();

  await admin.from("integrations").upsert(
    {
      business_id: businessId,
      type: "whatsapp",
      status: "connected",
      config: { phone_number_id: parsed.data.phone_number_id },
    },
    { onConflict: "business_id,type" }
  );
  await admin.from("integration_secrets").upsert(
    {
      business_id: businessId,
      type: "whatsapp",
      secrets: { access_token: parsed.data.access_token },
    },
    { onConflict: "business_id,type" }
  );

  await advanceStepIfCurrent(businessId, "whatsapp");
  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/payments");
}

export async function skipPaymentsStep() {
  const businessId = await requireOwnedBusinessId();
  await advanceStepIfCurrent(businessId, "payments");
  redirect("/onboarding/complete");
}

export async function savePayFastConnection(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = payfastConnectSchema.safeParse({
    merchant_id: formData.get("merchant_id"),
    merchant_key: formData.get("merchant_key"),
    passphrase: formData.get("passphrase") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const admin = createAdminClient();

  await admin.from("integrations").upsert(
    {
      business_id: businessId,
      type: "payfast",
      status: "connected",
      config: { merchant_id: parsed.data.merchant_id },
    },
    { onConflict: "business_id,type" }
  );
  await admin.from("integration_secrets").upsert(
    {
      business_id: businessId,
      type: "payfast",
      secrets: { merchant_key: parsed.data.merchant_key, passphrase: parsed.data.passphrase ?? "" },
    },
    { onConflict: "business_id,type" }
  );

  await advanceStepIfCurrent(businessId, "payments");
  revalidatePath("/onboarding", "layout");
  redirect("/onboarding/complete");
}

export async function goLive() {
  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  await supabase.from("businesses").update({ onboarding_step: "done", is_live: true }).eq("id", businessId);
  redirect("/dashboard");
}

export async function addFaq(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = faqSchema.safeParse({ question: formData.get("question"), answer: formData.get("answer") });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").insert({ business_id: businessId, ...parsed.data });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function deleteFaq(faqId: string) {
  const businessId = await requireOwnedBusinessId();
  const supabase = await createClient();
  await supabase.from("faqs").delete().eq("id", faqId).eq("business_id", businessId);
  revalidatePath("/dashboard/settings");
}
