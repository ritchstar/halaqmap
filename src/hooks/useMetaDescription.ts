/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 */
import { useEffect } from 'react';
import { readMeta, upsertMeta } from '@/lib/seoHead';

/**
 * يضبط وصف meta/og/twitter للصفحة الحالية، ويستعيد كل وسم لقيمته الأصلية
 * الخاصة به عند المغادرة (الثلاثة مختلفة نصياً في index.html الافتراضي —
 * لا نفترض تطابقها) — يماثل useDocumentTitle. صفحة لا تستدعيه تبقى بالوصف
 * العام الافتراضي (غير خاطئ، لكن عام) — استدعاؤه حيثما توفر نص دقيق
 * (كصفحات storeProductRead.ts) يحسّن ظهور الصفحة في نتائج البحث.
 */
export function useMetaDescription(description: string | undefined | null) {
  useEffect(() => {
    if (!description) return;
    const previous = {
      description: readMeta('name', 'description'),
      og: readMeta('property', 'og:description'),
      tw: readMeta('name', 'twitter:description'),
    };
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:description', description);
    upsertMeta('name', 'twitter:description', description);
    return () => {
      if (previous.description !== null) upsertMeta('name', 'description', previous.description);
      if (previous.og !== null) upsertMeta('property', 'og:description', previous.og);
      if (previous.tw !== null) upsertMeta('name', 'twitter:description', previous.tw);
    };
  }, [description]);
}
