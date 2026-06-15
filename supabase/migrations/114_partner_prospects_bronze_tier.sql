-- Allow bronze tier_fit for partner acquisition pipeline (غرفة القيادة).

alter table public.partner_prospects
  drop constraint if exists partner_prospects_tier_fit_check;

alter table public.partner_prospects
  add constraint partner_prospects_tier_fit_check
  check (tier_fit in ('bronze', 'gold', 'diamond', 'mixed'));
