/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * قسم "مثال توضيحي" أسفل صفحة هبوط كل منتج — سيناريو افتراضي يشرح أثر
 * التشغيل الصحيح تشغيلياً وتسويقياً. يحل محل قسم التقييمات العام المُخفى
 * مؤقتاً (راجع src/config/storeReviews.ts). مُسمّى ومُنوَّه عنه صراحة كمثال
 * توضيحي افتراضي — ليس تقييماً أو شهادة عميل حقيقية.
 */
import {
  STORE_SUCCESS_STORIES,
  STORE_SUCCESS_STORY_DISCLAIMER_AR,
  STORE_SUCCESS_STORY_INTRO_AR,
  STORE_SUCCESS_STORY_LABEL_AR,
  type StoreSuccessStoryProductKey,
} from '@/config/storeSuccessStories';

export function StoreHypotheticalSuccessStory({ productKey }: { productKey: StoreSuccessStoryProductKey }) {
  const story = STORE_SUCCESS_STORIES[productKey];
  if (!story) return null;
  const accent = story.accent;
  return (
    <section className="px-4 pb-14">
      <div
        className="mx-auto max-w-3xl rounded-2xl border p-5"
        style={{ borderColor: `${accent}4d`, background: 'rgba(6,16,24,0.55)' }}
      >
        <span
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold"
          style={{ borderColor: `${accent}66`, color: accent }}
        >
          {STORE_SUCCESS_STORY_LABEL_AR}
        </span>
        <h3 className="mt-3 text-lg font-extrabold text-[#f4efe4]">{story.titleAr}</h3>
        <p className="mt-2 text-sm leading-7 text-white/70">{STORE_SUCCESS_STORY_INTRO_AR}</p>
        <div className="mt-3 space-y-3 text-sm leading-8 text-white/80">
          {story.bodyParagraphsAr.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-white/45">{STORE_SUCCESS_STORY_DISCLAIMER_AR}</p>
      </div>
    </section>
  );
}
