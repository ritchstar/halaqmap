-- B2B partner acquisition pipeline — غرفة القيادة (Command Center)
-- Server-side only via /api/admin-partner-prospects; RLS blocks direct client access.

create table if not exists public.partner_prospects (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  city text not null,
  region text not null,
  address text,
  tier_fit text not null default 'gold'
    check (tier_fit in ('gold', 'diamond', 'mixed')),
  channel text not null default 'whatsapp'
    check (channel in ('whatsapp', 'instagram', 'email', 'website', 'phone')),
  phone text,
  email text,
  instagram text,
  website text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'waiting', 'won', 'lost')),
  assigned_to text,
  notes text,
  last_contact_at timestamptz,
  follow_up_date date,
  suggested_pitch text,
  source text not null default 'manual'
    check (source in ('manual', 'seed', 'b2b_strategist', 'import')),
  source_meta jsonb not null default '{}'::jsonb,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_prospects_name_len check (char_length(trim(name)) between 2 and 200),
  constraint partner_prospects_city_len check (char_length(trim(city)) between 2 and 120),
  constraint partner_prospects_region_len check (char_length(trim(region)) between 2 and 120)
);

comment on table public.partner_prospects is
  'B2B outreach pipeline for partner acquisition — managed from Admin Command Center; inserts/updates via service role API only.';

create index if not exists partner_prospects_status_idx
  on public.partner_prospects (status, follow_up_date);

create index if not exists partner_prospects_city_region_idx
  on public.partner_prospects (region, city);

create index if not exists partner_prospects_source_idx
  on public.partner_prospects (source, created_at desc);

create index if not exists partner_prospects_created_at_idx
  on public.partner_prospects (created_at desc);

alter table public.partner_prospects enable row level security;

-- Seed legacy Command Center leads (static list migrated from adminCommandCenter.ts)
insert into public.partner_prospects (
  legacy_id, name, city, region, tier_fit, channel, phone, email, instagram, website, source
) values
  ('lead-address-riyadh', 'صالون العنوان', 'الرياض', 'الوسطى', 'diamond', 'website', null, null, '@theaddressbarber', 'https://theaddressbarbershop.com', 'seed'),
  ('lead-30degrees-ksa', 'صالون 30 ديقريز', 'فروع المملكة', 'متعدد المناطق', 'mixed', 'email', '920035655', 'info@30degrees.sa', '@30degreesbarbershop', 'https://30degrees.sa', 'seed'),
  ('lead-249-riyadh', 'صالون 249+ Barber', 'الرياض', 'الوسطى', 'gold', 'whatsapp', '966563137432', null, '@249_barber_riyadh', null, 'seed'),
  ('lead-fadi-jeddah', 'صالون فادي', 'جدة', 'الغربية', 'diamond', 'whatsapp', '966506622434', null, '@fadisalon', null, 'seed'),
  ('lead-groom-jeddah', 'ذا جروم', 'جدة', 'الغربية', 'diamond', 'whatsapp', '966556677424', null, '@thegroomsa', null, 'seed'),
  ('lead-taper-khobar', 'تايبر أند فيد', 'الخبر', 'الشرقية', 'gold', 'whatsapp', '966533122115', null, '@taperandfadesa', null, 'seed'),
  ('lead-vaz-madinah', 'صالون فاز', 'المدينة المنورة', 'المدينة', 'gold', 'whatsapp', '966561118161', null, '@vaz_barber', null, 'seed'),
  ('lead-piccasso-riyadh', 'صالون بيكاسو', 'الرياض', 'الوسطى', 'gold', 'phone', '966593782389', null, '@odao_', null, 'seed')
on conflict (legacy_id) do nothing;
