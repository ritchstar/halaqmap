/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * يصدّر الشركاء الموافقين صراحةً إلى JSON يقرأه مولّد صفحات فزعة.
 * إن لم تتوفر بيانات القاعدة يُبقي الملف الحالي أو يكتب قائمة فارغة — لا يفشل البناء.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { FAZAA_FEATURED_PARTNERS } from './data/fazaaFeaturedPartners.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'scripts', 'data', 'fazaaFeaturedPartners.consented.json');

function isSafeHttps(url) {
  try {
    return new URL(String(url || '')).protocol === 'https:';
  } catch {
    return false;
  }
}

function phrasesFor(nameAr, areaLabelAr, cityNameAr, catalog) {
  const hit = catalog.find((p) => p.nameAr === nameAr);
  if (hit?.phrases?.length) return hit.phrases;
  return [
    `${nameAr} ${cityNameAr}`,
    `حلاق ${areaLabelAr}`,
    `اقرب حلاق ${areaLabelAr}`,
  ];
}

async function main() {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!url || !key) {
    writeFileSync(OUT, '[]\n', 'utf8');
    console.log('[export-fazaa-consented-partners] no supabase env — wrote empty consented list');
    return;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase
    .from('fazaa_seo_listing_consents')
    .select(
      'id, name_snapshot, city_slug, city_name_ar, neighborhood_slugs, area_label_ar, specialty_hint_ar, banner_url, accepted_at, barber_id',
    )
    .eq('status', 'accepted')
    .order('accepted_at', { ascending: false })
    .limit(200);

  if (error) {
    writeFileSync(OUT, '[]\n', 'utf8');
    console.log(`[export-fazaa-consented-partners] query skipped: ${error.message}`);
    return;
  }

  const seen = new Set();
  const rows = [];
  for (const row of data || []) {
    const barberId = String(row.barber_id || '');
    if (!barberId || seen.has(barberId)) continue;
    seen.add(barberId);
    const nameAr = String(row.name_snapshot || '').trim();
    const citySlug = String(row.city_slug || '').trim();
    const cityNameAr = String(row.city_name_ar || '').trim();
    const areaLabelAr = String(row.area_label_ar || '').trim();
    const neighborhoodSlugs = Array.isArray(row.neighborhood_slugs) ? row.neighborhood_slugs : [];
    if (!nameAr || !citySlug || neighborhoodSlugs.length === 0) continue;
    const bannerUrl = isSafeHttps(row.banner_url) ? String(row.banner_url) : '';
    rows.push({
      nameAr,
      citySlug,
      cityNameAr,
      neighborhoodSlugs,
      areaLabelAr,
      specialtyHintAr: String(row.specialty_hint_ar || 'حلاقة رجالي'),
      phrases: phrasesFor(nameAr, areaLabelAr, cityNameAr, FAZAA_FEATURED_PARTNERS),
      bannerUrl,
      bannerAltAr: `${nameAr} — ${areaLabelAr}، ${cityNameAr}`,
      consentId: String(row.id),
    });
  }

  writeFileSync(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
  console.log(`[export-fazaa-consented-partners] wrote ${rows.length} consented partners`);
}

main().catch((err) => {
  writeFileSync(OUT, '[]\n', 'utf8');
  console.log(`[export-fazaa-consented-partners] failed softly: ${err instanceof Error ? err.message : 'error'}`);
});
