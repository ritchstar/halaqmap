-- Unified conversation log for all AI staff agents (public + admin lab + partner + barber).
-- Service-role inserts only — for governance reports and regulatory inquiry tracking.

create table if not exists public.agent_conversations (
  id uuid primary key default gen_random_uuid(),
  agent_id text not null,
  agent_title_ar text not null,
  persona_gender text not null
    check (persona_gender in ('male', 'female')),
  deployment text not null
    check (deployment in ('public', 'admin_lab', 'partner', 'barber')),
  channel text,
  user_message text not null,
  assistant_reply text,
  referred_to_management boolean not null default false,
  actor_email text,
  session_meta jsonb not null default '{}'::jsonb,
  asked_at timestamptz not null default now(),
  constraint agent_conversations_user_message_len check (char_length(trim(user_message)) >= 1)
);

comment on table public.agent_conversations is
  'AI staff chat turns — persona tagged (سعودي/سعودية), deployment channel, optional regulatory referral flag.';

create index if not exists agent_conversations_agent_asked_idx
  on public.agent_conversations (agent_id, asked_at desc);

create index if not exists agent_conversations_referred_idx
  on public.agent_conversations (referred_to_management, asked_at desc)
  where referred_to_management = true;

create index if not exists agent_conversations_deployment_idx
  on public.agent_conversations (deployment, asked_at desc);

alter table public.agent_conversations enable row level security;

-- No policies: anon/authenticated cannot read or write; service role bypasses RLS.

grant select, insert on public.agent_conversations to service_role;
