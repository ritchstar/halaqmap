/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * نصوص تسويق عضوي لصفحات فزعة المدن العشر — مسار حقيقي /near/{slug}.
 * ملاحظة: لا نستخدم LocalBusiness لحلاق ماب (ليست صالوناً محلياً) — الـ schema في المولّد يبقى CollectionPage + City.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

/** عمود SEO لمكة — يستهدف «أقرب حلاق مكة» مع نوايا الحج/الأحياء */
const MAKKAH_PILLAR = {
  city_name_ar: 'مكة',
  city_slug: 'makkah',
  pillar: true,
  h1: 'أقرب حلاق في مكة 🕋',
  h2: 'صالونات رجالي مفتوحة الآن في مكة 🕋 — ابحث واتصل فوراً',
  content_paragraph:
    'تبحث عن أقرب حلاق في مكة 🕋؟ حلاق ماب يسهّل عليك بدء استعلام لحظي عن صالونات رجالي قريبة ومفتوحة الآن حول مكة، مع تقييمات حقيقية واتصال مباشر بالصالون — بدون تحميل تطبيق.',
  title: 'أقرب حلاق في مكة 🕋 | صالونات مفتوحة الآن | حلاق ماب',
  description:
    'اقرب حلاق رجالي من موقعي في مكة 🕋، حلاق قريب مني، مفتوح الآن وحول الحرم والعزيزية. للحاج: حلق وتقصر عبر مركز النسك ثم ابدأ الاستعلام من فزعة حلاق ماب.',
  canonical_path: '/near/makkah',
  /** يُلحق بـ meta العام — تجنّب تكرار عبارات FAZAA_MAKKAH_PHRASES */
  keywords_extra: 'أقرب حلاق العزيزية, صالونات حول الحرم مكة, حلاق مكة المكرمة',
  sections: [
    {
      h2: 'أقرب حلاق من موقعي في مكة',
      body: 'سواء قلت أقرب حلاق مكة أو أبي حلاق قريب أو عطني أقرب صالون من موقعي — ابدأ فزعة الاستعلام من موقعك أو ضمن نطاق مكة لتظهر لك خيارات الشركاء المتاحين لحظياً، ثم اتصل بالصالون مباشرة.',
    },
    {
      h2: 'صالونات رجالي مفتوحة الآن في مكة',
      body: 'في أوقات الذروة حول الحرم والأحياء السكنية، فلتر «مفتوح الآن» يساعدك تصل لصالون رجالي متاح دون تخمين. من نفس الصفحة يمكنك التفرع لحلاق 24 ساعة أو أقرب نطاق حسب حيّك.',
    },
    {
      h2: 'حلق وتقصر وتحلل للحاج في مكة',
      body: 'إن كنت تبحث عن حلق مكة أو تقصير بعد العمرة أو حلاقة التحلل، راجع أولاً مركز نسك الحج لفهم المصطلحات، ثم ارجع هنا لبدء استعلام أقرب حلاق شريك في نطاق مكة. المنصة لا تُفتي شرعاً — الاختيار العبادي يرجع لمرجعك.',
      links: [
        { href: '/nusuk', label: 'مركز نسك الحج — الحلق والتقصير' },
        { href: '/occasions/eid-adha-shaving', label: 'بعد الأضحية — وين أحلق الآن؟' },
      ],
    },
    {
      h2: 'حلول أخرى في مكة',
      body: 'حلاق أطفال، حلاق منزلي ودليفري، أو مركز عناية بالرجل — كلها تفرعات جاهزة ثم تخصّص النطاق حول مكة.',
      links: [
        { href: '/need/near-me', label: 'أقرب حلاق من موقعي' },
        { href: '/need/open-now', label: 'حلاق مفتوح الآن' },
        { href: '/need/home-visit', label: 'حلاق منزلي ودليفري' },
        { href: '/need/children', label: 'حلاق أطفال' },
        { href: '/need/24h', label: 'حلاق 24 ساعة' },
        { href: '/need/classic-barber', label: 'حلاق تقليدي' },
      ],
    },
  ],
  faqs: [
    {
      q: 'كيف أجد أقرب حلاق في مكة من موقعي؟',
      a: 'افتح صفحة مكة ثم اضغط «ابدأ الاستعلام». حدّد موقعك أو نطاق مكة — عبارات مثل أقرب حلاق مكة أو صالون قريب مكة توصلك لخيارات الشركاء المتاحين لحظياً.',
    },
    {
      q: 'أين أبحث عن حلق أو تقصير للحاج في مكة؟',
      a: 'ابدأ من مركز نسك الحج لفهم الحلق والتقصير، ثم عد لصفحة أقرب حلاق في مكة وابدأ الاستعلام حول النطاق المناسب. حلاق ماب منصة استعلام وليست جهة إفتاء.',
    },
    {
      q: 'هل أتصفّح أحياء مكة مثل العزيزية؟',
      a: 'نعم — من هذه الصفحة اختر الحي (مثل العزيزية وغيرها) لفتح فزعة محلية أدق، ثم ابدأ الاستعلام حول ذلك الحي.',
    },
    {
      q: 'هل الصفحة تغطي صالونات مفتوحة الآن فقط؟',
      a: 'يمكنك بدء استعلام عام أو اختيار تفرع «مفتوح الآن» أو «24 ساعة» حسب حاجتك، ثم التواصل مباشرة مع الصالون الظاهر ضمن البيانات المتاحة.',
    },
  ],
  phrase_chips: [
    'أقرب حلاق مكة',
    'أقرب حلاق في مكة',
    'أقرب حلاق من موقعي مكة',
    'صالون قريب مكة',
    'حلاق مفتوح الآن مكة',
    'صالونات رجالي مكة',
    'حلق مكة',
    'تقصير مكة',
    'تحلل مكة',
    'أفضل حلاقين بالقرب مني في مكة',
  ],
};

/** المدن العشر ذات الأولوية التسويقية */
export const FAZAA_CITY_MARKETING = {
  riyadh: cityCopy('الرياض', 'riyadh'),
  jeddah: cityCopy('جدة', 'jeddah'),
  makkah: MAKKAH_PILLAR,
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

/**
 * أقسام عمود مكة — نوايا + نسك + حلول (HTML آمن).
 * @param {{ marketing: typeof MAKKAH_PILLAR }} opts
 */
export function cityPillarSectionsHtml(opts) {
  const m = opts.marketing;
  if (!m?.pillar || !Array.isArray(m.sections)) return '';

  const sections = m.sections
    .map((sec) => {
      const links =
        Array.isArray(sec.links) && sec.links.length > 0
          ? `<ul class="grid">${sec.links
              .map(
                (l) =>
                  `<li><a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a></li>`,
              )
              .join('\n')}</ul>`
          : '';
      return `<section>
      <h2>${escapeHtml(sec.h2)}</h2>
      <p>${escapeHtml(sec.body)}</p>
      ${links}
    </section>`;
    })
    .join('\n');

  const chips =
    Array.isArray(m.phrase_chips) && m.phrase_chips.length > 0
      ? `<section aria-label="كلمات بحث مكة">
      <h2>كلمات تقودك لأقرب حلاق في مكة</h2>
      <ul class="phrase-grid">${m.phrase_chips
        .map((t) => `<li><span class="phrase-chip">${escapeHtml(t)}</span></li>`)
        .join('\n')}</ul>
    </section>`
      : '';

  return `${sections}\n${chips}`;
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
    pillar: Boolean(c.pillar),
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
