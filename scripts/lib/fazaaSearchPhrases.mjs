/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * عبارات بحث تنافسية لصفحات فزعة — مصدر واحد للعربية/الإنجليزية.
 */

/** قرب الموقع والصالون */
export const FAZAA_NEAR_SALON_PHRASES = [
  'أقرب حلاق من موقعي',
  'أبي حلاق قريب',
  'عطني أقرب حلاق',
  'ابحث لي عن أقرب حلاق',
  'أقرب حلاق',
  'حلاق قريب',
  'صالون قريب',
  'صالون حلاقة',
  'أقرب صالون حلاقة',
  'أقرب صالون حولي',
  'صالونات الحارة',
  'صالونات الحي',
  'اطلب صالون',
  'صالون جنبي',
  'صالون بقربي',
  'عطني أقرب صالون حولي',
  'عطني أقرب صالون من موقعي',
  'رقم حلاق حولي',
  'أفضل حلاقين بالقرب مني',
];

/** منزلي / متنقل / دليفري */
export const FAZAA_HOME_MOBILE_PHRASES = [
  'حلاق دليفري',
  'barber delivery',
  'delivery barber',
  'حلاق متنقل',
  'حلاق متنقل في منزلك',
  'حلاق يجيك لبيتك',
  'حلاق يجيك البيت',
  'حلاق منزلي',
  'حلاق منزلي بالرياض',
  'حلاق منزلي في الرياض',
  'حلاق أطفال منزلي',
];

/** أصول شائعة في صياغة البحث (ليست فلتر جنسية في المنصة) */
export const FAZAA_ORIGIN_STYLE_PHRASES = [
  'حلاق محترف',
  'حلاق مصري',
  'حلاق تركي',
  'حلاق باكستاني',
  'حلاق سوري',
  'حلاق تونسي',
  'حلاق فلبيني',
  'حلاق هندي',
];

/** أفضل حلاقين بالقرب مني — مدن محورية */
export const FAZAA_BEST_NEAR_CITY_PHRASES = [
  'أفضل حلاقين بالقرب مني في الرياض',
  'أفضل حلاقين بالقرب مني في جدة',
  'أفضل حلاقين بالقرب مني في مكة',
  'أفضل حلاقين بالقرب مني في الدمام',
  'أفضل حلاقين بالقرب مني في المدينة',
  'أفضل حلاقين بالقرب مني في الخبر',
];

/** كل العبارات لـ meta keywords + قسم العرض */
export const FAZAA_ALL_SEARCH_PHRASES = [
  ...FAZAA_NEAR_SALON_PHRASES,
  ...FAZAA_HOME_MOBILE_PHRASES,
  ...FAZAA_ORIGIN_STYLE_PHRASES,
  ...FAZAA_BEST_NEAR_CITY_PHRASES,
];

export const FAZAA_SEARCH_KEYWORDS_META = FAZAA_ALL_SEARCH_PHRASES.join(', ');

export const FAZAA_SEARCH_BLURB_AR =
  'إن كنت تبحث عن أقرب حلاق من موقعك، أو صالون قريب، أو أقرب صالون حولي، أو حلاق دليفري وbarber delivery، أو حلاق متنقل يجيك البيت، أو حلاق أطفال منزلي، أو تقول عطني أقرب صالون من موقعي — فزعة حلاق ماب تبدأ استعلاماً لحظياً ضمن البيانات المتاحة على المنصة.';

function chipsHtml(phrases) {
  return phrases.map((p) => `<li><span class="phrase-chip">${p}</span></li>`).join('\n');
}

/**
 * قسم HTML غني بالعبارات — يُعرض في صفحات فزعة.
 * @param {{ compact?: boolean }} [opts]
 */
export function fazaaSearchPhrasesSectionHtml(opts = {}) {
  const compact = opts.compact === true;
  const primary = [
    ...FAZAA_NEAR_SALON_PHRASES.slice(0, 12),
    ...FAZAA_HOME_MOBILE_PHRASES.slice(0, 8),
  ];
  if (compact) {
    return `<section class="near-phrases" aria-label="عبارات البحث الشائعة">
      <h2>تبحث عن أقرب حلاق أو صالون قريب؟</h2>
      <p class="note">${FAZAA_SEARCH_BLURB_AR}</p>
      <ul class="phrase-grid">${chipsHtml(primary)}</ul>
    </section>`;
  }
  return `<section class="near-phrases" aria-label="عبارات البحث الشائعة">
      <h2>تبحث عن أقرب حلاق من موقعك أو صالون قريب؟</h2>
      <p class="note">${FAZAA_SEARCH_BLURB_AR}</p>
      <h3 class="phrase-sub">قرب الموقع والصالون</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_NEAR_SALON_PHRASES)}</ul>
      <h3 class="phrase-sub">منزلي · متنقل · دليفري</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_HOME_MOBILE_PHRASES)}</ul>
      <h3 class="phrase-sub">صيغ بحث شائعة بالأصل أو الأسلوب</h3>
      <p class="note">هذه صيغ يكتبها الباحثون غالباً — النتائج حسب ما يعلنه الشركاء المفعّلون داخل المنصة، وليست فلتر جنسية منفصلاً.</p>
      <ul class="phrase-grid">${chipsHtml(FAZAA_ORIGIN_STYLE_PHRASES)}</ul>
      <h3 class="phrase-sub">أفضل حلاقين بالقرب مني — مدن</h3>
      <ul class="phrase-grid">${chipsHtml(FAZAA_BEST_NEAR_CITY_PHRASES)}</ul>
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
