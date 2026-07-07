"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.string().trim().email("Enter a valid email address");

export interface SendMagicLinkResult {
  ok: boolean;
  error?: string;
}

export async function sendMagicLink(
  _prev: SendMagicLinkResult | null,
  formData: FormData
): Promise<SendMagicLinkResult> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email" };
  }

  const next = (formData.get("next") as string) || "/dashboard";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { ok: false, error: "Couldn't send the link. Please try again." };
  }

  return { ok: true };
}
