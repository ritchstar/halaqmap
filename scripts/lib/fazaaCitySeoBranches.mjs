/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 * تفرعات SEO إيجابية لكل مدينة/حي — حلول وكلمات تقود للاستعلام دون عبارات تنفير.
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** تفرعات كلمات لكل مكان — تُعرض كشرائح وروابط حلول */
export function citySolutionPhrases(placeNameAr) {
  const p = placeNameAr.trim();
  return [
    `اقرب حلاق رجالي من موقعي في ${p}`,
    `حلاق قريب مني في ${p}`,
    `حلاق قريب من موقعي في ${p}`,
    `أقرب حلاق من موقعي في ${p}`,
    `أفضل حلاقين بالقرب مني في ${p}`,
    `صالون قريب في ${p}`,
    `أقرب صالون حولي في ${p}`,
    `حلاق مفتوح الآن في ${p}`,
    `حلاق مفتوح 24 ساعة من موقعي في ${p}`,
    `حلاق يجي البيت في ${p}`,
    `عطني أقرب صالون من موقعي في ${p}`,
    `حلاق منزلي في ${p}`,
    `حلاق دليفري في ${p}`,
    `حلاق أطفال في ${p}`,
    `رقم حلاق حولي في ${p}`,
  ];
}

/**
 * قسم تفرع حلول المدينة — يرفع كثافة الكلمات العضوية بروابط حقيقية.
 * @param {{ placeNameAr: string, citySlug?: string, isNeighborhood?: boolean, cityNameAr?: string }} opts
 */
export function citySeoBranchesHtml(opts) {
  const place = opts.placeNameAr;
  const cityLabel = opts.cityNameAr || place;
  const phrases = citySolutionPhrases(place);
  const chips = phrases
    .map((t) => `<li><span class="phrase-chip">${escapeHtml(t)}</span></li>`)
    .join('\n');

  const nearPath = opts.citySlug ? `/near/${opts.citySlug}` : '/near';
  const solutions = [
    { href: '/need/near-me', label: `أقرب حلاق من موقعي — ${place}` },
    { href: '/need/home-visit', label: `حلاق منزلي ودليفري — ${place}` },
    { href: '/need/children', label: `حلاق أطفال — ${place}` },
    { href: '/need/open-now', label: `حلاق مفتوح الآن — ${place}` },
    { href: '/need/24h', label: `حلاق 24 ساعة — ${place}` },
    { href: '/need/classic-barber', label: `حلاق تقليدي — ${place}` },
    { href: '/need/mens-grooming', label: `مركز عناية بالرجل — ${place}` },
    { href: nearPath, label: `تصفّح أحياء ${cityLabel}` },
  ];

  const links = solutions
    .map(
      (s) =>
        `<li><a href="${escapeHtml(s.href)}">${escapeHtml(s.label)}</a></li>`,
    )
    .join('\n');

  return `<section class="city-branches" aria-label="تفرعات البحث في ${escapeHtml(place)}">
      <h2>حلول فزعة في ${escapeHtml(place)}</h2>
      <p class="note">اختر المسار الذي يطابق بحثك — ثم ابدأ الاستعلام من حلاق ماب حول ${escapeHtml(place)}.</p>
      <ul class="grid">${links}</ul>
      <h3 class="phrase-sub">كلمات تقودك لنتيجة في ${escapeHtml(place)}</h3>
      <ul class="phrase-grid">${chips}</ul>
    </section>`;
}

export const FAZAA_MARKETING_FOOTER_AR =
  '© حلاق ماب — ابحث من موقعك عن أقرب حلاق.';
