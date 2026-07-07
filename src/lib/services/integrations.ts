import { createAdminClient } from "@/lib/supabase/admin";
import type { Integration, IntegrationSecrets, IntegrationType } from "@/types/database";

/** Fetches non-secret config + secrets for a business integration. Server-only (uses service role). */
export async function getIntegration<TConfig, TSecrets>(
  businessId: string,
  type: IntegrationType
): Promise<{ config: TConfig; secrets: TSecrets } | null> {
  const admin = createAdminClient();

  const [{ data: integration }, { data: secretsRow }] = await Promise.all([
    admin
      .from("integrations")
      .select("*")
      .eq("business_id", businessId)
      .eq("type", type)
      .eq("status", "connected")
      .maybeSingle<Integration>(),
    admin
      .from("integration_secrets")
      .select("*")
      .eq("business_id", businessId)
      .eq("type", type)
      .maybeSingle<IntegrationSecrets>(),
  ]);

  if (!integration) return null;

  return {
    config: integration.config as TConfig,
    secrets: (secretsRow?.secrets ?? {}) as TSecrets,
  };
}

export async function markIntegrationError(businessId: string, type: IntegrationType) {
  const admin = createAdminClient();
  await admin.from("integrations").update({ status: "error" }).eq("business_id", businessId).eq("type", type);
}

export async function upsertIntegrationConfig(
  businessId: string,
  type: IntegrationType,
  config: Record<string, unknown>
) {
  const admin = createAdminClient();
  await admin
    .from("integrations")
    .upsert({ business_id: businessId, type, status: "connected", config }, { onConflict: "business_id,type" });
}

export async function upsertIntegrationSecrets(
  businessId: string,
  type: IntegrationType,
  secrets: Record<string, unknown>
) {
  const admin = createAdminClient();
  await admin
    .from("integration_secrets")
    .upsert({ business_id: businessId, type, secrets }, { onConflict: "business_id,type" });
}
