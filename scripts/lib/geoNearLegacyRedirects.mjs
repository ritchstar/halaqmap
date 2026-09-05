/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * تهجئات قديمة لفهرسة قوقل — تُحوَّل إلى المسار المعتمد.
 * لا تُضاف إلى السايت ماب حتى لا تُفهرس الصفحات البديلة.
 */

/** تهجئات يدوية لا يغطيها توسيع al- تلقائياً */
export const GEO_NEAR_LEGACY_REDIRECTS_MANUAL = [
  { from: '/near/riyadh/maathar', to: '/near/riyadh/maather' },
  { from: '/near/riyadh/al-maather', to: '/near/riyadh/maather' },
  { from: '/near/riyadh/al-maathar', to: '/near/riyadh/maather' },
  { from: '/near/riyadh/manfuha', to: '/near/riyadh/hittin' },
];

/** @deprecated استخدم expandGeoNearLegacyRedirects */
export const GEO_NEAR_LEGACY_REDIRECTS = GEO_NEAR_LEGACY_REDIRECTS_MANUAL;

function nodePath(node) {
  return `/near/${[...node.parentSlugs, node.slug].join('/')}`;
}

/**
 * يوسّع التحويلات اليدوية بـ al-{slug} لكل حي، مع منع التكرار.
 * @param {Array<{ kind: string, slug: string, parentSlugs: string[] }>} nodes
 */
export function expandGeoNearLegacyRedirects(nodes) {
  const out = [...GEO_NEAR_LEGACY_REDIRECTS_MANUAL];
  const seenFrom = new Set(out.map((row) => row.from));

  for (const node of nodes) {
    if (node.kind !== 'neighborhood') continue;
    const to = nodePath(node);
    const slug = String(node.slug || '').trim();
    if (!slug || slug.startsWith('al-')) continue;
    const from = to.replace(/\/([^/]+)$/, '/al-$1');
    if (seenFrom.has(from) || from === to) continue;
    seenFrom.add(from);
    out.push({ from, to });
  }

  return out;
}
