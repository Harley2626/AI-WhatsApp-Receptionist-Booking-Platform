# Wazzy — Your 24/7 AI Receptionist

Wazzy is the AI-powered WhatsApp receptionist for small businesses. Customers book, reschedule, and pay (in full or via deposit — the business decides per service) entirely on WhatsApp — no app required; owners run everything from a friendly, mobile-first dashboard.

## Reference docs

- [`context.md`](context.md) — product vision, MVP scope, principles, and non-goals
- [`docs/PLAN.md`](docs/PLAN.md) — technical architecture and implementation plan

## Stack

Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · Meta WhatsApp Cloud API · OpenAI (tool calling) · PayFast · Google Calendar · Tailwind CSS 4

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
3. Copy your Project URL, anon key, and service role key into `.env.local` (see below).

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the values — see comments in [`.env.example`](.env.example) for where to find each one (Supabase, OpenAI, Meta WhatsApp Cloud API, Google Cloud Console, PayFast).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up, and you'll land in the onboarding wizard (business → services → hours → calendar → WhatsApp → payments → go live).

### 5. Connect WhatsApp for local testing

Meta needs a public HTTPS URL to send webhooks to. Use a tunnel (e.g. `ngrok http 3000`) and set the webhook URL in your Meta app to `https://<your-tunnel>/api/webhooks/whatsapp`, with the verify token matching `WHATSAPP_VERIFY_TOKEN`.

## How it works

- **Customers** message the business's WhatsApp number. Meta forwards the message to `/api/webhooks/whatsapp`, which loads the business's services/hours/FAQs, runs an OpenAI tool-calling agent (`src/lib/ai`), and replies — checking availability, booking, rescheduling, cancelling, or generating a PayFast payment link as needed. The agent never invents information; it only uses what the business owner entered.
- **Payment flow**: Chat → Book → Pay → Confirmation → Reminders. If a service has a payment amount configured (full price or a deposit — the owner's choice), the booking is created as `pending` and the slot is held for `PAYMENT_HOLD_MINUTES` (30 min) while the customer pays via the PayFast link. `/api/webhooks/payfast` confirms the booking and sends the WhatsApp confirmation once payment clears; if the hold expires unpaid, the cron job below releases the slot and notifies the customer. Services with no payment amount configured confirm immediately, same as before.
- **Business owners** sign in with a magic link, complete the onboarding wizard, and manage bookings, customers, services, availability, payments, and reports from `/dashboard`.
- **Reminders, follow-ups & payment holds** are all processed by one cron job (`/api/cron/reminders`, scheduled via `vercel.json` every 15 minutes): reminders 24 hours before each appointment, follow-ups a couple of hours after it ends, and expiring unpaid booking holds.
- **Multi-tenancy**: every table is scoped by `business_id` and protected by Postgres Row Level Security, so each business only ever sees its own data.

## Project structure

```
src/
  app/            Routes: marketing site, login, onboarding, dashboard, API routes/webhooks
  components/     UI primitives + feature components
  lib/
    ai/           System prompt + tool-calling agent
    services/     Booking engine, WhatsApp, PayFast, Google Calendar, integrations
    supabase/     Browser/server/admin Supabase clients + auth session refresh
    validation/   Zod schemas
  types/          Hand-written types mirroring the Supabase schema
supabase/migrations/  SQL schema, RLS policies, indexes
```

## Deployment

Deploy to [Vercel](https://vercel.com) (the `vercel.json` cron schedule needs Vercel's cron feature). Set all `.env.example` variables in the Vercel project settings, then point your Meta WhatsApp webhook and PayFast ITN URL at your production domain.
