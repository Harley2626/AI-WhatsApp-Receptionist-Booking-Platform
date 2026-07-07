import { getIntegration, upsertIntegrationSecrets } from "@/lib/services/integrations";
import type { GoogleCalendarConfig, GoogleCalendarSecrets } from "@/types/integrations";

const GOOGLE_SCOPES = "https://www.googleapis.com/auth/calendar.events";

export class GoogleCalendarNotConnectedError extends Error {
  constructor() {
    super("Google Calendar is not connected for this business.");
    this.name = "GoogleCalendarNotConnectedError";
  }
}

function getOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google OAuth env vars (GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI)");
  }
  return { clientId, clientSecret, redirectUri };
}

export function getGoogleAuthUrl(businessId: string): string {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: GOOGLE_SCOPES,
    state: businessId,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) throw new Error("Failed to exchange Google authorization code");
  return response.json() as Promise<{ access_token: string; refresh_token?: string; expires_in: number }>;
}

async function refreshAccessToken(refreshToken: string) {
  const { clientId, clientSecret } = getOAuthConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Failed to refresh Google access token");
  return response.json() as Promise<{ access_token: string; expires_in: number }>;
}

async function getValidAccessToken(businessId: string): Promise<string> {
  const integration = await getIntegration<GoogleCalendarConfig, GoogleCalendarSecrets>(
    businessId,
    "google_calendar"
  );
  if (!integration?.secrets.refresh_token) throw new GoogleCalendarNotConnectedError();

  const expiresAt = integration.secrets.access_token_expires_at
    ? new Date(integration.secrets.access_token_expires_at).getTime()
    : 0;

  if (integration.secrets.access_token && expiresAt - Date.now() > 60_000) {
    return integration.secrets.access_token;
  }

  const refreshed = await refreshAccessToken(integration.secrets.refresh_token);
  await upsertIntegrationSecrets(businessId, "google_calendar", {
    refresh_token: integration.secrets.refresh_token,
    access_token: refreshed.access_token,
    access_token_expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
  });
  return refreshed.access_token;
}

export interface CalendarEventInput {
  summary: string;
  description?: string;
  startsAt: Date;
  endsAt: Date;
  timezone: string;
}

async function calendarFetch(businessId: string, path: string, init: RequestInit) {
  const accessToken = await getValidAccessToken(businessId);
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary${path}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function createCalendarEvent(businessId: string, event: CalendarEventInput): Promise<string | null> {
  try {
    const response = await calendarFetch(businessId, "/events", {
      method: "POST",
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startsAt.toISOString(), timeZone: event.timezone },
        end: { dateTime: event.endsAt.toISOString(), timeZone: event.timezone },
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.id as string;
  } catch {
    return null;
  }
}

export async function updateCalendarEvent(
  businessId: string,
  eventId: string,
  event: CalendarEventInput
): Promise<boolean> {
  try {
    const response = await calendarFetch(businessId, `/events/${eventId}`, {
      method: "PATCH",
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.startsAt.toISOString(), timeZone: event.timezone },
        end: { dateTime: event.endsAt.toISOString(), timeZone: event.timezone },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function deleteCalendarEvent(businessId: string, eventId: string): Promise<boolean> {
  try {
    const response = await calendarFetch(businessId, `/events/${eventId}`, { method: "DELETE" });
    return response.ok || response.status === 410;
  } catch {
    return false;
  }
}
