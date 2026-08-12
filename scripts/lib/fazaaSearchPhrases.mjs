/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * عبارات بحث تنافسية لصفحات فزعة — مصدر واحد للعربية/الإنجليزية.
 * مرتّبة حسب أداء Search Console العضوي (CTR) ثم نوايا عامية (أبي/عطني/شف لي) ثم مدن.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** بادئات نية عامية شائعة في البحث العربي */
export const FAZAA_INTENT_PREFIXES_AR = ['أبي', 'أريد', 'أرغب', 'شف لي', 'عطني'];

function uniquePhrases(list) {
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const p = String(raw || '').trim();
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

/** يولّد: أبي حلاق قريب · عطني حلاق قريب · … */
export function withIntentPrefixes(seeds, prefixes = FAZAA_INTENT_PREFIXES_AR) {
  const out = [];
  for (const seed of seeds) {
    const s = String(seed || '').trim();
    if (!s) continue;
    out.push(s);
    for (const pre of prefixes) {
      out.push(`${pre} ${s}`);
    }
  }
  return uniquePhrases(out);
}

function loadCityNamesAr() {
  try {
    const raw = JSON.parse(
      readFileSync(join(__dirname, '../../src/config/geoNearRegistry.json'), 'utf8'),
    );
    const nodes = Array.isArray(raw) ? raw : raw.nodes || [];
    return nodes
      .filter((n) => n && n.kind === 'city' && n.nameAr)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .map((n) => String(n.nameAr));
  } catch {
    return ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر'];
  }
}

const CITY_NAMES_AR = loadCityNamesAr();

/** قرب الموقع والصالون — عبارات GSC ذات النقر/الظهور أولاً */
const NEAR_SEEDS = [
  'اقرب حلاق',
  'أقرب حلاق',
  'حلاق قريب',
  'حلاق قريب مني',
  'حلاق قريب من موقعي',
  'اقرب حلاق من موقعي',
  'أقرب حلاق من موقعي',
  'اقرب حلاق رجالي من موقعي',
  'أقرب حلاق رجالي من موقعي',
  'حلاق رجالي قريب مني',
  'حلاق رجالي قريب',
  'اقرب حلاق رجالي',
  'حلاق رجال',
  'حلاق رجالي',
  'اقرب حلاق لي',
  'اقرب حلاق لموقعي',
  'حلاقين بالقرب مني',
  'افضل حلاق قريب من موقعي',
  'أفضل حلاق قريب من موقعي',
  'افضل حلاق قريب مني',
  'أفضل حلاقين بالقرب مني',
  'أفضل حلاق',
  'صالون قريب',
  'صالون حلاقة قريب',
  'صالون حلاقه قريب من موقعي',
  'صالون رجالي قريب من موقعي',
  'أقرب صالون حلاقة',
  'أقرب صالون حولي',
  'اقرب صالون حلاقة من موقعي',
  'اقرب محل حلاقة من موقعي',
  'صالونات الحارة',
  'صالونات الحي',
  'اطلب صالون',
  'صالون جنبي',
  'صالون بقربي',
  'رقم حلاق حولي',
  'حلاقين قريب مني',
  'حلاق رخيص',
  'ابحث لي عن أقرب حلاق',
];

/** نوى تُوسَّع ببادئات أبي/أريد/أرغب/شف لي/عطني */
const INTENT_NEAR_SEEDS = [
  'حلاق قريب',
  'اقرب حلاق',
  'أقرب حلاق من موقعي',
  'حلاق قريب مني',
  'حلاق قريب من موقعي',
  'حلاق رجال',
  'حلاق رجالي',
  'أفضل حلاق',
  'صالون قريب',
];

export const FAZAA_NEAR_SALON_PHRASES = uniquePhrases([
  ...NEAR_SEEDS,
  ...withIntentPrefixes(INTENT_NEAR_SEEDS),
  'أبي حلاق قريب',
  'عطني أقرب حلاق',
  'عطني أقرب صالون حولي',
  'عطني أقرب صالون من موقعي',
]);

/** مفتوح الآن / 24 ساعة — GSC + Ads */
export const FAZAA_OPEN_NOW_PHRASES = uniquePhrases([
  'اقرب حلاق مفتوح من موقعي',
  'أقرب حلاق مفتوح من موقعي',
  'حلاق مفتوح 24 ساعة من موقعي',
  'أقرب حلاق من موقعي مفتوح الآن',
  'حلاق قريب مني مفتوح الآن',
  'حلاق قريب من موقعي مفتوح الآن',
  'حلاق قريب من موقعي مفتوح الان',
  'اقرب حلاق فاتح من موقعي',
  'اقرب حلاق فاتح',
  'حلاق فاتح الان',
  'حلاق مفتوح الآن',
  'حلاق ٢٤ ساعة',
  'حلاق 24 ساعه قريب مني',
  ...withIntentPrefixes([
    'حلاق مفتوح الآن',
    'اقرب حلاق مفتوح من موقعي',
    'حلاق مفتوح 24 ساعة من موقعي',
  ]),
]);

/** منزلي / متنقل / دليفري — مع الرياض وصيغ النية */
const HOME_SEEDS = [
  'حلاق يجي البيت',
  'حلاق رجالي يجي البيت',
  'حلاق دليفري',
  'barber delivery',
  'delivery barber',
  'حلاق متنقل',
  'حلاق متنقل في منزلك',
  'حلاق يجيك لبيتك',
  'حلاق يجيك البيت',
  'حلاق منزلي',
  'حلاق منزلي الرياض',
  'حلاق منزلي بالرياض',
  'حلاق منزلي في الرياض',
  'حلاق متنقل الرياض',
  'حلاق أطفال منزلي',
  'حلاق اطفال منزلي',
  'حلاق أطفال متنقل',
  'حلاق اطفال متنقل',
  'حلاق اطفال متنقل الرياض',
  'حلاق أطفال متنقل الرياض',
];

export const FAZAA_HOME_MOBILE_PHRASES = uniquePhrases([
  ...HOME_SEEDS,
  ...withIntentPrefixes([
    'حلاق منزلي',
    'حلاق منزلي الرياض',
    'حلاق متنقل',
    'حلاق يجي البيت',
    'حلاق دليفري',
    'حلاق اطفال متنقل الرياض',
  ]),
  ...CITY_NAMES_AR.flatMap((city) => [
    `حلاق منزلي ${city}`,
    `حلاق منزلي في ${city}`,
    `حلاق متنقل ${city}`,
  ]),
]);

/** حلاق أطفال — قرب / منزلي / أحياء / مدن */
const CHILDREN_SEEDS = [
  'حلاق أطفال',
  'حلاق اطفال',
  'حلاقة أطفال',
  'صالون أطفال',
  'حلاق أطفال قريب من موقعي',
  'حلاق اطفال قريب من موقعي',
  'أقرب حلاق أطفال من موقعي',
  'اقرب حلاق اطفال من موقعي',
  'حلاق أطفال منزلي',
  'حلاق اطفال منزلي',
  'حلاق أطفال متنقل',
  'حلاق اطفال متنقل',
  'حلاق اطفال متنقل الرياض',
  'حلاق أطفال متنقل الرياض',
  'حلاق أطفال الرياض',
  'حلاق اطفال الرياض',
  'حلاق أطفال الملقا',
  'حلاق اطفال الملقا',
  'حلاق أطفال العليا',
  'حلاق اطفال العليا',
  'حلاق أطفال النخيل',
  'حلاق اطفال النخيل',
];

export const FAZAA_CHILDREN_PHRASES = uniquePhrases([
  ...CHILDREN_SEEDS,
  ...withIntentPrefixes([
    'حلاق أطفال',
    'حلاق اطفال قريب من موقعي',
    'حلاق أطفال قريب من موقعي',
    'حلاق اطفال الرياض',
    'حلاق أطفال الملقا',
    'حلاق اطفال متنقل الرياض',
  ]),
  ...CITY_NAMES_AR.flatMap((city) => [
    `حلاق أطفال ${city}`,
    `حلاق اطفال ${city}`,
    `حلاق أطفال في ${city}`,
  ]),
]);

/** إنجليزي قرب — من تقرير Ads */
export const FAZAA_EN_NEAR_PHRASES = [
  'barber near me',
  'barber shop near me',
  'barbershop near me',
  'nearest barber shop to me',
];

/** أصول شائعة في صياغة البحث (ليست فلتر جنسية في المنصة) */
export const FAZAA_ORIGIN_STYLE_PHRASES = [
  'حلاق محترف',
  'حلاق مصري',
  'حلاق مصري قريب مني',
  'اقرب حلاق مصري من موقعي',
  'حلاق تركي',
  'حلاق تركي قريب مني',
  'اقرب حلاق تركي من موقعي',
  'حلاق باكستاني',
  'حلاق باكستاني قريب مني',
  'حلاق سوري',
  'حلاق تونسي',
  'حلاق فلبيني',
  'حلاق هندي',
  'حلاق لحية',
];

/** أفضل حلاق + مدن المنصة (~47) */
export const FAZAA_BEST_NEAR_CITY_PHRASES = uniquePhrases([
  'أفضل حلاق بالرياض',
  'افضل حلاق بالرياض',
  'أفضل حلاق في الرياض',
  'افضل حلاق في الرياض',
  'أفضل حلاق الرياض',
  'حلاق الرياض',
  'حلاق بالرياض',
  'حلاق الرياض من موقعي',
  'أفضل حلاقين بالقرب مني في الرياض',
  'أفضل حلاقين بالقرب مني في جدة',
  'أفضل حلاقين بالقرب مني في مكة',
  'أفضل حلاقين بالقرب مني في الدمام',
  'أفضل حلاقين بالقرب مني في المدينة',
  'أفضل حلاقين بالقرب مني في الخبر',
  ...withIntentPrefixes(['أفضل حلاق بالرياض', 'أفضل حلاق في الرياض', 'حلاق الرياض']),
  ...CITY_NAMES_AR.flatMap((city) => [
    `أفضل حلاق ب${city}`,
    `أفضل حلاق في ${city}`,
    `افضل حلاق في ${city}`,
    `حلاق ${city}`,
    `حلاق ب${city}`,
  ]),
]);

/** عبارات مكة — عمود /near/makkah */
export const FAZAA_MAKKAH_PHRASES = [
  'أقرب حلاق مكة',
  'أقرب حلاق في مكة',
  'أقرب حلاق رجالي من موقعي مكة',
  'أقرب حلاق من موقعي مكة',
  'حلاق قريب مني مكة',
  'صالون قريب مكة',
  'حلاق مفتوح الآن مكة',
  'صالونات رجالي مكة',
  'حلق مكة',
  'تقصير مكة',
  'تحلل مكة',
];

/** عبارات المدينة المنورة — عمود /near/madinah */
export const FAZAA_MADINAH_PHRASES = [
  'اقرب حلاق المدينة المنورة',
  'أقرب حلاق المدينة المنورة',
  'أقرب حلاق في المدينة',
  'اقرب حلاق في المدينة',
  'اقرب حلاق رجالي من موقعي المدينة',
  'أقرب حلاق رجالي من موقعي المدينة',
  'اقرب حلاق من موقعي المدينة',
  'حلاق قريب مني المدينة',
  'حلاق قريب قباء',
  'اقرب حلاق قباء',
  'حلاق مفتوح الآن المدينة',
  'صالونات رجالي المدينة',
  ...withIntentPrefixes([
    'اقرب حلاق المدينة المنورة',
    'اقرب حلاق رجالي من موقعي المدينة',
  ]),
];

/**
 * تكتيك المسافة — 100م … 1000م (خطوة 100)
 * يستهدف: اقرب حلاق من موقعي · اقرب حلاق 200 متر · اقرب حلاق رجالي من موقعي مفتوح الآن
 */
export const FAZAA_DISTANCE_METERS = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

function distancePhrasesForMeters(meters) {
  const out = [];
  for (const n of meters) {
    out.push(
      `اقرب حلاق ${n} متر`,
      `أقرب حلاق ${n} متر`,
      `اقرب حلاق من موقعي ${n} متر`,
      `أقرب حلاق من موقعي ${n} متر`,
      `اقرب حلاق رجالي من موقعي ${n} متر`,
      `أقرب حلاق رجالي من موقعي ${n} متر`,
      `اقرب حلاق في نطاق ${n} متر`,
      `حلاق قريب ${n} متر`,
      `حلاق رجالي قريب ${n} متر`,
    );
  }
  return out;
}

export const FAZAA_DISTANCE_PHRASES = uniquePhrases([
  'اقرب حلاق من موقعي',
  'أقرب حلاق من موقعي',
  'اقرب حلاق رجالي من موقعي',
  'أقرب حلاق رجالي من موقعي',
  'اقرب حلاق رجالي من موقعي مفتوح الآن',
  'أقرب حلاق رجالي من موقعي مفتوح الآن',
  'اقرب حلاق رجالي من موقعي مفتوح الان',
  'أقرب حلاق رجالي من موقعي مفتوح الان',
  'اقرب حلاق من موقعي مفتوح الآن',
  'أقرب حلاق من موقعي مفتوح الآن',
  ...distancePhrasesForMeters(FAZAA_DISTANCE_METERS),
  // مسافات شائعة + مفتوح الآن
  ...[200, 500, 800, 1000].flatMap((n) => [
    `اقرب حلاق رجالي من موقعي ${n} متر مفتوح الآن`,
    `اقرب حلاق من موقعي ${n} متر مفتوح الآن`,
    `اقرب حلاق ${n} متر مفتوح الآن`,
  ]),
  ...withIntentPrefixes([
    'اقرب حلاق رجالي من موقعي',
    'اقرب حلاق من موقعي',
    'اقرب حلاق 200 متر',
    'اقرب حلاق 800 متر',
    'اقرب حلاق رجالي من موقعي مفتوح الآن',
  ]),
]);

/** كل العبارات لـ meta keywords + قسم العرض */
export const FAZAA_ALL_SEARCH_PHRASES = uniquePhrases([
  ...FAZAA_NEAR_SALON_PHRASES,
  ...FAZAA_DISTANCE_PHRASES,
  ...FAZAA_OPEN_NOW_PHRASES,
  ...FAZAA_HOME_MOBILE_PHRASES,
  ...FAZAA_CHILDREN_PHRASES,
  ...FAZAA_EN_NEAR_PHRASES,
  ...FAZAA_ORIGIN_STYLE_PHRASES,
  ...FAZAA_BEST_NEAR_CITY_PHRASES,
  ...FAZAA_MAKKAH_PHRASES,
  ...FAZAA_MADINAH_PHRASES,
]);

export const FAZAA_SEARCH_KEYWORDS_META = FAZAA_ALL_SEARCH_PHRASES.join(', ');

export const FAZAA_SEARCH_BLURB_AR =
  'إن كنت تقول أبي أو عطني أو شف لي اقرب حلاق رجالي من موقعي، أو اقرب حلاق 200 متر، أو اقرب حلاق 800 متر، أو اقرب حلاق رجالي من موقعي مفتوح الآن، أو اقرب حلاق في المدينة المنورة — فزعة حلاق ماب تبدأ استعلاماً لحظياً ضمن البيانات المتاحة على المنصة.';

function chipsHtml(phrases) {
  return phrases.map((p) => `<li><span class="phrase-chip">${p}</span></li>`).join('\n');
}

/**
 * قسم HTML غني بالعبارات — يُعرض في صفحات فزعة.
 * @param {{ compact?: boolean }} [opts]
 */
export function fazaaSearchPhrasesSectionHtml(opts = {}) {
  const compact = opts.compact === true;
  const primary = uniquePhrases([
    ...FAZAA_NEAR_SALON_PHRASES.slice(0, 10),
    ...FAZAA_DISTANCE_PHRASES.slice(0, 14),
    ...withIntentPrefixes(['حلاق قريب', 'حلاق منزلي', 'حلاق أطفال']).slice(0, 8),
    ...FAZAA_OPEN_NOW_PHRASES.slice(0, 4),
    ...FAZAA_HOME_MOBILE_PHRASES.slice(0, 4),
    ...FAZAA_CHILDREN_PHRASES.slice(0, 6),
  ]);
  if (compact) {
    return `<section class="near-phrases" aria-label="عبارات البحث الشائعة">
      <h2>تبحث عن اقرب حلاق أو حلاق قريب منك؟</h2>
      <p class="note">${FAZAA_SEARCH_BLURB_AR}</p>
      <ul class="phrase-grid">${chipsHtml(primary)}</ul>
    </section>`;
  }
  const cityPreview = FAZAA_BEST_NEAR_CITY_PHRASES.slice(0, 36);
  const homePreview = FAZAA_HOME_MOBILE_PHRASES.slice(0, 40);
  const childrenPreview = FAZAA_CHILDREN_PHRASES.slice(0, 40);
  const distancePreview = FAZAA_DISTANCE_PHRASES.slice(0, 48);
  return `<section class="near-phrases" aria-label="عبارات البحث الشائعة">
      <h2>تبحث عن اقرب حلاق أو حلاق قريب؟ أبي · عطني · شف لي</h2>
      <p class="note">${FAZAA_SEARCH_BLURB_AR}</p>
      <h3 class="phrase-sub">قرب الموقع — رجالي</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_NEAR_SALON_PHRASES.slice(0, 48))}</ul>
      <h3 class="phrase-sub">تكتيك المسافة — 100 إلى 1000 متر</h3>
      <ul class="phrase-grid">${chipsHtml(distancePreview)}</ul>
      <h3 class="phrase-sub">مفتوح الآن · 24 ساعة</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_OPEN_NOW_PHRASES)}</ul>
      <h3 class="phrase-sub">منزلي · متنقل · دليفري · مدن</h3>
      <ul class="phrase-grid">${chipsHtml(homePreview)}</ul>
      <h3 class="phrase-sub">حلاق أطفال — قرب · منزلي · أحياء</h3>
      <ul class="phrase-grid">${chipsHtml(childrenPreview)}</ul>
      <h3 class="phrase-sub">English near me</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_EN_NEAR_PHRASES)}</ul>
      <h3 class="phrase-sub">صيغ بحث شائعة بالأصل أو الأسلوب</h3>
      <p class="note">هذه صيغ يكتبها الباحثون غالباً — النتائج حسب ما يعلنه الشركاء المفعّلون داخل المنصة، وليست فلتر جنسية منفصلاً.</p>
      <ul class="phrase-grid">${chipsHtml(FAZAA_ORIGIN_STYLE_PHRASES)}</ul>
      <h3 class="phrase-sub">أفضل حلاق — مدن المنصة</h3>
      <ul class="phrase-grid">${chipsHtml(cityPreview)}</ul>
      <h3 class="phrase-sub">مكة · المدينة المنورة</h3>
      <ul class="phrase-grid">${chipsHtml([...FAZAA_MAKKAH_PHRASES, ...FAZAA_MADINAH_PHRASES])}</ul>
    </section>`;
}

export function fazaaSearchPhrasesCss() {
  return `    .near-phrases { margin: 1.5rem 0 0.5rem; }
    .phrase-sub { font-size:1rem; margin: 1.15rem 0 .55rem; color:#fbbf24; font-weight:800; }
    .phrase-grid { list-style:none; padding:0; margin:.85rem 0 0; display:flex; flex-wrap:wrap; gap:.5rem; }
    .phrase-chip {
      display:inline-block;
      padding:.4rem .75rem;
      border-radius:999px;
      border:1px solid rgba(251,191,36,.35);
      background:rgba(245,158,11,.1);
      color:#fde68a;
      font-family:"IBM Plex Sans Arabic","Segoe UI",sans-serif;
      font-weight:700;
      font-size:.82rem;
    }`;
}
