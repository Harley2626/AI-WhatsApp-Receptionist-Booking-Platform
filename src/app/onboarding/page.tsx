import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/services/business";

export default async function OnboardingIndexPage() {
  const { business } = await getCurrentBusiness();
  if (!business) redirect("/onboarding/business");
  if (business.is_live) redirect("/dashboard");
  const step = business.onboarding_step === "done" ? "payments" : business.onboarding_step;
  redirect(`/onboarding/${step}`);
}
