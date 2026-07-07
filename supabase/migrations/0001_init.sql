-- AI WhatsApp Receptionist & Booking Platform — initial schema
-- Multi-tenant: every business-owned row carries business_id and is protected by RLS.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

-- ─────────────────────────────────────────────────────────────────────────
-- Core tables
-- ─────────────────────────────────────────────────────────────────────────

create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  category text,
  phone text,
  timezone text not null default 'Africa/Johannesburg',
  currency text not null default 'ZAR',
  onboarding_step text not null default 'business'
    check (onboarding_step in ('business', 'services', 'hours', 'calendar', 'whatsapp', 'payments', 'done')),
  is_live boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_id uuid references businesses(id) on delete set null,
  role text not null default 'owner' check (role in ('owner')),
  full_name text,
  created_at timestamptz not null default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price_cents int not null default 0 check (price_cents >= 0),
  deposit_cents int check (deposit_cents >= 0),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  is_open boolean not null default true,
  open_time time not null default '09:00',
  close_time time not null default '17:00',
  unique (business_id, day_of_week)
);

create table customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  whatsapp_phone text not null,
  name text,
  created_at timestamptz not null default now(),
  unique (business_id, whatsapp_phone)
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'escalated', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  business_id uuid not null references businesses(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  wa_message_id text unique,
  created_at timestamptz not null default now()
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  service_id uuid not null references services(id),
  customer_id uuid not null references customers(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  notes text,
  google_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bookings_time_order check (ends_at > starts_at),
  -- MVP has one resource per business (no staff scheduling), so two active
  -- bookings for the same business can never overlap in time.
  constraint bookings_no_overlap exclude using gist (
    business_id with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status in ('pending', 'confirmed'))
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  provider text not null default 'payfast',
  provider_payment_id text,
  amount_cents int not null check (amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_url text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

-- Non-secret integration status, readable by the business owner.
create table integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  type text not null check (type in ('whatsapp', 'google_calendar', 'payfast')),
  status text not null default 'disconnected' check (status in ('disconnected', 'connected', 'error')),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (business_id, type)
);

-- Secrets live in a separate table with no anon/authenticated policies: only the
-- service-role key (server-only) can read/write this table.
create table integration_secrets (
  business_id uuid not null references businesses(id) on delete cascade,
  type text not null check (type in ('whatsapp', 'google_calendar', 'payfast')),
  secrets jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (business_id, type)
);

create table scheduled_jobs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  booking_id uuid not null references bookings(id) on delete cascade,
  type text not null check (type in ('reminder', 'follow_up')),
  run_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────────────

create index idx_profiles_business on profiles(business_id);
create index idx_services_business on services(business_id) where active;
create index idx_hours_business on business_hours(business_id);
create index idx_customers_business on customers(business_id);
create index idx_conversations_business on conversations(business_id, last_message_at desc);
create index idx_messages_conversation on messages(conversation_id, created_at);
create index idx_bookings_business_start on bookings(business_id, starts_at);
create index idx_bookings_customer on bookings(customer_id);
create index idx_faqs_business on faqs(business_id, sort_order);
create index idx_payments_booking on payments(booking_id);
create index idx_scheduled_jobs_run_at on scheduled_jobs(run_at) where sent_at is null;

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_businesses_updated_at before update on businesses
  for each row execute function set_updated_at();

create trigger trg_bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

create trigger trg_integrations_updated_at before update on integrations
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table businesses enable row level security;
alter table profiles enable row level security;
alter table services enable row level security;
alter table business_hours enable row level security;
alter table customers enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table bookings enable row level security;
alter table faqs enable row level security;
alter table payments enable row level security;
alter table integrations enable row level security;
alter table integration_secrets enable row level security;
alter table scheduled_jobs enable row level security;

-- integration_secrets: no policies defined → only service_role (which bypasses
-- RLS entirely) can access it. Owners and anon users get zero rows.

create or replace function auth_business_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select business_id from profiles where id = auth.uid();
$$;

create policy "owner can read own business" on businesses
  for select using (owner_id = auth.uid() or id = auth_business_id());

create policy "owner can update own business" on businesses
  for update using (owner_id = auth.uid());

create policy "owner can insert own business" on businesses
  for insert with check (owner_id = auth.uid());

create policy "user can read own profile" on profiles
  for select using (id = auth.uid());

create policy "user can update own profile" on profiles
  for update using (id = auth.uid());

create policy "user can insert own profile" on profiles
  for insert with check (id = auth.uid());

create policy "owner manages services" on services
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages hours" on business_hours
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages customers" on customers
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages conversations" on conversations
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages messages" on messages
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages bookings" on bookings
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner manages faqs" on faqs
  for all using (business_id = auth_business_id()) with check (business_id = auth_business_id());

create policy "owner reads payments" on payments
  for select using (business_id = auth_business_id());

create policy "owner reads integrations" on integrations
  for select using (business_id = auth_business_id());

create policy "owner reads scheduled_jobs" on scheduled_jobs
  for select using (business_id = auth_business_id());
