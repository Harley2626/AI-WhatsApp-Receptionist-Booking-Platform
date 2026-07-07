import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Business, Profile } from "@/types/database";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the signed-in user's business, or null if they haven't started onboarding. */
export async function getCurrentBusiness(): Promise<{
  business: Business | null;
  profile: Profile | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { business: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (!profile?.business_id) {
    return { business: null, profile: (profile as Profile) ?? null };
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", profile.business_id)
    .maybeSingle<Business>();

  return { business: business ?? null, profile };
}

/** Ensures a profile row exists for the current user, creating it (and a draft business) if needed. */
export async function ensureProfileAndBusiness(): Promise<Business> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  if (existingProfile?.business_id) {
    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", existingProfile.business_id)
      .single<Business>();
    if (business) return business;
  }

  const { data: newBusiness, error: businessError } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id })
    .select("*")
    .single<Business>();

  if (businessError || !newBusiness) {
    throw new Error(businessError?.message ?? "Could not create business");
  }

  if (existingProfile) {
    await supabase
      .from("profiles")
      .update({ business_id: newBusiness.id })
      .eq("id", user.id);
  } else {
    await supabase.from("profiles").insert({
      id: user.id,
      business_id: newBusiness.id,
      full_name: user.email?.split("@")[0] ?? null,
    });
  }

  return newBusiness;
}

/** Server-component guard: redirects to onboarding or login as appropriate. Returns the live business. */
export async function requireLiveBusiness(): Promise<Business> {
  const { business } = await getCurrentBusiness();
  if (!business) redirect("/onboarding/business");
  if (business.onboarding_step !== "done") redirect(`/onboarding/${business.onboarding_step}`);
  return business;
}

export const ONBOARDING_STEPS = [
  "business",
  "services",
  "hours",
  "calendar",
  "whatsapp",
  "payments",
] as const;

export function nextOnboardingStep(current: (typeof ONBOARDING_STEPS)[number]) {
  const idx = ONBOARDING_STEPS.indexOf(current);
  return ONBOARDING_STEPS[idx + 1] ?? "done";
}
