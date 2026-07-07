import { NextResponse } from "next/server";
import { exchangeGoogleCode } from "@/lib/services/calendar";
import { upsertIntegrationConfig, upsertIntegrationSecrets } from "@/lib/services/integrations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const businessId = searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!code || !businessId) {
    return NextResponse.redirect(`${appUrl}/onboarding/calendar?error=missing_code`);
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    if (!tokens.refresh_token) {
      // Google only returns a refresh_token on first consent; if the app was
      // previously authorized, ask the user to revoke access and try again.
      return NextResponse.redirect(`${appUrl}/onboarding/calendar?error=no_refresh_token`);
    }

    await upsertIntegrationConfig(businessId, "google_calendar", { calendar_id: "primary" });
    await upsertIntegrationSecrets(businessId, "google_calendar", {
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      access_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    });

    return NextResponse.redirect(`${appUrl}/onboarding/calendar`);
  } catch {
    return NextResponse.redirect(`${appUrl}/onboarding/calendar?error=exchange_failed`);
  }
}
