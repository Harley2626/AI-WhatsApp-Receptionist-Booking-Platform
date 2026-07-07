-- Payment flow update: no more separate "deposit" concept.
-- Each service can optionally require a payment (full price or a partial
-- deposit amount — the business owner decides) before a booking is
-- confirmed. Flow becomes: Chat -> Book (held) -> Pay -> Confirmation -> Reminders.

alter table services rename column deposit_cents to payment_amount_cents;

-- Bookings needing payment are inserted as 'pending' with a hold expiry.
-- If unpaid by then, a cron job cancels them and frees the slot.
alter table bookings add column payment_expires_at timestamptz;

alter table scheduled_jobs drop constraint scheduled_jobs_type_check;
alter table scheduled_jobs add constraint scheduled_jobs_type_check
  check (type in ('reminder', 'follow_up', 'payment_expiry'));
