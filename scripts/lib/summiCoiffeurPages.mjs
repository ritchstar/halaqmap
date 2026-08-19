/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * سمي — عائلة صفحات نوايا كوافير ماب (الموجة الأولى).
 * محور + ثماني نوايا فقط. بلا أحياء وبلا وعد تغطية وبلا أعداد مشاغل.
 */
export const SUMMI_PROGRAM_AR = 'سمي';
export const SUMMI_BRAND_AR = 'كوافير ماب';
export const SUMMI_CORE_AR = 'حلاق ماب';
export const SUMMI_ORIGIN = 'https://coiffeur.halaqmap.com';
export const SUMMI_HUB_PATH = '/summi';
export const SUMMI_INQUIRE_HASH = '/#/coiffeur/need';
export const SUMMI_CTA_AR = 'ابحثي من موقعك';
export const SUMMI_LOGO_ABS = `${SUMMI_ORIGIN}/images/coiffeur-map-logo-seal-512.webp`;

export const SUMMI_HONESTY_AR =
  'نعرض المشاغل النسائية المفعّلة لدى شريكات المنصة في محيطك. إن لم يُسكَّن مشغل بعد في نطاقك، تبقين جاهزة للظهور عند أول تسكين.';

export const SUMMI_FREE_AR =
  'الاستعلام مجاني بلا تطبيق وبلا حساب. لا يُدرج رقمك أو بريدك من أجل البحث. التحصيل من صاحبات المشاغل فقط.';

function uniqueList(parts) {
  const seen = new Set();
  const out = [];
  for (const raw of parts) {
    const p = String(raw || '').trim();
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push(p);
  }
  return out;
}

export function summiPath(slug) {
  const key = String(slug || '').trim();
  return key ? `${SUMMI_HUB_PATH}/${key}` : SUMMI_HUB_PATH;
}

export function summiInquireHref(intentId) {
  const id = String(intentId || '').trim();
  const base = `${SUMMI_ORIGIN}${SUMMI_INQUIRE_HASH}`;
  return id ? `${base}?intent=${encodeURIComponent(id)}` : base;
}

export function normalizeSummiPath(path) {
  const raw = String(path || '').trim();
  if (!raw) return SUMMI_HUB_PATH;
  const noOrigin = raw.replace(/^https?:\/\/[^/]+/i, '');
  const withSlash = noOrigin.startsWith('/') ? noOrigin : `/${noOrigin}`;
  if (withSlash.length > 1 && withSlash.endsWith('/')) return withSlash.slice(0, -1);
  return withSlash;
}

/** النوايا الثماني المعتمدة في استعلام كوافير ماب — بلا مدن */
export const SUMMI_INTENT_PAGES = [
  {
    slug: 'near-me',
    intentId: 'near_open',
    h1: 'أقرب كوافير من موقعك',
    title: 'أقرب كوافير · مشغل قريب · مصففة شعر | كوافير ماب',
    description:
      'ابحثي من موقعك عن كوافير أو مشغل أو مصففة شعر قريبة. كوافير ماب تعرض المشاغل النسائية المفعّلة في محيطك — بلا تطبيق وبلا حساب.',
    lead: 'تبحثين عن كوافير أو مشغل قريب؟ اضغطي البحث واسمحي بالموقع. نعرض النتائج المفعّلة في نطاقك فقط.',
    aliases: [
      'أقرب كوافير',
      'كوافير قريب',
      'كوافير قريب مني',
      'مشغل قريب',
      'مشغل تجميل قريب',
      'مصففة شعر قريبة',
      'صالون نسائي قريب',
      'أقرب مشغل',
      'كوافير حولي',
      'مشغل حولي',
    ],
  },
  {
    slug: 'coiffeur',
    intentId: 'coiffeur',
    h1: 'كوافير نسائي قريب',
    title: 'كوافير نسائي قريب مني | كوافير ماب',
    description:
      'ابحثي من موقعك عن كوافير نسائي قريب. تظهر المشاغل المفعّلة بنرات بالاسم والصور ورقم التواصل، وزر يفتح الخرائط.',
    lead: 'نية البحث: كوافير نسائي. اسمحي بالموقع لنعرض المفعّلات في محيطك.',
    aliases: ['كوافير نسائي', 'كوافير نسائي قريب', 'صالون كوافير قريب', 'كوافيرة قريبة'],
  },
  {
    slug: 'beauty-salon',
    intentId: 'beauty_salon',
    h1: 'مشغل تجميل قريب',
    title: 'مشغل تجميل قريب مني | كوافير ماب',
    description:
      'ابحثي من موقعك عن مشغل تجميل قريب. كوافير ماب تعرض المشاغل النسائية المفعّلة فقط — بلا تسجيل وبلا تحميل تطبيق.',
    lead: 'نية البحث: مشغل تجميل. اضغطي البحث واسمحي بالموقع.',
    aliases: ['مشغل تجميل', 'مشغل تجميل قريب', 'صالون تجميل نسائي', 'مشغل نسائي قريب'],
  },
  {
    slug: 'spa',
    intentId: 'spa',
    h1: 'سبا ومساج قريب',
    title: 'سبا نسائي قريب · مساج | كوافير ماب',
    description:
      'ابحثي من موقعك عن سبا أو مساج نسائي قريب. النتائج المعروضة هي الشريكات المفعّلة في محيطك.',
    lead: 'نية البحث: سبا ومساج. اسمحي بالموقع لنحدد محيطك فقط.',
    aliases: ['سبا نسائي', 'سبا قريب', 'مساج نسائي قريب', 'سبا ومساج'],
  },
  {
    slug: 'makeup',
    intentId: 'makeup',
    h1: 'مكياج وسهرات قريب',
    title: 'مكياج سهرات قريب مني | كوافير ماب',
    description:
      'ابحثي من موقعك عن مكياج وسهرات. تظهر المستعلمة المشاغل المفعّلة في نطاقها، ثم تتجه عبر الخرائط.',
    lead: 'نية البحث: مكياج وسهرات. اضغطي البحث واسمحي بالموقع.',
    aliases: ['مكياج', 'مكياج سهرات', 'مكياج قريب', 'فنانة مكياج قريبة'],
  },
  {
    slug: 'nails',
    intentId: 'nails',
    h1: 'عناية أظافر قريبة',
    title: 'عناية أظافر قريبة مني | كوافير ماب',
    description:
      'ابحثي من موقعك عن عناية أظافر. كوافير ماب مجانية للمستعلمة وتعرض النتائج المفعّلة فقط.',
    lead: 'نية البحث: عناية أظافر. اسمحي بالموقع مرة واحدة.',
    aliases: ['عناية أظافر', 'أظافر قريبة', 'مانيكير قريب', 'مشغل أظافر'],
  },
  {
    slug: 'skin',
    intentId: 'skin',
    h1: 'عناية بشرة قريبة',
    title: 'عناية بشرة قريبة مني | كوافير ماب',
    description:
      'ابحثي من موقعك عن عناية بشرة. تظهر المشاغل المفعّلة بالاسم والصور ورقم التواصل الذي اختارت صاحبته إظهاره.',
    lead: 'نية البحث: عناية بشرة. اضغطي البحث واسمحي بالموقع.',
    aliases: ['عناية بشرة', 'بشرة قريبة', 'عناية بشرة نسائية', 'مشغل بشرة'],
  },
  {
    slug: 'independents',
    intentId: 'independents',
    h1: 'مستقلات تجميل قريبات',
    title: 'مستقلات تجميل قريبات | كوافير ماب',
    description:
      'ابحثي من موقعك عن مستقلات تجميل مفعّلات في كوافير ماب. بلا تطبيق وبلا حساب للمستعلمة.',
    lead: 'نية البحث: مستقلات. نعرض المفعّلات في محيطك عند توفر تسكين.',
    aliases: ['مستقلات', 'كوافيرة مستقلة', 'مستقلة تجميل', 'عمل حر تجميل'],
  },
].map((page) => ({
  ...page,
  path: summiPath(page.slug),
  aliases: uniqueList(page.aliases),
  keywords: uniqueList(page.aliases).join('، '),
}));

export const SUMMI_HUB = {
  path: SUMMI_HUB_PATH,
  h1: 'أقرب كوافير من موقعك',
  title: 'أقرب كوافير · مشغل تجميل · مصففة شعر | كوافير ماب',
  description:
    'سمي من كوافير ماب: ابحثي من موقعك عن كوافير أو مشغل أو مصففة شعر. بلا تطبيق وبلا حساب. نعرض المشاغل النسائية المفعّلة فقط.',
  lead: 'اختاري حاجتك أو اضغطي البحث مباشرة. الموقع يُستخدم لتحديد محيطك، ثم تظهر بنرات الشريكات المفعّلة.',
};

export function findSummiPageBySlug(slug) {
  const key = String(slug || '')
    .trim()
    .toLowerCase();
  return SUMMI_INTENT_PAGES.find((p) => p.slug === key) ?? null;
}

export function findSummiPageByPath(path) {
  const normalized = normalizeSummiPath(path);
  if (normalized === SUMMI_HUB_PATH) return null;
  const slug = normalized.slice(SUMMI_HUB_PATH.length + 1);
  return findSummiPageBySlug(slug);
}

export function summiIntentBySlug(slug) {
  return findSummiPageBySlug(slug)?.intentId ?? null;
}
