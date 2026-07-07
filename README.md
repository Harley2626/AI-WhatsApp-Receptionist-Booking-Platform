# Yebo — AI WhatsApp Receptionist & Booking Platform

The simplest AI receptionist for South African service businesses. Customers book, reschedule, and pay deposits entirely on WhatsApp; owners run everything from a lightweight, mobile-first dashboard.

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

- **Customers** message the business's WhatsApp number. Meta forwards the message to `/api/webhooks/whatsapp`, which loads the business's services/hours/FAQs, runs an OpenAI tool-calling agent (`src/lib/ai`), and replies — checking availability, booking, rescheding, cancelling, or generating a PayFast deposit link as needed. The agent never invents information; it only uses what the business owner entered.
- **Business owners** sign in with a magic link, complete the onboarding wizard, and manage bookings, customers, services, availability, payments, and reports from `/dashboard`.
- **Reminders & follow-ups** are sent by a cron job (`/api/cron/reminders`, scheduled via `vercel.json`) 24 hours before each appointment and a couple of hours after it ends.
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
