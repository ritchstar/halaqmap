-- Pre-launch: barbers opt in with email + explicit consent (no full registration).
-- Inserts only via server (Supabase service role); RLS blocks direct client access.

create table if not exists public.barber_interest_signups (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  consent_follow_updates boolean not null,
  created_at timestamptz not null default now(),
  constraint barber_interest_signups_email_unique unique (email_normalized),
  constraint barber_interest_signups_consent_must_be_true check (consent_follow_updates = true),
  constraint barber_interest_signups_email_len check (char_length(email_normalized) between 3 and 254)
);

comment on table public.barber_interest_signups is
  'Marketing opt-in before official launch; consent required. Server-side insert via /api/interest-signup only.';

create index if not exists barber_interest_signups_created_at_idx
  on public.barber_interest_signups (created_at desc);

alter table public.barber_interest_signups enable row level security;
