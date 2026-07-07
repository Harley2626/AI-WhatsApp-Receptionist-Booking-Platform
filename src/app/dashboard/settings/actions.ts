"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { businessDetailsSchema, whatsappConnectSchema, payfastConnectSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/app/onboarding/actions";
import type { IntegrationType } from "@/types/database";

async function requireOwnedBusinessId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("business_id").eq("id", user.id).single();
  if (!profile?.business_id) redirect("/onboarding/business");
  return profile.business_id as string;
}

export async function updateBusinessDetails(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
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

  revalidatePath("/dashboard/settings", "layout");
  return { ok: true };
}

export async function saveWhatsAppConnection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = whatsappConnectSchema.safeParse({
    phone_number_id: formData.get("phone_number_id"),
    access_token: formData.get("access_token"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const admin = createAdminClient();
  await admin.from("integrations").upsert(
    { business_id: businessId, type: "whatsapp", status: "connected", config: { phone_number_id: parsed.data.phone_number_id } },
    { onConflict: "business_id,type" }
  );
  await admin.from("integration_secrets").upsert(
    { business_id: businessId, type: "whatsapp", secrets: { access_token: parsed.data.access_token } },
    { onConflict: "business_id,type" }
  );

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function savePayFastConnection(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = payfastConnectSchema.safeParse({
    merchant_id: formData.get("merchant_id"),
    merchant_key: formData.get("merchant_key"),
    passphrase: formData.get("passphrase") || undefined,
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message };

  const businessId = await requireOwnedBusinessId();
  const admin = createAdminClient();
  await admin.from("integrations").upsert(
    { business_id: businessId, type: "payfast", status: "connected", config: { merchant_id: parsed.data.merchant_id } },
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

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function disconnectIntegration(type: IntegrationType) {
  const businessId = await requireOwnedBusinessId();
  const admin = createAdminClient();
  await admin.from("integrations").update({ status: "disconnected" }).eq("business_id", businessId).eq("type", type);
  await admin.from("integration_secrets").delete().eq("business_id", businessId).eq("type", type);
  revalidatePath("/dashboard/settings");
}
