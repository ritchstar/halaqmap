/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * نصوص تسويق عضوي لصفحات فزعة المدن العشر — مسار حقيقي /near/{slug}.
 * ملاحظة: لا نستخدم LocalBusiness لحلاق ماب (ليست صالوناً محلياً) — الـ schema في المولّد يبقى CollectionPage + City.
 */

function cityCopy(nameAr, slug) {
  return {
    city_name_ar: nameAr,
    city_slug: slug,
    h1: `صالونات حلاقة رجالي في ${nameAr}`,
    h2: `صالونات رجالي مفتوحة الآن في ${nameAr} – ابحث واتصل فوراً`,
    content_paragraph: `لم يعد البحث عن أقرب حلاق في ${nameAr} أمراً مرهقاً. حلاق ماب يجمع لك أفضل صالونات رجالي مفتوحة الآن في ${nameAr}، مزوداً بتقييمات حقيقية لمساعدتك في الاختيار، مع اتصال مباشر بالصالون المناسب وبدون تحميل تطبيق.`,
    title: `صالونات حلاقة رجالي في ${nameAr} | أقرب حلاق من موقعي | حلاق ماب`,
    description: `صالونات رجالي مفتوحة الآن في ${nameAr} — أقرب حلاق من موقعي، صالون قريب، أقرب صالون حولي عبر فزعة حلاق ماب. ابحث واتصل فوراً.`,
    canonical_path: `/near/${slug}`,
  };
}

/** المدن العشر ذات الأولوية التسويقية */
export const FAZAA_CITY_MARKETING = {
  riyadh: cityCopy('الرياض', 'riyadh'),
  jeddah: cityCopy('جدة', 'jeddah'),
  makkah: cityCopy('مكة', 'makkah'),
  madinah: cityCopy('المدينة', 'madinah'),
  dammam: cityCopy('الدمام', 'dammam'),
  khobar: cityCopy('الخبر', 'khobar'),
  taif: cityCopy('الطائف', 'taif'),
  abha: cityCopy('أبها', 'abha'),
  tabuk: cityCopy('تبوك', 'tabuk'),
  ahsa: cityCopy('الأحساء', 'ahsa'),
};

export function getFazaaCityMarketing(slug) {
  return FAZAA_CITY_MARKETING[slug] || null;
}

/** JSON جاهز للنسخ/المعاينة — نفس شكل الطلب مع مسار صحيح */
export function exportFazaaCityMarketingJsonList() {
  return Object.values(FAZAA_CITY_MARKETING).map((c) => ({
    city_name_ar: c.city_name_ar,
    city_slug: c.city_slug,
    h1: c.h1,
    h2: c.h2,
    content_paragraph: c.content_paragraph,
    title: c.title,
    description: c.description,
    url: `https://www.halaqmap.com${c.canonical_path}`,
    /** schema آمن للمنصة — ليس LocalBusiness */
    schema_hint: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: c.h1,
      url: `https://www.halaqmap.com${c.canonical_path}`,
      about: { '@type': 'City', name: c.city_name_ar },
      isPartOf: {
        '@type': 'WebApplication',
        name: 'حلاق ماب',
        url: 'https://www.halaqmap.com/',
      },
    },
  }));
}
